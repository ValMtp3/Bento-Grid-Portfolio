// Lecture des positions Trading 212.
//
// L'API ne renvoie ni secteur ni pays : verifie sur la spec OpenAPI, l'ancien
// swagger, des dumps reels et quatre clients tiers, aucun de ces champs
// n'existe. La zone geographique est donc deduite du prefixe pays de l'ISIN,
// seule information de localisation disponible.
//
// Rien de ce qui identifie une position ne sort de ce module : ni ticker, ni
// ISIN, ni nom. Ils servent au classement puis sont abandonnes.

import { HttpError } from './http.mjs';

const BASE_URL = 'https://live.trading212.com/api/v0';
const POSITIONS_PATH = '/equity/positions';
const ORDERS_PATH = '/equity/history/orders';

// Fenetre suffisante pour les metriques de rythme sur trente jours, sans
// pagination : l'endpoint est limite a six requetes par minute.
const ORDERS_LIMIT = 50;

// Seuls les ordres reellement executes temoignent d'un acte d'investissement.
const EXECUTED = new Set(['FILLED', 'PARTIALLY_FILLED']);

/**
 * Deux contrats coexistent cote serveur. Le contrat actuel attend un Basic
 * cle:secret ; l'ancien accepte la cle brute, sans prefixe de schema. On
 * choisit selon ce que l'utilisateur a fourni, sans le forcer a creer un
 * secret dont il n'a pas besoin.
 */
export const authHeader = (apiKey, apiSecret) => {
  if (!apiKey) throw new Error('TRADING212_API_KEY manquante : aucune cle a envoyer');

  return apiSecret
    ? `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`
    : apiKey;
};

// Prefixe pays de l'ISIN. C'est le pays d'enregistrement de la societe, pas
// celui de sa place de cotation ni de son activite : une societe americaine
// cotee a Francfort reste classee en Amerique du Nord.
const REGIONS = {
  'Amerique du Nord': ['US', 'CA'],
  Europe: [
    'FR', 'DE', 'NL', 'GB', 'CH', 'IT', 'ES', 'BE', 'IE', 'SE', 'DK',
    'NO', 'FI', 'AT', 'PT', 'LU', 'PL', 'GR', 'CZ', 'JE', 'GG', 'IM',
  ],
  Asie: ['JP', 'CN', 'HK', 'KR', 'TW', 'SG', 'IN', 'ID', 'TH', 'MY', 'IL', 'AE'],
  Oceanie: ['AU', 'NZ'],
  'Amerique latine': ['BR', 'MX', 'CL', 'AR', 'CO', 'PE'],
  Afrique: ['ZA', 'EG', 'MA', 'NG'],
};

const COUNTRY_TO_REGION = new Map(
  Object.entries(REGIONS).flatMap(([region, codes]) => codes.map((code) => [code, region])),
);

// Les deux premieres lettres d'un ISIN sont le code pays d'enregistrement.
export const countryFromIsin = (isin) =>
  typeof isin === 'string' && isin.length >= 2 ? isin.slice(0, 2).toUpperCase() : null;

export const regionFromIsin = (isin) => {
  if (typeof isin !== 'string' || isin.length < 2) return null;

  // Les places exotiques et les codes rares existent : les nommer "Autres"
  // vaut mieux que de les faire disparaitre du total.
  return COUNTRY_TO_REGION.get(isin.slice(0, 2).toUpperCase()) ?? 'Autres';
};

// Le courtier ne distingue pas les fonds des actions : le ticker se termine par
// _EQ dans les deux cas. Le nom reste le seul indice disponible.
const ETF_MARKERS = [
  'etf',
  'ucits',
  'ishares',
  'vanguard',
  'amundi',
  'lyxor',
  'xtrackers',
  'spdr',
  'invesco',
  'wisdomtree',
  'index fund',
];

export const isEtf = (name) => {
  if (typeof name !== 'string') return false;

  const lowered = name.toLowerCase();
  return ETF_MARKERS.some((marker) => lowered.includes(marker));
};

/**
 * Convertit les positions du courtier en lignes neutres.
 *
 * On lit walletImpact.currentValue, deja converti dans la devise du compte :
 * recalculer prix x quantite obligerait a gerer les taux de change et le penny
 * sterling (GBX), deux sources d'erreur pour aucun gain.
 */
