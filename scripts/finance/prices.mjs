// Cours des cryptos, en euros, pour rendre les soldes on-chain comparables aux
// positions du courtier.
//
// Deux facons de coter un actif :
//   - les actifs natifs (BTC, ETH, SOL, DOGE) par identifiant d'agregateur ;
//   - les jetons par adresse de contrat.
//
// Coter les jetons par contrat plutot que par symbole regle deux problemes d'un
// coup. D'abord la couverture : plus besoin de tenir a jour une liste de
// symboles, les jetons de staking liquide comme stETH ou mSOL sont cotes comme
// les autres. Ensuite les contrefacons : un faux "USDC" a un contrat different
// du vrai, et l'agregateur ne cote que le vrai.

import { fetchJson } from './http.mjs';

export const VS_CURRENCY = 'eur';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const COINBASE_URL = 'https://api.coinbase.com/v2/exchange-rates?currency=EUR';

// Identifiants d'agregateur des seuls actifs natifs : ceux qui n'ont pas de
// contrat parce qu'ils sont la monnaie de leur propre chaine.
export const COINGECKO_IDS = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  DOGE: 'dogecoin',
  POL: 'matic-network',
  BNB: 'binancecoin',
};

// Noms de plateformes attendus par l'agregateur, par reseau du projet.
export const PLATFORMS = {
  ethereum: 'ethereum',
  base: 'base',
  arbitrum: 'arbitrum-one',
  polygon: 'polygon-pos',
  optimism: 'optimistic-ethereum',
  bnb: 'binance-smart-chain',
  solana: 'solana',
};

// Au-dela, l'URL devient trop longue et l'agregateur la rejette.
const MAX_CONTRACTS_PER_CALL = 60;

/**
 * Cle sous laquelle un actif retrouve son cours. Le contrat prime sur le
 * symbole : il est unique la ou un symbole peut etre usurpe.
 */
export const priceKey = (holding) =>
  holding?.contract ? holding.contract.toLowerCase() : holding?.symbol?.toUpperCase();

export const parseNativePrices = (payload, symbols) => {
  const prices = {};

  for (const symbol of symbols ?? []) {
    const price = Number(payload?.[COINGECKO_IDS[symbol]]?.[VS_CURRENCY]);
    if (Number.isFinite(price) && price > 0) prices[symbol] = price;
  }

  return prices;
};

export const parseTokenPrices = (payload) => {
  const prices = {};

  for (const [contract, quote] of Object.entries(payload ?? {})) {
    const price = Number(quote?.[VS_CURRENCY]);
    if (Number.isFinite(price) && price > 0) prices[contract.toLowerCase()] = price;
  }

  return prices;
};

/**
 * Coinbase publie des taux inverses : combien de crypto vaut un euro. Sert de
 * repli pour les seuls actifs natifs, les jetons n'y figurant pas.
 */
export const parseCoinbaseRates = (payload, symbols) => {
  const rates = payload?.data?.rates ?? {};
  const prices = {};

  for (const symbol of symbols ?? []) {
    const rate = Number(rates[symbol]);
    if (Number.isFinite(rate) && rate > 0) prices[symbol] = 1 / rate;
  }

  return prices;
};

const chunk = (items, size) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, (index + 1) * size),
  );

const headersFor = (apiKey) => (apiKey ? { 'x-cg-demo-api-key': apiKey } : {});

const fetchNativePrices = async (symbols, apiKey, onFallback) => {
  const ids = [...new Set(symbols.map((symbol) => COINGECKO_IDS[symbol]).filter(Boolean))];
  if (ids.length === 0) return {};

  try {
    const payload = await fetchJson(
      `${COINGECKO_BASE}/simple/price?ids=${ids.join(',')}&vs_currencies=${VS_CURRENCY}`,
      { headers: headersFor(apiKey) },
    );

    const prices = parseNativePrices(payload, symbols);
    if (Object.keys(prices).length > 0) return prices;

    throw new Error('CoinGecko : aucun cours natif exploitable');
  } catch (error) {
    onFallback?.(error);
    return parseCoinbaseRates(await fetchJson(COINBASE_URL), symbols);
  }
};

const fetchPlatformPrices = async (platform, contracts, apiKey, onFallback) => {
  const prices = {};

  // L'agregateur accepte plusieurs contrats par appel : un jeton a la fois
  // epuiserait le quota et allongerait le job pour rien.
  for (const batch of chunk(contracts, MAX_CONTRACTS_PER_CALL)) {
    try {
      const payload = await fetchJson(
        `${COINGECKO_BASE}/simple/token_price/${platform}`
        + `?contract_addresses=${batch.join(',')}&vs_currencies=${VS_CURRENCY}`,
        { headers: headersFor(apiKey) },
      );

      Object.assign(prices, parseTokenPrices(payload));
    } catch (error) {
      // Une plateforme muette ne doit pas emporter les autres : ses jetons
      // seront simplement ecartes du melange.
      onFallback?.(error);
    }
  }

  return prices;
};

/**
 * Cours de tous les actifs detenus, indexes par la cle de chaque ligne.
 * Un actif absent du resultat est ecarte du melange par la valorisation :
 * mieux vaut une part crypto un peu basse qu'un chiffre invente.
 */
export const fetchPrices = async (holdings, { apiKey, onFallback } = {}) => {
  const natives = holdings.filter((holding) => !holding.contract);
  const tokens = holdings.filter((holding) => holding.contract);

  const prices = await fetchNativePrices(
    [...new Set(natives.map((holding) => holding.symbol))],
    apiKey,
    onFallback,
  );

  const byPlatform = new Map();
  for (const token of tokens) {
    const platform = PLATFORMS[token.platform];
    if (!platform) continue;

    if (!byPlatform.has(platform)) byPlatform.set(platform, new Set());
    byPlatform.get(platform).add(token.contract.toLowerCase());
  }

  for (const [platform, contracts] of byPlatform) {
    Object.assign(prices, await fetchPlatformPrices(platform, [...contracts], apiKey, onFallback));
  }

  return prices;
};
