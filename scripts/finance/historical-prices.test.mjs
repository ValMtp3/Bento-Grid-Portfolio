import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  fetchFlowPrices,
  llamaCoinId,
  parseBatchHistorical,
  parseUsdEurRates,
  usdToEur,
} from './historical-prices.mjs';

const DAY = 24 * 60 * 60 * 1000;
// Lundi 14 decembre 2026, minuit UTC.
const MONDAY = Date.UTC(2026, 11, 14);
const FRIDAY = MONDAY - 3 * DAY;
const SATURDAY = MONDAY - 2 * DAY;

const flow = (key, time, extra = {}) => ({ time, key, symbol: key, contract: null, platform: null, amount: 1, ...extra });
const native = (symbol) => ({ key: symbol, symbol, contract: null, platform: null });
const token = (contract, platform) => ({ key: contract.toLowerCase(), symbol: contract, contract, platform });

// Faux services : DefiLlama rend 2 USD par timestamp demande pour chaque
// actif connu, Frankfurter rend un taux fixe tous les jours de la semaine.
const fakeServices = ({ unknown = [], calls = [], rate = 0.5 } = {}) => async (url) => {
  calls.push(url);
  if (url.startsWith('https://api.frankfurter.dev/')) {
    const [from, to] = url.match(/\/v1\/([\d-]+)\.\.([\d-]+)\?/).slice(1).map((day) => Date.parse(`${day}T00:00:00Z`));
    const rates = {};
    for (let time = from; time <= to; time += DAY) {
      const weekday = new Date(time).getUTCDay();
      if (weekday !== 0 && weekday !== 6) rates[new Date(time).toISOString().slice(0, 10)] = { EUR: rate };
    }
    return { base: 'USD', rates };
  }

  const requested = JSON.parse(decodeURIComponent(new URL(url).searchParams.get('coins')));
  const coins = {};
  for (const [coinId, timestamps] of Object.entries(requested)) {
    if (unknown.includes(coinId)) continue;
    coins[coinId] = { symbol: 'X', prices: timestamps.map((timestamp) => ({ timestamp, price: 2, confidence: 0.99 })) };
  }
  return { coins };
};

describe('llamaCoinId', () => {
  it('cote un actif natif par son identifiant d agregateur', () => {
    assert.equal(llamaCoinId(native('ETH')), 'coingecko:ethereum');
    assert.equal(llamaCoinId(native('BTC')), 'coingecko:bitcoin');
  });

  // L'historique de POL vit sous l'ancien identifiant MATIC chez DefiLlama.
  it('cote POL par l identifiant historique de MATIC', () => {
    assert.equal(llamaCoinId(native('POL')), 'coingecko:matic-network');
  });

  it('cote un jeton EVM par chaine et contrat', () => {
    assert.equal(llamaCoinId(token('0xA0B8', 'ethereum')), 'ethereum:0xa0b8');
    assert.equal(llamaCoinId(token('0xA0B8', 'base')), 'base:0xa0b8');
    assert.equal(llamaCoinId(token('0xA0B8', 'arbitrum')), 'arbitrum:0xa0b8');
    assert.equal(llamaCoinId(token('0xA0B8', 'polygon')), 'polygon:0xa0b8');
    assert.equal(llamaCoinId(token('0xA0B8', 'optimism')), 'optimism:0xa0b8');
  });

  // Les mints Solana sont sensibles a la casse.
  it('garde la casse d origine d un mint Solana', () => {
    assert.equal(llamaCoinId(token('EPjFWdd5', 'solana')), 'solana:EPjFWdd5');
  });

  it('rend null pour un actif impossible a coter', () => {
    assert.equal(llamaCoinId(native('XYZ')), null);
    assert.equal(llamaCoinId(token('0x1', 'bnb')), null);
    assert.equal(llamaCoinId(token('0x1', 'inconnue')), null);
    assert.equal(llamaCoinId(null), null);
  });
});

describe('parseBatchHistorical', () => {
  it('trie les points en ms et ecarte les prix inutilisables', () => {
    const payload = {
      coins: {
        'coingecko:ethereum': {
          symbol: 'ETH',
          prices: [
            { timestamp: 20, price: 2000 },
            { timestamp: 10, price: 1000 },
            { timestamp: 30, price: 0 },
            { timestamp: 40, price: null },
            { timestamp: 'x', price: 5 },
          ],
        },
      },
    };
    assert.deepEqual(parseBatchHistorical(payload), { 'coingecko:ethereum': [[10_000, 1000], [20_000, 2000]] });
  });

  it('rend un objet vide sur une reponse inattendue', () => {
    assert.deepEqual(parseBatchHistorical(null), {});
  });
});

describe('parseUsdEurRates', () => {
  it('rend les taux tries par debut de jour UTC', () => {
    const payload = { base: 'USD', rates: { '2026-12-14': { EUR: 0.9 }, '2026-12-11': { EUR: 0.8 }, '2026-12-15': { EUR: 0 } } };
    assert.deepEqual(parseUsdEurRates(payload), [[FRIDAY, 0.8], [MONDAY, 0.9]]);
  });

  it('rend une liste vide sur une reponse inattendue', () => {
    assert.deepEqual(parseUsdEurRates(undefined), []);
  });
});

