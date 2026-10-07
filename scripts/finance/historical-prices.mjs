// Cours historiques des actifs, au moment exact de chaque mouvement on-chain,
// pour valoriser les apports nets de la perf crypto.
//
// Source : DefiLlama, gratuit et sans cle, sans limite d'anciennete (les
// premiers mouvements datent de 2022, l'historique gratuit de CoinGecko
// s'arrete a un an). DefiLlama cote en dollars : chaque point est converti en
// euros au taux BCE du jour, publie par Frankfurter (gratuit, sans cle).
//
// La valeur actuelle reste en cours CoinGecko EUR : l'ecart entre les deux
// sources est faible devant un pourcentage arrondi a l'entier.

import { withRetry } from './collect.mjs';
import { fetchJson } from './http.mjs';
import { COINGECKO_IDS } from './prices.mjs';

const LLAMA_URL = 'https://coins.llama.fi/batchHistorical';
const FRANKFURTER_BASE = 'https://api.frankfurter.dev/v1';
// Ecart tolere, en secondes, entre le moment demande et le cours rendu par DefiLlama.
const SEARCH_WIDTH = 600;
// Au-dela, certains serveurs et proxys rejettent l'URL : les demandes sont
// decoupees en plusieurs appels.
const MAX_URL_LENGTH = 6000;

const MS_PER_SECOND = 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
// Pas de taux BCE le week-end ni les jours feries : l'ecart le plus long
// observe entre deux taux publies est de 5 jours. Au-dela, c'est un trou dans
// la serie, pas un pont, et le taux n'est plus celui du jour.
const MAX_RATE_LOOKBACK_DAYS = 7;
// Point anterieur au premier taux de la serie : on accepte le premier jour
// ouvre qui suit, s'il tombe dans ce delai.
const MAX_RATE_LOOKAHEAD_DAYS = 4;

// Identifiants qui different de ceux de la cotation actuelle : DefiLlama garde
// l'historique de POL sous l'ancien identifiant de MATIC, couvert de 2022 a
// aujourd'hui.
const NATIVE_ID_OVERRIDES = {
  POL: 'matic-network',
};

// Noms de chaines attendus par DefiLlama, par reseau du projet. BNB Chain est
// absente : elle est exclue de la perf crypto.
const LLAMA_CHAINS = {
  ethereum: 'ethereum',
  base: 'base',
  arbitrum: 'arbitrum',
  polygon: 'polygon',
  optimism: 'optimism',
  solana: 'solana',
};

/**
 * Identifiant DefiLlama d'un actif, ou null s'il ne peut pas etre cote.
 * Les contrats EVM sont insensibles a la casse ; les mints Solana non, leur
 * casse d'origine est donc gardee.
 */
export const llamaCoinId = (asset) => {
  if (!asset) return null;

  if (!asset.contract) {
    const id = NATIVE_ID_OVERRIDES[asset.symbol] ?? COINGECKO_IDS[asset.symbol];
    return id ? `coingecko:${id}` : null;
  }

  const chain = LLAMA_CHAINS[asset.platform];
  if (!chain) return null;
  return chain === 'solana' ? `${chain}:${asset.contract}` : `${chain}:${asset.contract.toLowerCase()}`;
};

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const byTime = (a, b) => a[0] - b[0];

const parsePoints = (prices) =>
  (Array.isArray(prices) ? prices : [])
    .map((point) => [Number(point?.timestamp) * MS_PER_SECOND, Number(point?.price)])
    // Number(null) vaut 0 : un timestamp absent ne doit pas devenir le
    // 1er janvier 1970, d'ou time > 0.
    .filter(([time, price]) => Number.isFinite(time) && time > 0 && Number.isFinite(price) && price > 0)
    .sort(byTime);

/**
 * Series en dollars par identifiant DefiLlama, en [[ms, cours]] triees.
 */
export const parseBatchHistorical = (payload) => {
  const coins = isPlainObject(payload?.coins) ? payload.coins : {};
  return Object.fromEntries(
    Object.entries(coins).map(([coinId, coin]) => [coinId, parsePoints(coin?.prices)]),
  );
};

const dayStart = (time) => Math.floor(time / MS_PER_DAY) * MS_PER_DAY;

/**
 * Taux USD -> EUR, en [[ms du debut de jour UTC, taux]] tries.
 */
export const parseUsdEurRates = (payload) => {
  const rates = isPlainObject(payload?.rates) ? payload.rates : {};
  return Object.entries(rates)
    .map(([day, quote]) => [Date.parse(`${day}T00:00:00Z`), Number(quote?.EUR)])
    .filter(([time, rate]) => Number.isFinite(time) && Number.isFinite(rate) && rate > 0)
    .sort(byTime);
};

// Taux du dernier jour ouvre au plus tard le jour du point ; a defaut de taux
// anterieur, le premier des jours suivants. Rend null sans taux exploitable.
const rateFor = (rates, time) => {
  const day = dayStart(time);
  let previous = null;
  let next = null;
  for (const entry of rates) {
    if (entry[0] <= day) previous = entry;
    else {
      next = entry;
      break;
    }
  }

  if (previous) return day - previous[0] <= MAX_RATE_LOOKBACK_DAYS * MS_PER_DAY ? previous[1] : null;
  if (next && next[0] - day <= MAX_RATE_LOOKAHEAD_DAYS * MS_PER_DAY) return next[1];
  return null;
};

