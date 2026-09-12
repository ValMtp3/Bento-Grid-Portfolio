// Etape entre les soldes bruts on-chain et les positions comparables aux
// actions : c'est ici qu'un actif peut disparaitre du melange sans bruit, donc
// ici que les tests doivent etre les plus mefiants.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { mergeHoldings, toCryptoPositions } from './holdings.mjs';

describe('mergeHoldings', () => {
  // La meme adresse detient de l'ETH sur Ethereum, Base et Arbitrum : trois
  // lignes "ETH" dans le camembert seraient un artefact technique, pas une
  // information.
  it('additionne un meme actif natif detenu sur plusieurs chaines', () => {
    const merged = mergeHoldings([
      { symbol: 'ETH', amount: 1.5 },
      { symbol: 'ETH', amount: 0.5 },
      { symbol: 'SOL', amount: 10 },
    ]);

    assert.deepEqual(merged, [
      { symbol: 'ETH', amount: 2, platform: null, contract: null, staked: false },
      { symbol: 'SOL', amount: 10, platform: null, contract: null, staked: false },
    ]);
  });

  it('additionne un jeton reparti sur plusieurs comptes du meme contrat', () => {
    const merged = mergeHoldings([
      { symbol: 'USDC', amount: 100, platform: 'ethereum', contract: '0xA0b8' },
      { symbol: 'USDC', amount: 50, platform: 'ethereum', contract: '0xa0b8' },
    ]);

    assert.equal(merged.length, 1);
    assert.equal(merged[0].amount, 150);
  });

  // Un faux USDC porte le meme symbole que le vrai mais un autre contrat.
  // Les confondre gonflerait le portefeuille avec de la monnaie de singe.
  it('ne confond pas deux jetons de meme symbole et de contrats differents', () => {
    const merged = mergeHoldings([
      { symbol: 'USDC', amount: 100, platform: 'ethereum', contract: '0xVRAI' },
      { symbol: 'USDC', amount: 999999, platform: 'ethereum', contract: '0xFAUX' },
    ]);

    assert.equal(merged.length, 2);
  });

  it('ecarte les entrees sans symbole ou sans quantite', () => {
    const merged = mergeHoldings([
      { symbol: null, amount: 5 },
      { symbol: 'ETH', amount: 0 },
      { symbol: 'BTC', amount: 1 },
    ]);

    assert.equal(merged.length, 1);
    assert.equal(merged[0].symbol, 'BTC');
  });

  it('rend une liste vide sur une entree vide', () => {
    assert.deepEqual(mergeHoldings([]), []);
    assert.deepEqual(mergeHoldings(null), []);
  });
});

describe('toCryptoPositions', () => {
  const prices = { BTC: 60000, ETH: 3000, '0xa0b8': 0.92 };

  it('valorise un actif natif au cours de son symbole', () => {
    const positions = toCryptoPositions([{ symbol: 'BTC', amount: 0.5 }], prices);

    assert.equal(positions.length, 1);
    assert.equal(positions[0].kind, 'crypto');
    assert.equal(positions[0].value, 30000);
  });

  it('valorise un jeton au cours de son contrat, insensible a la casse', () => {
    const positions = toCryptoPositions(
      [{ symbol: 'USDC', amount: 100, platform: 'ethereum', contract: '0xA0B8' }],
      prices,
    );

    assert.equal(positions[0].value, 92);
  });

  // Une crypto dans le camembert geographique melangerait une classe d'actifs
  // avec des pays ; dans le compteur de devises, elle en inventerait une.
  it('laisse la crypto hors des repartitions par zone et par devise', () => {
    const [position] = toCryptoPositions([{ symbol: 'ETH', amount: 1 }], prices);

    assert.equal(position.region, null);
    assert.equal(position.currency, null);
  });

  // Un wallet traine des jetons de spam qu'aucun agregateur ne cote. Les
  // ignorer est le bon comportement, mais il doit rester visible dans le
  // journal du job, pas silencieux.
  it('ecarte les actifs sans cours connu et les signale', () => {
    const skipped = [];
    const positions = toCryptoPositions(
      [
        { symbol: 'ETH', amount: 1 },
        { symbol: 'ARNAQUE', amount: 1000, platform: 'ethereum', contract: '0xSPAM' },
      ],
      prices,
      { onSkip: (symbol) => skipped.push(symbol) },
    );

    assert.equal(positions.length, 1);
    assert.deepEqual(skipped, ['ARNAQUE']);
  });

  it('ecarte un actif dont le cours est nul ou aberrant', () => {
    const positions = toCryptoPositions(
      [
        { symbol: 'ETH', amount: 1 },
        { symbol: 'BTC', amount: 1 },
      ],
      { ETH: 0, BTC: Number.NaN },
    );

    assert.deepEqual(positions, []);
  });

  it('rend une liste vide quand aucun cours n est disponible', () => {
    assert.deepEqual(toCryptoPositions([{ symbol: 'ETH', amount: 1 }], {}), []);
  });
});

describe('propagation du marqueur de rendement', () => {
  it('conserve le marqueur en fusionnant une ligne placee et une ligne liquide', () => {
    const merged = mergeHoldings([
      { symbol: 'SOL', amount: 10 },
      { symbol: 'SOL', amount: 5, staked: true },
    ]);

    assert.equal(merged.length, 1);
    assert.equal(merged[0].staked, true);
  });

  it('reporte le marqueur sur la position valorisee', () => {
    const [position] = toCryptoPositions([{ symbol: 'SOL', amount: 1, staked: true }], { SOL: 150 });
    assert.equal(position.staked, true);
  });

  it('laisse une ligne ordinaire non marquee', () => {
    const [position] = toCryptoPositions([{ symbol: 'SOL', amount: 1 }], { SOL: 150 });
    assert.equal(position.staked, false);
  });
});
