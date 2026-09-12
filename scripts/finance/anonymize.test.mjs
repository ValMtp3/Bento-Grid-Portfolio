// Tests du garde-fou : c'est le seul endroit qui decide ce qui devient public.
// Une regression ici publierait un patrimoine, pas un bug d'affichage.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { anonymize, assertSafe, toShares } from './anonymize.mjs';

const sum = (parts) => parts.reduce((total, part) => total + part.share, 0);

describe('toShares', () => {
  it('convertit des valeurs en parts entieres arrondies au pas de 5', () => {
    const shares = toShares([
      { label: 'ETF', value: 4500 },
      { label: 'Actions', value: 3500 },
      { label: 'Crypto', value: 2000 },
    ]);

    assert.deepEqual(shares, [
      { label: 'ETF', share: 45 },
      { label: 'Actions', share: 35 },
      { label: 'Crypto', share: 20 },
    ]);
  });

  // Sans reste redistribue, trois tiers arrondis au pas de 5 donnent 99 ou 105.
  it('somme toujours a 100 malgre les arrondis', () => {
    const shares = toShares([
      { label: 'a', value: 1 },
      { label: 'b', value: 1 },
      { label: 'c', value: 1 },
    ]);

    assert.equal(sum(shares), 100);
  });

  it('ne laisse jamais fuiter la valeur d origine', () => {
    const shares = toShares([{ label: 'ETF', value: 1234.56 }]);

    assert.deepEqual(Object.keys(shares[0]).sort(), ['label', 'share']);
  });

  it('rend une liste vide quand le total est nul, sans division par zero', () => {
    assert.deepEqual(toShares([{ label: 'ETF', value: 0 }]), []);
    assert.deepEqual(toShares([]), []);
  });

  // Une ligne a 0,4 % arrondie au pas de 5 vaut 0 : la garder afficherait une
  // legende fantome sous une barre invisible.
  it('ecarte les parts trop petites pour etre affichees', () => {
    const shares = toShares([
      { label: 'gros', value: 9990 },
      { label: 'poussiere', value: 10 },
    ]);

    assert.deepEqual(shares, [{ label: 'gros', share: 100 }]);
  });
});

describe('assertSafe', () => {
  it('laisse passer une charge utile faite de parts entieres', () => {
    assert.doesNotThrow(() => assertSafe({ mix: [{ label: 'ETF', share: 45 }] }));
  });

  for (const forbidden of ['value', 'amount', 'cash', 'quantity', 'balance', 'price', 'total']) {
    it(`refuse la cle interdite "${forbidden}"`, () => {
      assert.throws(() => assertSafe({ [forbidden]: 12 }), /cle interdite/i);
    });
  }

  for (const identifier of ['isin', 'ticker', 'symbol', 'address', 'wallet']) {
    it(`refuse l identifiant de position "${identifier}"`, () => {
      assert.throws(() => assertSafe({ [identifier]: 'AAPL' }), /cle interdite/i);
    });
  }

  // Toutes nos statistiques sont des entiers. Une decimale signale un montant
  // recopie tel quel depuis une API.
  it('refuse un nombre a virgule, meme sous une cle anodine', () => {
    assert.throws(() => assertSafe({ mix: [{ label: 'ETF', share: 45.3 }] }), /entier/i);
  });

  it('refuse une adresse EVM, Bitcoin, Solana ou Dogecoin dans une chaine', () => {
    const addresses = [
      '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
      '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      'DH5yaieqoZN36fDVciNyRueRGvGLR3mr7L',
      '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV',
    ];

    for (const address of addresses) {
      assert.throws(() => assertSafe({ note: address }), /adresse/i, address);
    }
  });

  it('inspecte aussi les objets imbriques', () => {
    assert.throws(() => assertSafe({ a: { b: { c: { cash: 1 } } } }), /cle interdite/i);
  });
});

