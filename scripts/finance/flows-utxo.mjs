// Historique Bitcoin et Dogecoin. Ces deux reseaux ne tiennent pas de compte
// avec un solde mais des recus (UTXO) : le mouvement net d'une transaction est
// ce qu'elle verse a l'adresse moins ce qu'elle y depense, monnaie rendue
// comprise.

import { fetchJson } from './http.mjs';

const UNITS_PER_COIN = 100_000_000;
const ESPLORA = 'https://blockstream.info/api';
// Taille de page fixe d'Esplora : une page plus courte est la derniere.
const ESPLORA_PAGE_SIZE = 25;
// 40 pages de 25 = 1000 transactions : au-dela, le job devient trop long.
const MAX_BITCOIN_PAGES = 40;
const BLOCKCYPHER = 'https://api.blockcypher.com/v1/doge/main';
const BLOCKCYPHER_LIMIT = 2000;

const coinFlow = (symbol, time, units) => ({
  time,
  key: symbol,
  symbol,
  contract: null,
  platform: null,
  amount: units / UNITS_PER_COIN,
});

const sumTo = (entries, address, pick) =>
  (entries ?? [])
    .map(pick)
    .filter((output) => output?.scriptpubkey_address === address)
    .reduce((sum, output) => sum + (Number(output.value) || 0), 0);

export const parseBitcoinTransactions = (txs, address) =>
  (Array.isArray(txs) ? txs : [])
    .filter((tx) => tx?.status?.confirmed && Number.isFinite(tx.status.block_time))
    .map((tx) => {
      const received = sumTo(tx.vout, address, (output) => output);
      const spent = sumTo(tx.vin, address, (input) => input?.prevout);
      return coinFlow('BTC', tx.status.block_time * 1000, received - spent);
    })
    .filter((flow) => flow.amount !== 0);

export const readBitcoinFlows = async (address, { fetch = fetchJson, maxPages = MAX_BITCOIN_PAGES } = {}) => {
  const txs = [];
  let url = `${ESPLORA}/address/${address}/txs/chain`;

  for (let page = 0; page < maxPages; page += 1) {
    const batch = await fetch(url);
    if (!Array.isArray(batch)) {
      throw new Error('Esplora : reponse inattendue pour l historique');
    }
    txs.push(...batch);

    if (batch.length < ESPLORA_PAGE_SIZE) {
      return { flows: parseBitcoinTransactions(txs, address), truncated: false };
    }
    url = `${ESPLORA}/address/${address}/txs/chain/${batch.at(-1).txid}`;
  }

  return { flows: parseBitcoinTransactions(txs, address), truncated: true };
};

export const parseDogecoinTxrefs = (payload) => {
  const totals = new Map();

  for (const ref of payload?.txrefs ?? []) {
    const time = Date.parse(ref?.confirmed);
    if (!ref?.tx_hash || Number.isNaN(time)) continue;

    // tx_input_n >= 0 : la ligne depense un recu de l'adresse, donc une sortie.
    const sign = ref.tx_input_n >= 0 ? -1 : 1;
    const current = totals.get(ref.tx_hash) ?? { time, units: 0 };
    totals.set(ref.tx_hash, { ...current, units: current.units + sign * (Number(ref.value) || 0) });
  }

  return [...totals.values()]
    .map((entry) => coinFlow('DOGE', entry.time, entry.units))
    .filter((flow) => flow.amount !== 0);
};

/**
 * Un seul appel : BlockCypher rend jusqu'a 2000 lignes et signale la suite
 * par hasMore. Le secours BitPay ne fournit pas d'historique comparable.
 */
export const readDogecoinFlows = async (address, { fetch = fetchJson } = {}) => {
  const payload = await fetch(`${BLOCKCYPHER}/addrs/${address}?limit=${BLOCKCYPHER_LIMIT}`);
  if (Array.isArray(payload) || typeof payload !== 'object' || payload === null) {
    throw new Error('BlockCypher : reponse inattendue pour l historique');
  }
  if ('txrefs' in payload && !Array.isArray(payload.txrefs)) {
    throw new Error('BlockCypher : reponse inattendue pour l historique');
  }
  return { flows: parseDogecoinTxrefs(payload), truncated: Boolean(payload?.hasMore) };
};
