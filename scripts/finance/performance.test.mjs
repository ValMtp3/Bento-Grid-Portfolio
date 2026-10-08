// Tout ce qui touche a l'argent passe ici : les chiffres sont choisis a la main
// pour que chaque attente se verifie de tete.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { currentPrice, hideWeakPerformance, priceAt, sumContributions, toPerformance, valueHoldings } from './performance.mjs';

const DAY = 24 * 60 * 60 * 1000;
const T0 = Date.UTC(2026, 0, 1);
const series = [[T0, 100], [T0 + DAY, 110], [T0 + 2 * DAY, 120]];

const flow = (time, key, amount) => ({ time, key, symbol: key, contract: null, platform: null, amount });

describe('priceAt', () => {
  it('prend le point le plus proche du flux', () => {
    assert.equal(priceAt(series, T0 + DAY + 3600_000), 110);
    assert.equal(priceAt(series, T0 + 2 * DAY - 3600_000), 120);
  });

  // DefiLlama rend le cours le plus proche du moment demande, parfois juste
  // apres le mouvement.
  it('prend un point juste apres le flux, dans le rayon d un jour', () => {
    assert.equal(priceAt([[T0 + 6 * 3600_000, 100]], T0), 100);
  });

  it('tolere un flux le jour precedant le premier point', () => {
    assert.equal(priceAt(series, T0 - 3600_000), 100);
  });

  // Un cours vieux de plusieurs jours n'est plus celui du mouvement.
  it('rend null quand le point le plus proche est a plus d un jour', () => {
    assert.equal(priceAt(series, T0 + 10 * DAY), null);
    assert.equal(priceAt(series, T0 + 3 * DAY + 1), null);
  });

  it('accepte un point a exactement un jour', () => {
    assert.equal(priceAt(series, T0 + 3 * DAY), 120);
  });

  // Un flux plus vieux que l'historique ne peut pas etre valorise : l'estimer
  // au plus vieux cours connu serait inventer un chiffre.
  it('rend null pour un flux plus ancien que la serie', () => {
    assert.equal(priceAt(series, T0 - 3 * DAY), null);
  });

  it('rend null sur une serie vide', () => {
    assert.equal(priceAt([], T0), null);
  });
});

describe('sumContributions', () => {
  it('additionne les entrees et retranche les sorties au cours du jour', () => {
    const result = sumContributions(
      [flow(T0, 'ETH', 2), flow(T0 + 2 * DAY, 'ETH', -1)],
      { ETH: series },
    );

    assert.deepEqual(result, { complete: true, total: 2 * 100 - 120 });
  });

  // Un swap sort et rentre le meme jour pour la meme valeur : il s'annule.
  it('neutralise un swap entre deux actifs cotes', () => {
    const result = sumContributions(
      [flow(T0, 'USDC', -100), flow(T0, 'ETH', 1)],
      { USDC: [[T0, 1]], ETH: series },
    );

    assert.equal(result.total, 0);
  });

  it('ignore un actif sans historique, comme un jeton de spam', () => {
    const result = sumContributions([flow(T0, 'SPAM', 1e9)], { ETH: series });

    assert.deepEqual(result, { complete: true, total: 0 });
  });

  it('signale un flux plus ancien que l historique', () => {
    const result = sumContributions([flow(T0 - 30 * DAY, 'ETH', 1)], { ETH: series });

    assert.deepEqual(result, { complete: false, total: null });
  });

  // Sans ce traitement, l'USDC depose sort du total alors que le coffre est
  // compte dans la valeur actuelle : le gain serait gonfle du depot entier.
  it('valorise les parts d un coffre au taux actuel et au cours du sous-jacent', () => {
    const vaults = { share: { underlyingKey: 'USDC', rate: 1.05, underlying: {} } };
    const result = sumContributions(
      [flow(T0, 'USDC', -100), flow(T0, 'share', 100)],
      { USDC: [[T0, 1]] },
      vaults,
    );

    assert.ok(Math.abs(result.total - 5) < 1e-9);
  });
});

describe('currentPrice', () => {
  const vaults = { '0xshare': { underlyingKey: '0xusdc', rate: 1.5, underlying: {} } };

  it('prend le cours direct d un solde cote', () => {
    assert.equal(currentPrice({ symbol: 'ETH', amount: 1 }, { ETH: 1000 }, {}), 1000);
  });

  it('convertit une part de coffre par le cours du sous-jacent et le taux', () => {
    assert.equal(currentPrice({ symbol: 'X', contract: '0xSHARE', amount: 1 }, { '0xusdc': 2 }, vaults), 3);
  });

  it('rend null sans cours exploitable', () => {
    assert.equal(currentPrice({ symbol: 'Y', contract: '0xNOPRICE', amount: 1 }, {}, vaults), null);
    assert.equal(currentPrice({ symbol: 'ETH', amount: 1 }, { ETH: 0 }, {}), null);
    assert.equal(currentPrice({ symbol: 'X', contract: '0xSHARE', amount: 1 }, {}, vaults), null);
  });
});

