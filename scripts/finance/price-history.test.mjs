import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { fetchPriceHistories, historyUrl, parseMarketChart } from './price-history.mjs';

describe('historyUrl', () => {
  it('cote un actif natif par son identifiant', () => {
    assert.match(historyUrl({ key: 'ETH', symbol: 'ETH', contract: null }), /\/coins\/ethereum\/market_chart\?vs_currency=eur&days=365&interval=daily$/);
  });

  // Les mints Solana sont sensibles a la casse : le contrat d'origine est garde.
  it('cote un jeton par plateforme et contrat d origine', () => {
    const url = historyUrl({ key: 'epjf', symbol: 'EPjF', contract: 'EPjFWdd5', platform: 'solana' });
    assert.match(url, /\/coins\/solana\/contract\/EPjFWdd5\/market_chart\?/);
  });

  it('rend null pour un actif impossible a coter', () => {
    assert.equal(historyUrl({ key: 'BNB?', symbol: 'XYZ', contract: null }), null);
    assert.equal(historyUrl({ key: '0x1', symbol: 'A', contract: '0x1', platform: 'inconnue' }), null);
  });
});

describe('parseMarketChart', () => {
  it('trie et ecarte les points inutilisables', () => {
    assert.deepEqual(
      parseMarketChart({ prices: [[2, 20], [1, 10], [3, 0], ['x', 5], [4, null]] }),
      [[1, 10], [2, 20]],
    );
  });

  it('rend une serie vide sur une reponse inattendue', () => {
    assert.deepEqual(parseMarketChart(null), []);
  });
});

describe('fetchPriceHistories', () => {
  it('indexe chaque serie par la cle de l actif et envoie la cle API', async () => {
    const calls = [];
    const fetch = async (url, options) => {
      calls.push({ url, options });
      return { prices: [[1, url.includes('bitcoin') ? 50000 : 2000]] };
    };

    const histories = await fetchPriceHistories(
      [
        { key: 'BTC', symbol: 'BTC', contract: null },
        { key: 'ETH', symbol: 'ETH', contract: null },
        { key: 'ZZZ', symbol: 'ZZZ', contract: null },
      ],
      { apiKey: 'demo', fetch, pauseMs: 0, retry: (task) => task() },
    );

    assert.deepEqual(histories, { BTC: [[1, 50000]], ETH: [[1, 2000]] });
    assert.equal(calls.length, 2);
    assert.equal(calls[0].options.headers['x-cg-demo-api-key'], 'demo');
  });

  // Un trou dans les cours ferait ignorer un actif reel : la perf serait
  // fausse sans le moindre signal. On prefere echouer.
  it('propage une erreur reseau', async () => {
    const fetch = async () => { throw new Error('HTTP 429'); };
    await assert.rejects(
      fetchPriceHistories([{ key: 'ETH', symbol: 'ETH', contract: null }], { fetch, pauseMs: 0, retry: (task) => task() }),
      /429/,
    );
  });
});