describe('anonymize', () => {
  const portfolio = {
    positions: [
      { kind: 'etf', value: 4500, region: 'Monde', sector: null, openedAt: '2023-01-10' },
      { kind: 'stock', value: 3500, region: 'US', sector: 'Technologie', openedAt: '2024-06-01' },
      { kind: 'crypto', value: 2000, region: null, sector: null, openedAt: '2024-01-01' },
    ],
    orders: [
      { date: '2026-09-01', side: 'buy' },
      { date: '2026-09-03', side: 'buy' },
      { date: '2026-08-28', side: 'sell' },
    ],
    sources: ['Trading 212', 'on-chain'],
  };

  const now = new Date('2026-09-10T12:00:00Z');

  it('produit une charge utile qui passe son propre garde-fou', () => {
    assert.doesNotThrow(() => assertSafe(anonymize(portfolio, now)));
  });

  it('expose la composition en parts et jamais en euros', () => {
    const payload = anonymize(portfolio, now);

    assert.deepEqual(payload.mix, [
      { label: 'ETF', share: 45 },
      { label: 'Actions', share: 35 },
      { label: 'Crypto', share: 20 },
    ]);
  });

  it('compte les positions et la concentration du trio de tete', () => {
    const payload = anonymize(portfolio, now);

    assert.equal(payload.structure.positions, 3);
    assert.equal(payload.structure.topThreeShare, 100);
  });

  it('resume le comportement sans dater les ordres', () => {
    const payload = anonymize(portfolio, now);

    assert.equal(payload.behaviour.ordersLast30d, 3);
    assert.equal(payload.behaviour.buyRatio, 65);
    assert.ok(payload.behaviour.avgHoldingDays > 0);
  });

  // Quatre chaines plus un courtier : une source qui tombe ne doit pas vider la
  // carte, elle doit seulement retirer sa part du melange.
  it('reste exploitable quand une source manque', () => {
    const partial = { ...portfolio, positions: portfolio.positions.slice(0, 2) };
    const payload = anonymize(partial, now);

    assert.equal(sum(payload.mix), 100);
    assert.doesNotThrow(() => assertSafe(payload));
  });

  it('rend null plutot qu une carte vide quand il n y a aucune position', () => {
    assert.equal(anonymize({ positions: [], orders: [], sources: [] }, now), null);
  });
});

describe('anonymize : donnee absente contre donnee vide', () => {
  const now = new Date('2026-09-10T12:00:00Z');
  const positions = [{ kind: 'etf', value: 100, openedAt: '2025-01-01' }];

  // "Aucun ordre ce mois-ci" et "je n'ai pas acces a l'historique" sont deux
  // affirmations differentes. Publier la premiere a la place de la seconde
  // ferait mentir la carte.
  it('rend null quand l historique des ordres n a pas ete collecte', () => {
    const payload = anonymize({ positions, sources: [] }, now);

    assert.equal(payload.behaviour.ordersLast30d, null);
    assert.equal(payload.behaviour.buyRatio, null);
    assert.equal(payload.behaviour.favouriteDay, null);
  });

  it('rend zero quand l historique a ete collecte et se revele vide', () => {
    const payload = anonymize({ positions, orders: [], sources: [] }, now);

    assert.equal(payload.behaviour.ordersLast30d, 0);
  });
});

describe('anonymize : statistiques enrichies', () => {
  const now = new Date('2026-09-11T12:00:00Z');

  // Part du portefeuille qui produit un rendement plutot que de dormir :
  // staking natif et depots sur protocoles. Une part, jamais un montant.
  it('mesure la part des actifs qui travaillent', () => {
    const payload = anonymize(
      {
        positions: [
          { kind: 'crypto', value: 300, staked: true },
          { kind: 'crypto', value: 100 },
          { kind: 'stock', value: 100 },
        ],
        sources: [],
      },
      now,
    );

    assert.equal(payload.structure.workingShare, 60);
  });

  it('rend null quand rien ne travaille, plutot que zero', () => {
    const payload = anonymize(
      { positions: [{ kind: 'stock', value: 100 }], sources: [] },
      now,
    );

    assert.equal(payload.structure.workingShare, null);
  });

  it('publie une repartition par devise de cotation', () => {
    const payload = anonymize(
      {
        positions: [
          { kind: 'stock', value: 700, currency: 'USD' },
          { kind: 'stock', value: 300, currency: 'EUR' },
        ],
        sources: [],
      },
      now,
    );

    assert.deepEqual(payload.currencies, [
      { label: 'USD', share: 70 },
      { label: 'EUR', share: 30 },
    ]);
  });

  it('compte les reseaux blockchain interroges', () => {
    const payload = anonymize(
      {
        positions: [{ kind: 'crypto', value: 100 }],
        sources: ['Trading 212', 'EVM ethereum', 'EVM base', 'Solana', 'Bitcoin #1', 'Bitcoin #2'],
      },
      now,
    );

    // Les deux adresses Bitcoin comptent pour un seul reseau.
    assert.equal(payload.structure.networks, 4);
  });

  it('passe son propre garde-fou avec les champs enrichis', () => {
    const payload = anonymize(
      {
        positions: [{ kind: 'crypto', value: 100, staked: true, currency: 'EUR' }],
        sources: ['Solana'],
      },
      now,
    );

    assert.doesNotThrow(() => assertSafe(payload));
  });
});