describe('valueHoldings', () => {
  it('valorise au cours actuel et passe par le sous-jacent pour un coffre', () => {
    const total = valueHoldings(
      [
        { symbol: 'ETH', amount: 2 },
        { symbol: 'X', contract: '0xSHARE', amount: 10 },
        { symbol: 'Y', contract: '0xNOPRICE', amount: 99 },
      ],
      { ETH: 1000, '0xusdc': 1 },
      { '0xshare': { underlyingKey: '0xusdc', rate: 1.5, underlying: {} } },
    );

    assert.equal(total, 2000 + 15);
  });
});

describe('toPerformance', () => {
  it('pondere le global par les couts, en pourcentages entiers', () => {
    assert.deepEqual(
      toPerformance({ stocks: { cost: 1000, gain: 100 }, crypto: { cost: 3000, gain: 900 } }),
      { overall: 25, stocks: 10, crypto: 30 },
    );
  });

  it('masque le global quand une des deux mesures manque', () => {
    assert.deepEqual(
      toPerformance({ stocks: { cost: 1000, gain: -50 }, crypto: null }),
      { overall: null, stocks: -5, crypto: null },
    );
  });

  // Plus retire que depose : le rapport gain / apport n'a plus de sens.
  it('ecarte des apports nets nuls ou negatifs', () => {
    assert.deepEqual(
      toPerformance({ stocks: null, crypto: { cost: -200, gain: 900 } }),
      null,
    );
  });

  // Un apport net minuscule (gains deja sortis vers une plateforme) donnerait
  // un % absurde, a quatre chiffres.
  it('masque la crypto quand l apport net pese moins de 10 % de la valeur actuelle', () => {
    assert.deepEqual(
      toPerformance({ stocks: { cost: 1000, gain: 100 }, crypto: { cost: 50, gain: 950 } }),
      { overall: null, stocks: 10, crypto: null },
    );
  });

  it('publie la crypto quand l apport net pese pile 10 % de la valeur actuelle', () => {
    assert.deepEqual(
      toPerformance({ stocks: null, crypto: { cost: 100, gain: 900 } }),
      { overall: null, stocks: null, crypto: 900 },
    );
  });

  it('n applique pas ce plancher a la bourse', () => {
    assert.equal(toPerformance({ stocks: { cost: 50, gain: 950 } }).stocks, 1900);
  });

  it('ne rend jamais -0', () => {
    assert.equal(Object.is(toPerformance({ stocks: { cost: 1000, gain: -1 } }).stocks, 0), true);
  });

  it('rend null sans aucune mesure', () => {
    assert.equal(toPerformance({}), null);
    assert.equal(toPerformance(undefined), null);
  });
});

describe('hideWeakPerformance', () => {
  const perf = (overall, stocks, crypto) => ({
    overall,
    stocks,
    crypto,
    publishedAt: { stocks: '2026-01-01T00:00:00.000Z', crypto: null },
  });

  it('garde un global de 12 %', () => {
    const input = perf(12, 8, 20);
    assert.deepEqual(hideWeakPerformance(input), input);
  });

  it('masque un global de 9 %', () => {
    assert.equal(hideWeakPerformance(perf(9, 8, 20)), null);
  });

  it('masque un global negatif', () => {
    assert.equal(hideWeakPerformance(perf(-1, 8, 20)), null);
  });

  it('garde exactement 10 %', () => {
    const input = perf(10, 8, 20);
    assert.deepEqual(hideWeakPerformance(input), input);
  });

  it('sans global, garde la bourse seule a 15 %', () => {
    const input = perf(null, 15, null);
    assert.deepEqual(hideWeakPerformance(input), input);
  });

  it('sans global, masque la bourse seule a 3 %', () => {
    assert.equal(hideWeakPerformance(perf(null, 3, null)), null);
  });

  it('sans global, garde la crypto seule a 20 %', () => {
    const input = perf(null, null, 20);
    assert.deepEqual(hideWeakPerformance(input), input);
  });

  it('sans rien a montrer, rend null', () => {
    assert.equal(hideWeakPerformance(null), null);
    assert.equal(hideWeakPerformance(perf(null, null, null)), null);
  });

  it('conserve publishedAt quand la performance est gardee', () => {
    const input = perf(12, 8, 20);
    assert.deepEqual(hideWeakPerformance(input).publishedAt, input.publishedAt);
  });
});
