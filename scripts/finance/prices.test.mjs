// Le cours est le seul chiffre du calcul qui ne vienne pas de nous.
// Une reponse partielle ne doit jamais devenir un cours a zero applique en
// silence : elle doit faire disparaitre l'actif du melange.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  COINGECKO_IDS,
  PLATFORMS,
  parseCoinbaseRates,
  parseNativePrices,
  parseTokenPrices,
  priceKey,
} from './prices.mjs';

describe('priceKey', () => {
  // Deux jetons peuvent afficher le meme symbole, dont les contrefacons qui
  // se font passer pour USDC. Le contrat, lui, est unique.
  it('identifie un jeton par son contrat quand il y en a un', () => {
    assert.equal(priceKey({ symbol: 'USDC', contract: '0xABC' }), '0xabc');
  });

  it('retombe sur le symbole pour un actif natif', () => {
    assert.equal(priceKey({ symbol: 'eth' }), 'ETH');
  });
});

describe('parseNativePrices', () => {
  it('rend un cours par symbole natif demande', () => {
    const prices = parseNativePrices({ bitcoin: { eur: 60000 }, ethereum: { eur: 3000 } }, [
      'BTC',
      'ETH',
    ]);

    assert.deepEqual(prices, { BTC: 60000, ETH: 3000 });
  });

  it('omet un cours nul, negatif ou non numerique', () => {
    const prices = parseNativePrices(
      { bitcoin: { eur: 0 }, ethereum: { eur: -1 }, solana: { eur: 'cher' } },
      ['BTC', 'ETH', 'SOL'],
    );

    assert.deepEqual(prices, {});
  });

  it('survit a une reponse vide', () => {
    assert.deepEqual(parseNativePrices(null, ['BTC']), {});
  });
});

describe('parseTokenPrices', () => {
  // L'agregateur repond en minuscules quelle que soit la casse demandee.
  it('indexe les cours par contrat, en minuscules', () => {
    const prices = parseTokenPrices({
      '0xae7ab96520de3a18e5e111b5eaab095312d7fe84': { eur: 2800 },
    });

    assert.deepEqual(prices, { '0xae7ab96520de3a18e5e111b5eaab095312d7fe84': 2800 });
  });

  it('ecarte un contrat sans cours exploitable', () => {
    assert.deepEqual(parseTokenPrices({ '0xspam': { eur: 0 }, '0xautre': {} }), {});
  });

  it('survit a une reponse vide', () => {
    assert.deepEqual(parseTokenPrices(null), {});
  });
});

describe('PLATFORMS', () => {
  it('nomme une plateforme d agregateur pour chaque reseau suivi', () => {
    for (const chain of ['ethereum', 'base', 'arbitrum', 'polygon', 'solana']) {
      assert.ok(PLATFORMS[chain], `${chain} absent`);
    }
  });

  it('couvre au minimum les quatre actifs natifs du projet', () => {
    for (const symbol of ['BTC', 'ETH', 'SOL', 'DOGE']) {
      assert.ok(COINGECKO_IDS[symbol], `${symbol} absent`);
    }
  });
});

describe('parseCoinbaseRates', () => {
  // Coinbase repond "1 EUR vaut X crypto" : c'est l'inverse d'un cours.
  it('inverse les taux pour obtenir un cours en euros', () => {
    const prices = parseCoinbaseRates({ data: { rates: { BTC: '0.000015', ETH: '0.0005' } } }, [
      'BTC',
      'ETH',
    ]);

    assert.ok(Math.abs(prices.BTC - 66666.67) < 0.01, `recu ${prices.BTC}`);
    assert.equal(prices.ETH, 2000);
  });

  it('omet un taux nul, qui donnerait une division par zero', () => {
    assert.deepEqual(parseCoinbaseRates({ data: { rates: { BTC: '0' } } }, ['BTC']), {});
  });

  it('survit a une reponse vide', () => {
    assert.deepEqual(parseCoinbaseRates(null, ['BTC']), {});
    assert.deepEqual(parseCoinbaseRates({ data: {} }, ['BTC']), {});
  });
});

describe('PLATFORMS face aux chaines sans explorateur', () => {
  it('nomme une plateforme pour optimism et bnb', () => {
    assert.equal(PLATFORMS.optimism, 'optimistic-ethereum');
    assert.equal(PLATFORMS.bnb, 'binance-smart-chain');
  });
});
