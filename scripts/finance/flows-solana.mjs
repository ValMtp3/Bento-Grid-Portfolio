// Historique Solana, via le RPC officiel.
//
// Le RPC ne fournit pas de liste de transferts : on relit chaque transaction et
// on compare les soldes avant / apres. Cette lecture par ecart couvre d'un coup
// les envois, les swaps et le staking liquide.
//
// Un jeton recu arrive sur un compte de jetons, pas sur le wallet : ces comptes
// sont donc lus aussi, sinon un depot d'USDC depuis une plateforme passerait
// inapercu.

import { SOLANA_RPC, SOLANA_TOKEN_PROGRAMS } from './chains.mjs';
import { withRetry } from './collect.mjs';
import { fetchJson } from './http.mjs';
import { STAKE_PROGRAM } from './staking.mjs';

const LAMPORTS_PER_SOL = 1_000_000_000;
const SIGNATURES_PAGE = 1000;
// Au-dela, le job deviendrait trop long pour le RPC public : l'historique est
// juge incomplet et la performance crypto masquee.
const MAX_TRANSACTIONS = 1500;
// Le RPC public limite le debit par IP : un vrai lancement a recu des 429 avec
// une pause de 200 ms entre deux appels.
const PAUSE_MS = 300;
// Les sommes de flottants laissent des residus du type 1e-17.
const DUST = 1e-12;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const defaultCall = (method, params) =>
  withRetry(async () => {
    const response = await fetchJson(SOLANA_RPC, { body: { jsonrpc: '2.0', id: 1, method, params } });
    // Le RPC renvoie ses refus en HTTP 200 avec un champ error.
    if (response?.error) throw new Error(`Solana ${method} : ${response.error.message ?? 'erreur'}`);
    return response?.result;
  });

const tokenDeltas = (meta, address) => {
  const totals = new Map();
  const add = (balances, sign) => {
    for (const balance of balances ?? []) {
      if (balance?.owner !== address || !balance?.mint) continue;
      const amount = Number(balance.uiTokenAmount?.uiAmountString ?? balance.uiTokenAmount?.uiAmount ?? 0);
      totals.set(balance.mint, (totals.get(balance.mint) ?? 0) + sign * (Number.isFinite(amount) ? amount : 0));
    }
  };

  add(meta?.preTokenBalances, -1);
  add(meta?.postTokenBalances, 1);
  return [...totals].filter(([, amount]) => Math.abs(amount) > DUST);
};

export const parseSolanaTransaction = (result, address) => {
  const meta = result?.meta;
  const time = Number(result?.blockTime) * 1000;
  if (!meta || meta.err || !Number.isFinite(time)) return [];

  const message = result?.transaction?.message ?? {};
  const keys = (message.accountKeys ?? []).map((key) => (typeof key === 'string' ? key : key?.pubkey));
  const instructions = [
    ...(message.instructions ?? []),
    ...(meta.innerInstructions ?? []).flatMap((group) => group?.instructions ?? []),
  ];
  const touchesStake = instructions.some(
    (instruction) => (instruction?.programId ?? keys[instruction?.programIdIndex]) === STAKE_PROGRAM,
  );

  const tokens = tokenDeltas(meta, address).map(([mint, amount]) => ({
    time,
    key: mint.toLowerCase(),
    symbol: mint,
    contract: mint,
    platform: 'solana',
    amount,
  }));

  // Staking natif sans jeton en retour : le SOL reste a soi, ce n'est ni un
  // depot ni un retrait.
  const index = keys.indexOf(address);
  if (index < 0 || (touchesStake && tokens.length === 0)) return tokens;

  // Le payeur des frais est toujours le premier compte : les frais sont une
  // perte, pas un retrait, on les rajoute au mouvement. Mais si le solde n'a
  // pas du tout bouge, il n'y a rien a corriger : rajouter les frais ferait
  // apparaitre un mouvement fantome d'exactement leur montant sur une
  // transaction qui n'en comporte pas (ex. un echange de jetons pur).
  const rawDelta = (Number(meta.postBalances?.[index]) || 0) - (Number(meta.preBalances?.[index]) || 0);
  if (rawDelta === 0) return tokens;

  const fee = index === 0 ? Number(meta.fee) || 0 : 0;
  const lamports = rawDelta + fee;
  if (lamports === 0) return tokens;

  return [
    { time, key: 'SOL', symbol: 'SOL', contract: null, platform: null, amount: lamports / LAMPORTS_PER_SOL },
    ...tokens,
  ];
};