export const parsePositions = (payload) => {
  if (!Array.isArray(payload)) return [];

  return payload
    .map((position) => {
      const value = Number(position?.walletImpact?.currentValue);
      if (!Number.isFinite(value) || value <= 0) return null;

      const fund = isEtf(position?.instrument?.name);

      return {
        kind: fund ? 'etf' : 'stock',
        value,
        // Un fonds indiciel monde domicilie en Irlande n'a rien d'europeen :
        // sa domiciliation ne dit rien de son exposition reelle.
        region: fund ? null : regionFromIsin(position?.instrument?.isin),
        // Devise de cotation et non devise du compte : cette derniere est la
        // meme sur toutes les lignes, elle ne comptait donc jamais qu'une seule
        // devise. Le pays vient du meme ISIN que la zone, en plus fin.
        currency: position?.instrument?.currency ?? null,
        country: fund ? null : countryFromIsin(position?.instrument?.isin),
        openedAt: position?.createdAt ?? null,
      };
    })
    .filter(Boolean);
};

/**
 * Appelle l'API et rend les positions deja neutralisees.
 * Le rate limit officiel est d'une requete par seconde sur cet endpoint : un
 * seul appel toutes les six heures en est tres loin.
 */
export const fetchPositions = async ({ apiKey, apiSecret, fetchImpl = fetch, timeoutMs = 15000 }) => {
  const response = await fetchImpl(`${BASE_URL}${POSITIONS_PATH}`, {
    headers: {
      Authorization: authHeader(apiKey, apiSecret),
      Accept: 'application/json',
      'User-Agent': 'Bento-Grid-Portfolio/1.0',
    },
    signal: AbortSignal.timeout(timeoutMs),
  });

  // HttpError porte le marquage "definitif" : un 401 sur une cle invalide ne
  // deviendra pas valide en le redemandant trois fois.
  if (!response.ok) throw new HttpError(response.status, `${BASE_URL}${POSITIONS_PATH}`);

  const payload = await response.json();

  // Un depassement de quota peut arriver deguise en HTTP 200, avec l'erreur
  // dans le corps : sans ce controle, on publierait une liste vide comme si le
  // portefeuille avait ete vendu.
  if (payload?.context?.type === 'TooManyRequests') {
    throw new Error('Trading 212 : quota depasse (200 avec erreur metier)');
  }

  return parsePositions(payload);
};

/**
 * Reduit l'historique des ordres a ce qui sert au rythme : une date et un sens.
 * Le montant, la quantite et le ticker sont abandonnes ici meme.
 */
export const parseOrders = (payload) => {
  const items = Array.isArray(payload?.items) ? payload.items : [];

  return items
    .map((entry) => {
      const order = entry?.order;
      if (!EXECUTED.has(order?.status)) return null;

      const date = order?.createdAt ?? entry?.fill?.filledAt ?? null;
      if (!date) return null;

      return { date, side: String(order?.side ?? '').toLowerCase() };
    })
    .filter(Boolean);
};

/**
 * Appelle l'historique des ordres. Rend null plutot que de lever quand la cle
 * n'a pas la permission : la carte se passe alors des metriques de rythme, au
 * lieu d'afficher un zero qui se lirait "aucun ordre ce mois-ci".
 */
export const fetchOrders = async ({ apiKey, apiSecret, fetchImpl = fetch, timeoutMs = 15000 }) => {
  const response = await fetchImpl(`${BASE_URL}${ORDERS_PATH}?limit=${ORDERS_LIMIT}`, {
    headers: {
      Authorization: authHeader(apiKey, apiSecret),
      Accept: 'application/json',
      'User-Agent': 'Bento-Grid-Portfolio/1.0',
    },
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (response.status === 403 || response.status === 401) return null;
  if (!response.ok) throw new HttpError(response.status, `${BASE_URL}${ORDERS_PATH}`);

  const payload = await response.json();
  if (payload?.context?.type === 'TooManyRequests') {
    throw new Error('Trading 212 : quota depasse sur l historique des ordres');
  }

  return parseOrders(payload);
};