/**
 * Convertit une serie en dollars en euros, point par point, au taux de son
 * jour. Un seul point sans taux invalide toute la conversion : un taux invente
 * donnerait un apport faux mais credible.
 */
export const usdToEur = (seriesUsd, rates) =>
  (seriesUsd ?? []).map(([time, price]) => {
    const rate = rateFor(rates ?? [], time);
    if (rate === null) throw new Error('taux de change USD/EUR manquant');
    return [time, price * rate];
  });

const encodedLength = (text) => encodeURIComponent(text).length;
const ENCODED_COMMA = encodedLength(',');
const llamaUrl = (coins) => `${LLAMA_URL}?coins=${encodeURIComponent(JSON.stringify(coins))}&searchWidth=${SEARCH_WIDTH}`;
const EMPTY_URL_LENGTH = llamaUrl({}).length;

// Cout, en caracteres d'URL, de l'ajout d'un timestamp a un lot.
const additionCost = (batch, coinId, timestamp) => {
  const value = encodedLength(String(timestamp));
  if (batch[coinId]) return value + ENCODED_COMMA;
  const entry = encodedLength(`${JSON.stringify(coinId)}:[]`);
  return value + entry + (Object.keys(batch).length > 0 ? ENCODED_COMMA : 0);
};

// Decoupe les demandes en lots dont l'URL reste sous la limite. Un actif aux
// tres nombreux mouvements peut lui-meme etre reparti sur plusieurs lots.
const planBatches = (requests) => {
  const batches = [];
  let batch = {};
  let length = EMPTY_URL_LENGTH;

  for (const [coinId, timestamps] of requests) {
    for (const timestamp of timestamps) {
      if (length + additionCost(batch, coinId, timestamp) >= MAX_URL_LENGTH && Object.keys(batch).length > 0) {
        batches.push(batch);
        batch = {};
        length = EMPTY_URL_LENGTH;
      }
      length += additionCost(batch, coinId, timestamp);
      batch = { ...batch, [coinId]: [...(batch[coinId] ?? []), timestamp] };
    }
  }

  return Object.keys(batch).length > 0 ? [...batches, batch] : batches;
};

// Les contrats EVM peuvent revenir dans une autre casse que celle demandee.
const findSeries = (seriesByCoin, coinId) => {
  if (seriesByCoin[coinId]) return seriesByCoin[coinId];
  if (coinId.startsWith('solana:')) return undefined;
  const match = Object.keys(seriesByCoin).find((key) => key.toLowerCase() === coinId.toLowerCase());
  return match ? seriesByCoin[match] : undefined;
};

const isoDay = (time) => new Date(time).toISOString().slice(0, 10);

const defaultFetch = (url) => withRetry(() => fetchJson(url));

const fetchUsdSeries = async (batches, fetch) => {
  const merged = {};
  // En serie : un service gratuit limite le debit, des appels paralleles se
  // feraient refuser en rafale.
  for (const batch of batches) {
    const payload = await fetch(llamaUrl(batch));
    // Message fixe : l'URL porte les contrats, elle ne doit pas finir dans les logs.
    if (!isPlainObject(payload?.coins)) throw new Error('DefiLlama : reponse inattendue');
    for (const [coinId, points] of Object.entries(parseBatchHistorical(payload))) {
      merged[coinId] = [...(merged[coinId] ?? []), ...points];
    }
  }
  return Object.fromEntries(Object.entries(merged).map(([coinId, points]) => [coinId, [...points].sort(byTime)]));
};

const fetchRates = async (from, to, fetch) => {
  const payload = await fetch(`${FRANKFURTER_BASE}/${isoDay(from)}..${isoDay(to)}?from=USD&to=EUR`);
  if (!isPlainObject(payload?.rates)) throw new Error('Frankfurter : reponse inattendue');
  return parseUsdEurRates(payload);
};

/**
 * Cours en euros de chaque actif aux dates de ses mouvements, indexes par la
 * cle de l'actif. Un actif inconnu de DefiLlama (spam, jeton obscur) n'a pas
 * d'entree : il est "non cote". Leve sur toute erreur reseau ou reponse
 * inattendue, plutot que de laisser un trou silencieux dans les apports.
 */
export const fetchFlowPrices = async (flows, assets, { fetch = defaultFetch, now = Date.now() } = {}) => {
  const coinIdByKey = new Map(
    (assets ?? [])
      .map((asset) => [asset.key, llamaCoinId(asset)])
      .filter(([, coinId]) => coinId !== null),
  );

  const timesByCoin = new Map();
  for (const flow of flows ?? []) {
    const coinId = coinIdByKey.get(flow.key);
    if (!coinId || !Number.isFinite(flow.time)) continue;
    timesByCoin.set(coinId, [...(timesByCoin.get(coinId) ?? []), flow.time]);
  }
  if (timesByCoin.size === 0) return {};

  const requests = [...timesByCoin].map(([coinId, times]) => [
    coinId,
    [...new Set(times.map((time) => Math.floor(time / MS_PER_SECOND)))].sort((a, b) => a - b),
  ]);
  const oldest = Math.min(...[...timesByCoin.values()].flat());

  const seriesByCoin = await fetchUsdSeries(planBatches(requests), fetch);
  const rates = await fetchRates(oldest, now, fetch);

  return Object.fromEntries(
    [...coinIdByKey]
      .map(([key, coinId]) => [key, findSeries(seriesByCoin, coinId)])
      .filter(([, series]) => series !== undefined)
      .map(([key, series]) => [key, usdToEur(series, rates)]),
  );
};
