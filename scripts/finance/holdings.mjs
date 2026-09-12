// Passage des soldes on-chain a des positions comparables a celles du courtier.
//
// Les quantites d'actifs ne servent qu'ici, le temps de les multiplier par un
// cours. Seule la valeur relative continue vers l'anonymisation, et elle en
// ressort en pourcentage.

import { priceKey } from './prices.mjs';

/**
 * Regroupe les soldes par actif. Une meme adresse detient souvent le meme
 * actif sur plusieurs reseaux ou sur plusieurs comptes : ce sont des lignes
 * techniques, pas des placements distincts.
 *
 * Le regroupement se fait sur le contrat quand il existe, sur le symbole
 * sinon. Deux jetons de meme symbole mais de contrats differents restent
 * separes : c'est ainsi qu'une contrefacon d'USDC ne se fond pas dans le vrai.
 */
export const mergeHoldings = (holdings) => {
  const totals = new Map();

  for (const entry of holdings ?? []) {
    const symbol = entry?.symbol?.toUpperCase?.();
    const amount = Number(entry?.amount) || 0;
    if (!symbol || amount <= 0) continue;

    const key = priceKey(entry);
    const current = totals.get(key);

    totals.set(key, {
      symbol,
      amount: (current?.amount ?? 0) + amount,
      platform: entry.platform ?? null,
      contract: entry.contract ?? null,
      // Un actif place reste place, meme fusionne avec une ligne liquide du
      // meme jeton : la part qui travaille ne doit pas disparaitre au passage.
      staked: Boolean(current?.staked || entry.staked),
    });
  }

  return [...totals.values()];
};

/**
 * Valorise les soldes pour les rendre comparables aux positions du courtier.
 * Un actif sans cours connu est ecarte plutot qu'estime : mieux vaut une part
 * crypto legerement sous-evaluee qu'un chiffre invente.
 */
export const toCryptoPositions = (holdings, prices, { onSkip } = {}) => {
  const positions = [];

  for (const entry of holdings ?? []) {
    const price = Number(prices?.[priceKey(entry)]);

    if (!Number.isFinite(price) || price <= 0) {
      onSkip?.(entry.symbol);
      continue;
    }

    positions.push({
      kind: 'crypto',
      value: entry.amount * price,
      staked: Boolean(entry.staked),
      // Une crypto n'a ni pays d'enregistrement ni devise de cotation : la
      // faire figurer dans ces repartitions melangerait une classe d'actifs
      // avec des zones geographiques.
      region: null,
      currency: null,
      // La date d'entree demanderait de rejouer tout l'historique on-chain :
      // hors sujet pour une carte de portfolio, et couteux en appels.
      openedAt: null,
    });
  }

  return positions;
};