const tokenAccounts = async (address, call) => {
  const accounts = [];
  for (const programId of SOLANA_TOKEN_PROGRAMS) {
    const result = await call('getTokenAccountsByOwner', [address, { programId }, { encoding: 'jsonParsed' }]);
    // Une reponse sans tableau value ne doit jamais se lire comme "aucun
    // compte de jetons" : ce serait un historique tronque sans le moindre
    // signal.
    if (!Array.isArray(result?.value)) throw new Error('Solana getTokenAccountsByOwner : reponse inattendue');
    accounts.push(...result.value.map((entry) => entry?.pubkey).filter(Boolean));
  }
  return accounts;
};

// Ajoute a `signatures` toutes les signatures reussies d'un compte.
const readSignatures = async (account, call, signatures) => {
  let before;
  for (;;) {
    const page = await call('getSignaturesForAddress', [
      account,
      { limit: SIGNATURES_PAGE, ...(before ? { before } : {}) },
    ]);
    // Une reponse qui n'est pas un tableau ne doit jamais se lire comme une
    // derniere page vide : ce serait un historique tronque sans le moindre
    // signal.
    if (!Array.isArray(page)) throw new Error('Solana getSignaturesForAddress : reponse inattendue');
    for (const entry of page) {
      if (entry?.signature && entry.err === null) signatures.add(entry.signature);
    }

    if (page.length < SIGNATURES_PAGE) return;
    before = page.at(-1).signature;
  }
};

/**
 * Comptes de jetons du wallet cites par une transaction. getTokenAccountsByOwner
 * ne rend que les comptes encore ouverts : un compte ferme depuis n'apparait
 * qu'ici, et un depot recu dessus ne cite pas forcement le wallet.
 */
export const ownedTokenAccounts = (result, address) => {
  const keys = (result?.transaction?.message?.accountKeys ?? [])
    .map((key) => (typeof key === 'string' ? key : key?.pubkey));
  const balances = [...(result?.meta?.preTokenBalances ?? []), ...(result?.meta?.postTokenBalances ?? [])];
  return [...new Set(
    balances
      .filter((balance) => balance?.owner === address)
      .map((balance) => keys[balance.accountIndex])
      .filter(Boolean),
  )];
};

const readTransaction = async (signature, call) => {
  const result = await call('getTransaction', [
    signature,
    { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0, commitment: 'finalized' },
  ]);
  // Une transaction signalee par getSignaturesForAddress mais introuvable
  // ici signifie que le noeud ne peut pas la servir : l'historique est
  // incomplet, ce n'est pas une transaction sans mouvement.
  if (result === null || result === undefined) throw new Error('Solana getTransaction : transaction indisponible');
  return result;
};

// Liste de travail : chaque vague lit les signatures des comptes nouveaux, puis
// les transactions encore jamais lues, qui peuvent reveler d'autres comptes.
// Elle s'arrete quand plus aucun compte n'apparait ; le plafond porte sur le
// total des transactions, comptes decouverts compris.
export const readSolanaFlows = async (
  address,
  { call = defaultCall, pauseMs = PAUSE_MS, maxTransactions = MAX_TRANSACTIONS } = {},
) => {
  const visited = new Set();
  const signatures = new Set();
  const read = new Set();
  const flows = [];
  let pending = [address, ...(await tokenAccounts(address, call))];

  while (pending.length > 0) {
    for (const account of pending) {
      visited.add(account);
      await readSignatures(account, call, signatures);
      if (signatures.size > maxTransactions) return { flows: [], truncated: true };
    }

    const discovered = new Set();
    for (const signature of [...signatures].filter((entry) => !read.has(entry))) {
      if (pauseMs > 0) await wait(pauseMs);
      read.add(signature);
      const result = await readTransaction(signature, call);
      flows.push(...parseSolanaTransaction(result, address));
      for (const account of ownedTokenAccounts(result, address)) {
        if (!visited.has(account)) discovered.add(account);
      }
    }
    pending = [...discovered];
  }

  return { flows, truncated: false };
};
