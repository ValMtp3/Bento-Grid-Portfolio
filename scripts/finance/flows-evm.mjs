// Historique des mouvements d'une adresse EVM, via Blockscout.
//
// Trois listes sont necessaires : les transactions (natif envoye ou recu
// directement), les appels internes (natif recu d'un contrat, typiquement un
// routeur de swap) et les transferts de jetons. Une seule manquante ferait
// passer chaque swap pour un depot ou un retrait.

import { EVM_CHAINS, fromBaseUnits } from './chains.mjs';
import { withRetry } from './collect.mjs';
import { fetchJson } from './http.mjs';

// Les explorateurs gratuits repondent 429 ou 502 de temps en temps : un hoquet
// ne doit pas masquer la performance crypto pour six heures.
const retryingFetch = (url) => withRetry(() => fetchJson(url));

// Au-dela, l'historique est juge incomplet : mieux vaut masquer la performance
// crypto que la calculer sur une partie des mouvements.
const MAX_PAGES = 20;
const NATIVE_DECIMALS = 18;

const items = (payload) => (Array.isArray(payload?.items) ? payload.items : []);

// +1 entree, -1 sortie, 0 sans rapport ou envoi a soi-meme.
const direction = (item, owner) => {
  const from = item?.from?.hash?.toLowerCase();
  const to = item?.to?.hash?.toLowerCase();
  if (from === to) return 0;
  if (to === owner) return 1;
  if (from === owner) return -1;
  return 0;
};

const nativeFlow = (item, owner, chainName) => {
  const sign = direction(item, owner);
  const amount = fromBaseUnits(item?.value, NATIVE_DECIMALS);
  const time = Date.parse(item?.timestamp);
  if (sign === 0 || amount <= 0 || Number.isNaN(time)) return null;

  const symbol = EVM_CHAINS[chainName].symbol;
  return { time, key: symbol, symbol, contract: null, platform: null, amount: sign * amount };
};

export const parseEvmTransactions = (payload, address, chainName) =>
  items(payload)
    .filter((item) => item?.status === 'ok')
    .map((item) => nativeFlow(item, address.toLowerCase(), chainName))
    .filter(Boolean);

// L'appel racine (index 0) reprend la transaction deja comptee : le garder
// doublerait chaque envoi.
export const parseEvmInternal = (payload, address, chainName) =>
  items(payload)
    .filter((item) => item?.success !== false && item?.index !== 0)
    .map((item) => nativeFlow(item, address.toLowerCase(), chainName))
    .filter(Boolean);

export const parseEvmTokenTransfers = (payload, address, chainName) => {
  const owner = address.toLowerCase();

  return items(payload)
    .map((item) => {
      const contract = item?.token?.address_hash ?? item?.token?.address ?? null;
      const sign = direction(item, owner);
      const amount = fromBaseUnits(item?.total?.value, item?.total?.decimals ?? item?.token?.decimals);
      const time = Date.parse(item?.timestamp);
      if (!contract || sign === 0 || amount <= 0 || Number.isNaN(time)) return null;

      return {
        time,
        key: contract.toLowerCase(),
        symbol: item?.token?.symbol ?? contract,
        contract,
        platform: chainName,
        amount: sign * amount,
      };
    })
    .filter(Boolean);
};

const readPages = async (url, fetch, maxPages) => {
  const pages = [];
  let query = '';

  for (let page = 0; page < maxPages; page += 1) {
    const separator = url.includes('?') ? '&' : '?';
    const payload = await fetch(query ? `${url}${separator}${query}` : url);
    pages.push(payload);

    const next = payload?.next_page_params;
    if (!next) return { pages, truncated: false };
    query = new URLSearchParams(next).toString();
  }

  return { pages, truncated: true };
};

/**
 * Tous les mouvements d'une adresse sur une chaine. Une erreur reseau est
 * propagee : un historique partiel ne se distingue pas d'un historique court.
 */
export const readEvmFlows = async (address, chainName, { fetch = retryingFetch, maxPages = MAX_PAGES } = {}) => {
  const host = EVM_CHAINS[chainName]?.host;
  if (!host) throw new Error(`${chainName} : pas d'explorateur pour lire l'historique`);

  const base = `${host}/api/v2/addresses/${address}`;
  const [transactions, internal, tokens] = await Promise.all([
    readPages(`${base}/transactions`, fetch, maxPages),
    readPages(`${base}/internal-transactions`, fetch, maxPages),
    readPages(`${base}/token-transfers?type=ERC-20`, fetch, maxPages),
  ]);

  return {
    flows: [
      ...transactions.pages.flatMap((payload) => parseEvmTransactions(payload, address, chainName)),
      ...internal.pages.flatMap((payload) => parseEvmInternal(payload, address, chainName)),
      ...tokens.pages.flatMap((payload) => parseEvmTokenTransfers(payload, address, chainName)),
    ],
    truncated: transactions.truncated || internal.truncated || tokens.truncated,
  };
};