describe('usdToEur', () => {
  const rates = [[FRIDAY, 0.8], [MONDAY, 0.9]];

  it('convertit chaque point au taux de son jour', () => {
    assert.deepEqual(usdToEur([[MONDAY + 3600_000, 100]], rates), [[MONDAY + 3600_000, 90]]);
  });

  // Pas de taux BCE le week-end : le dernier jour ouvre fait foi.
  it('prend le taux du dernier jour ouvre pour un point du week-end', () => {
    assert.deepEqual(usdToEur([[SATURDAY + 3600_000, 100]], rates), [[SATURDAY + 3600_000, 80]]);
  });

  it('prend le premier taux des quatre jours suivants faute de taux anterieur', () => {
    assert.deepEqual(usdToEur([[FRIDAY - 2 * DAY, 100]], rates), [[FRIDAY - 2 * DAY, 80]]);
  });

  // Un taux invente ferait un apport faux mais credible : on prefere lever.
  it('leve sans taux exploitable avant ni dans les quatre jours suivants', () => {
    assert.throws(() => usdToEur([[FRIDAY - 5 * DAY, 100]], rates), /taux/);
  });

  it('leve sur un trou de taux au milieu de la serie', () => {
    const sparse = [[FRIDAY - 30 * DAY, 0.8], [MONDAY, 0.9]];
    assert.throws(() => usdToEur([[FRIDAY, 100]], sparse), /taux/);
  });

  it('ne mute pas la serie recue', () => {
    const series = [[MONDAY, 100]];
    usdToEur(series, rates);
    assert.deepEqual(series, [[MONDAY, 100]]);
  });
});

describe('fetchFlowPrices', () => {
  const now = MONDAY + 10 * DAY;

  it('rend des series en euros indexees par la cle de l actif', async () => {
    const usdc = token('0xA0B8', 'ethereum');
    const prices = await fetchFlowPrices(
      [flow('ETH', MONDAY), flow(usdc.key, MONDAY + DAY, { contract: usdc.contract, platform: 'ethereum' })],
      [native('ETH'), usdc],
      { fetch: fakeServices(), now },
    );
    assert.deepEqual(prices, { ETH: [[MONDAY, 1]], [usdc.key]: [[MONDAY + DAY, 1]] });
  });

  it('demande les taux du plus ancien flux a aujourd hui', async () => {
    const calls = [];
    await fetchFlowPrices(
      [flow('ETH', MONDAY + 5 * 3600_000), flow('ETH', FRIDAY + 3600_000)],
      [native('ETH')],
      { fetch: fakeServices({ calls }), now },
    );
    const frankfurter = calls.filter((url) => url.startsWith('https://api.frankfurter.dev/'));
    assert.deepEqual(frankfurter, ['https://api.frankfurter.dev/v1/2026-12-11..2026-12-24?from=USD&to=EUR']);
  });

  // Un jeton de spam inconnu de DefiLlama est absent de sa reponse : il n'a
  // pas d'entree, ce qui le classe "non cote".
  it('n a pas d entree pour un actif absent de la reponse', async () => {
    const spam = token('0xSPAM', 'ethereum');
    const prices = await fetchFlowPrices(
      [flow('ETH', MONDAY), flow(spam.key, MONDAY, { contract: spam.contract, platform: 'ethereum' })],
      [native('ETH'), spam],
      { fetch: fakeServices({ unknown: ['ethereum:0xspam'] }), now },
    );
    assert.deepEqual(Object.keys(prices), ['ETH']);
  });

  it('ignore un actif sans identifiant et ne demande rien sans actif cotable', async () => {
    const calls = [];
    const prices = await fetchFlowPrices(
      [flow('XYZ', MONDAY)],
      [native('XYZ')],
      { fetch: fakeServices({ calls }), now },
    );
    assert.deepEqual(prices, {});
    assert.equal(calls.length, 0);
  });

  it('decoupe les demandes pour garder chaque URL sous la limite', async () => {
    const calls = [];
    const times = Array.from({ length: 1200 }, (_, index) => MONDAY - index * 3600_000);
    const prices = await fetchFlowPrices(
      times.map((time) => flow('ETH', time)),
      [native('ETH'), native('BTC')],
      { fetch: fakeServices({ calls }), now },
    );
    const llama = calls.filter((url) => url.startsWith('https://coins.llama.fi/'));
    assert.ok(llama.length > 1);
    for (const url of llama) assert.ok(url.length < 6000);
    assert.equal(prices.ETH.length, times.length);
    assert.deepEqual(prices.ETH.map(([time]) => time), [...times].sort((a, b) => a - b));
  });

  it('demande chaque timestamp une seule fois, en secondes', async () => {
    const calls = [];
    await fetchFlowPrices(
      [flow('ETH', MONDAY + 1500), flow('ETH', MONDAY + 1500)],
      [native('ETH')],
      { fetch: fakeServices({ calls }), now },
    );
    const url = new URL(calls.find((call) => call.startsWith('https://coins.llama.fi/')));
    assert.equal(url.pathname, '/batchHistorical');
    assert.equal(url.searchParams.get('searchWidth'), '86400');
    assert.deepEqual(JSON.parse(url.searchParams.get('coins')), { 'coingecko:ethereum': [MONDAY / 1000 + 1] });
  });

  it('leve sur une erreur reseau', async () => {
    const fetch = async () => { throw new Error('HTTP 429'); };
    await assert.rejects(fetchFlowPrices([flow('ETH', MONDAY)], [native('ETH')], { fetch, now }), /429/);
  });

  it('leve sur une reponse DefiLlama mal formee', async () => {
    const services = fakeServices();
    const fetch = async (url) => (url.startsWith('https://coins.llama.fi/') ? { coins: 'oops' } : services(url));
    await assert.rejects(fetchFlowPrices([flow('ETH', MONDAY)], [native('ETH')], { fetch, now }), /DefiLlama/);
  });

  it('leve sur une reponse Frankfurter mal formee', async () => {
    const services = fakeServices();
    const fetch = async (url) => (url.startsWith('https://api.frankfurter.dev/') ? { rates: null } : services(url));
    await assert.rejects(fetchFlowPrices([flow('ETH', MONDAY)], [native('ETH')], { fetch, now }), /Frankfurter/);
  });
});
