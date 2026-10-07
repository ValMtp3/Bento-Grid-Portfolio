import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { flowAssets, measureCryptoPerformance } from './crypto-performance.mjs';

const DAY = 24 * 60 * 60 * 1000;
const T0 = Date.UTC(2026, 0, 1);
const flow = (key, amount, extra = {}) => ({ time: T0, key, symbol: key, contract: null, platform: null, amount, ...extra });

const baseOptions = (overrides = {}) => ({
  targets: [{ family: 'evm', network: 'ethereum', address: '0xme' }],
  holdings: [{ symbol: 'ETH', amount: 2, network: 'ethereum' }],
  prices: { ETH: 150 },
  vaults: {},
  readers: { evm: async () => ({ flows: [flow('ETH', 2)], truncated: false }) },
  listPrices: async () => ({}),
  fetchHistories: async () => ({ ETH: [[T0, 100]] }),
  ...overrides,
});

describe('flowAssets', () => {
  it('rend un actif par cle', () => {
    assert.deepEqual(flowAssets([flow('ETH', 1), flow('ETH', -1)]), [
      { key: 'ETH', symbol: 'ETH', contract: null, platform: null },
    ]);
  });
});

describe('measureCryptoPerformance', () => {
  it('compare la valeur actuelle aux apports nets', async () => {
    assert.deepEqual(await measureCryptoPerformance(baseOptions()), { cost: 200, gain: 100 });
  });

  it('masque la mesure si une source est tronquee', async () => {
    const result = await measureCryptoPerformance(baseOptions({
      readers: { evm: async () => ({ flows: [], truncated: true }) },
    }));
    assert.equal(result, null);
  });

  it('masque la mesure si un flux precede l historique des cours', async () => {
    const result = await measureCryptoPerformance(baseOptions({
      readers: { evm: async () => ({ flows: [{ ...flow('ETH', 2), time: T0 - 30 * DAY }], truncated: false }) },
    }));
    assert.equal(result, null);
  });

  // Un jeton de spam non cote ne doit ni couter un appel d'historique, ni
  // peser dans les apports.
  it('ne demande l historique que des jetons cotes', async () => {
    const asked = [];
    const result = await measureCryptoPerformance(baseOptions({
      readers: {
        evm: async () => ({
          flows: [flow('ETH', 2), flow('0xspam', 1e9, { contract: '0xSPAM', platform: 'ethereum' })],
          truncated: false,
        }),
      },
      listPrices: async () => ({}),
      fetchHistories: async (assets) => { asked.push(...assets.map((asset) => asset.key)); return { ETH: [[T0, 100]] }; },
    }));
    assert.deepEqual(asked, ['ETH']);
    assert.deepEqual(result, { cost: 200, gain: 100 });
  });

  // Une cotation en panne ferait ignorer un vrai jeton : le resultat serait
  // faux sans signal.
  it('masque la mesure si la cotation des jetons echoue', async () => {
    const result = await measureCryptoPerformance(baseOptions({
      readers: { evm: async () => ({ flows: [flow('0xusdc', 5, { contract: '0xUSDC', platform: 'ethereum' })], truncated: false }) },
      listPrices: async (_assets, { onFallback }) => { onFallback(new Error('HTTP 500')); return {}; },
    }));
    assert.equal(result, null);
  });

  it('exclut BNB Chain des flux et de la valeur actuelle', async () => {
    const read = [];
    const result = await measureCryptoPerformance(baseOptions({
      targets: [
        { family: 'evm', network: 'ethereum', address: '0xme' },
        { family: 'evm', network: 'bnb', address: '0xme' },
      ],
      holdings: [{ symbol: 'ETH', amount: 2, network: 'ethereum' }, { symbol: 'BNB', amount: 10, network: 'bnb' }],
      prices: { ETH: 150, BNB: 500 },
      readers: { evm: async (_address, network) => { read.push(network); return { flows: [flow('ETH', 2)], truncated: false }; } },
    }));
    assert.deepEqual(read, ['ethereum']);
    assert.deepEqual(result, { cost: 200, gain: 100 });
  });

  it('rend null sans cible mesurable', async () => {
    assert.equal(await measureCryptoPerformance(baseOptions({ targets: [{ family: 'evm', network: 'bnb', address: '0x' }] })), null);
  });

  // Le premier appel de cours (plus large, hors de ce module) peut omettre un
  // jeton detenu alors que ses mouvements sont bien listes ensuite : sans
  // controle, l'apport compterait et la valeur actuelle vaudrait zero.
  it('masque la mesure si un jeton detenu manque dans les cours actuels', async () => {
    const result = await measureCryptoPerformance(baseOptions({
      holdings: [{ symbol: 'USDC', amount: 100, contract: '0xUSDC', platform: 'ethereum', network: 'ethereum' }],
      prices: {},
      readers: {
        evm: async () => ({
          flows: [flow('0xusdc', 100, { contract: '0xUSDC', platform: 'ethereum' })],
          truncated: false,
        }),
      },
      listPrices: async () => ({ '0xusdc': 1 }),
      fetchHistories: async () => ({ '0xusdc': [[T0, 1]] }),
    }));
    assert.equal(result, null);
  });

  // Le cours du sous-jacent peut echouer independamment du cours de la part :
  // sans controle, la part de coffre compterait dans les apports et vaudrait
  // zero dans la valeur actuelle.
  it('masque la mesure si le cours du sous-jacent d un coffre manque', async () => {
    const vaults = {
      '0xvault': {
        underlyingKey: '0xunderlying',
        rate: 1,
        underlying: { key: '0xunderlying', symbol: '0xunderlying', contract: '0xUNDERLYING', platform: 'ethereum' },
      },
    };
    const result = await measureCryptoPerformance(baseOptions({
      holdings: [{ symbol: 'VAULT', amount: 10, contract: '0xVAULT', platform: 'ethereum', network: 'ethereum' }],
      prices: {},
      vaults,
      readers: {
        evm: async () => ({
          flows: [flow('0xvault', 10, { contract: '0xVAULT', platform: 'ethereum' })],
          truncated: false,
        }),
      },
      listPrices: async () => ({}),
      fetchHistories: async () => ({ '0xunderlying': [[T0, 2]] }),
    }));
    assert.equal(result, null);
  });

  // Un historique vide pour un actif demande ferait compter ses apports pour
  // zero alors qu'il pese dans la valeur actuelle : le gain serait gonfle.
  it('masque la mesure si l historique d un actif demande est vide', async () => {
    const result = await measureCryptoPerformance(baseOptions({
      fetchHistories: async () => ({ ETH: [] }),
    }));
    assert.equal(result, null);
  });

  // Un solde detenu et cote sans le moindre mouvement signale un historique
  // incomplet, pas un portefeuille sans apport.
  it('masque la mesure si un solde cote n a aucun mouvement connu', async () => {
    const result = await measureCryptoPerformance(baseOptions({
      readers: { evm: async () => ({ flows: [], truncated: false }) },
    }));
    assert.equal(result, null);
  });

  it('rejette si une source leve une erreur', async () => {
    await assert.rejects(measureCryptoPerformance(baseOptions({
      readers: { evm: async () => { throw new Error('boom'); } },
    })));
  });

  it('valorise une part de coffre par son sous-jacent et son taux', async () => {
    const vaults = {
      '0xvault': {
        underlyingKey: '0xunderlying',
        rate: 2,
        underlying: { key: '0xunderlying', symbol: '0xunderlying', contract: '0xUNDERLYING', platform: 'ethereum' },
      },
    };
    const result = await measureCryptoPerformance(baseOptions({
      holdings: [{ symbol: 'VAULT', amount: 10, contract: '0xVAULT', platform: 'ethereum', network: 'ethereum' }],
      prices: { '0xunderlying': 3 },
      vaults,
      readers: {
        evm: async () => ({
          flows: [flow('0xvault', 10, { contract: '0xVAULT', platform: 'ethereum' })],
          truncated: false,
        }),
      },
      listPrices: async () => ({}),
      fetchHistories: async () => ({ '0xunderlying': [[T0, 1]] }),
    }));
    assert.deepEqual(result, { cost: 20, gain: 40 });
  });
});
