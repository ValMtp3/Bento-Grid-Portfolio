// Cours historiques, un point par jour sur un an, pour valoriser chaque
// mouvement on-chain au cours de sa date.
//
// Un an est la limite du plan gratuit de l'agregateur : un flux plus ancien ne
// peut pas etre valorise, et la performance crypto est alors masquee.

import { withRetry } from './collect.mjs';
import { fetchJson } from './http.mjs';
import { COINGECKO_IDS, PLATFORMS, VS_CURRENCY } from './prices.mjs';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const HISTORY_DAYS = 365;
// Plan gratuit : 30 appels par minute. 2,1 s entre deux appels garde une marge
// pour les appels de cours actuels du meme job.
const PAUSE_MS = 2100;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const historyUrl = (asset) => {
  const query = `vs_currency=${VS_CURRENCY}&days=${HISTORY_DAYS}&interval=daily`;

  if (!asset?.contract) {
    const id = COINGECKO_IDS[asset?.symbol];
    return id ? `${COINGECKO_BASE}/coins/${id}/market_chart?${query}` : null;
  }

  const platform = PLATFORMS[asset.platform];
  return platform
    ? `${COINGECKO_BASE}/coins/${platform}/contract/${asset.contract}/market_chart?${query}`
    : null;
};

export const parseMarketChart = (payload) =>
  (Array.isArray(payload?.prices) ? payload.prices : [])
    .filter(
      (point) =>
        Array.isArray(point)
        && Number.isFinite(point[0])
        && Number.isFinite(point[1])
        && point[1] > 0,
    )
    .map(([time, price]) => [time, price])
    .sort((a, b) => a[0] - b[0]);

/**
 * Un appel par actif, en serie : l'agregateur limite le debit par minute, et
 * des appels paralleles se feraient refuser en rafale.
 */
export const fetchPriceHistories = async (
  assets,
  { apiKey, fetch = fetchJson, pauseMs = PAUSE_MS, retry = withRetry } = {},
) => {
  const histories = {};
  const headers = apiKey ? { 'x-cg-demo-api-key': apiKey } : {};
  let calls = 0;

  for (const asset of assets ?? []) {
    const url = historyUrl(asset);
    if (!url) continue;

    if (calls > 0) await wait(pauseMs);
    calls += 1;

    histories[asset.key] = parseMarketChart(await retry(() => fetch(url, { headers })));
  }

  return histories;
};
