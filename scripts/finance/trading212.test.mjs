// Le courtier ne fournit ni secteur ni pays : tout ce que ce module deduit
// vient de l'ISIN et du nom de l'instrument. Ces heuristiques sont la partie
// la plus fragile du pipeline, donc la plus testee.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  authHeader,
  countryFromIsin,
  isEtf,
  parseOrders,
  parsePositions,
  regionFromIsin,
} from './trading212.mjs';

describe('authHeader', () => {
  // Le contrat actuel demande du Basic cle:secret, l'ancien la cle brute. Les
  // deux restent acceptes cote serveur ; on choisit selon ce qui est fourni.
  it('encode cle et secret en Basic quand les deux sont la', () => {
    const header = authHeader('ma-cle', 'mon-secret');
    assert.equal(header, `Basic ${Buffer.from('ma-cle:mon-secret').toString('base64')}`);
  });

  it('envoie la cle brute quand il n y a pas de secret', () => {
    assert.equal(authHeader('ma-cle', undefined), 'ma-cle');
    assert.equal(authHeader('ma-cle', ''), 'ma-cle');
  });

  it('refuse de fabriquer un en-tete sans cle', () => {
    assert.throws(() => authHeader('', 'secret'), /cle/i);
  });
});

describe('regionFromIsin', () => {
  it('classe les grandes zones a partir du prefixe pays', () => {
    assert.equal(regionFromIsin('US0378331005'), 'Amerique du Nord');
    assert.equal(regionFromIsin('FR0000121014'), 'Europe');
    assert.equal(regionFromIsin('DE0007164600'), 'Europe');
    assert.equal(regionFromIsin('JP3633400001'), 'Asie');
  });

  it('range les pays inconnus dans un reste explicite', () => {
    assert.equal(regionFromIsin('ZZ0000000000'), 'Autres');
  });

  it('rend null sur un ISIN absent ou trop court', () => {
    assert.equal(regionFromIsin(null), null);
    assert.equal(regionFromIsin('U'), null);
  });
});

describe('countryFromIsin', () => {
  it('extrait le code pays des deux premieres lettres', () => {
    assert.equal(countryFromIsin('US0378331005'), 'US');
    assert.equal(countryFromIsin('ky1234567890'), 'KY');
  });

  it('rend null sur un ISIN absent ou trop court', () => {
    assert.equal(countryFromIsin(null), null);
    assert.equal(countryFromIsin('F'), null);
  });
});

describe('isEtf', () => {
  it('reconnait les marqueurs de fonds indiciels', () => {
    for (const name of [
      'Vanguard S&P 500 UCITS ETF',
      'iShares Core MSCI World',
      'Amundi MSCI Emerging Markets',
      'Xtrackers DAX',
      'SPDR Gold Shares',
    ]) {
      assert.equal(isEtf(name), true, name);
    }
  });

  it('ne confond pas une action avec un fonds', () => {
    for (const name of ['Apple Inc', 'Sanofi', 'LVMH Moet Hennessy']) {
      assert.equal(isEtf(name), false, name);
    }
  });

  it('tolere un nom absent', () => {
    assert.equal(isEtf(null), false);
  });
});

describe('parsePositions', () => {
  const position = (overrides = {}) => ({
    instrument: { ticker: 'AAPL_US_EQ', name: 'Apple Inc', isin: 'US0378331005', currency: 'USD' },
    quantity: 15.5,
    createdAt: '2024-01-10T09:15:00Z',
    walletImpact: { currency: 'EUR', currentValue: 2275.1 },
    ...overrides,
  });

  it('lit la valeur deja convertie en devise du compte', () => {
    const [parsed] = parsePositions([position()]);

    assert.equal(parsed.value, 2275.1);
    // Devise de cotation, pas devise du compte.
    assert.equal(parsed.currency, 'USD');
    assert.equal(parsed.country, 'US');
    assert.equal(parsed.kind, 'stock');
    assert.equal(parsed.region, 'Amerique du Nord');
    assert.equal(parsed.openedAt, '2024-01-10T09:15:00Z');
  });

  it('classe les fonds indiciels a part des actions', () => {
    const [parsed] = parsePositions([
      position({
        instrument: {
          ticker: 'VUSAa_EQ',
          name: 'Vanguard S&P 500 UCITS ETF',
          isin: 'IE00B3XXRP09',
          currency: 'EUR',
        },
      }),
    ]);

    assert.equal(parsed.kind, 'etf');
  });

  // Un ETF World domicilie en Irlande investit partout sauf en Irlande : le
  // ranger en Europe rendrait la carte geographique franchement fausse.
  it('n attribue aucune zone a un fonds indiciel', () => {
    const [parsed] = parsePositions([
      position({
        instrument: { ticker: 'VWCEd_EQ', name: 'Vanguard FTSE All-World UCITS ETF', isin: 'IE00BK5BQT80' },
      }),
    ]);

    assert.equal(parsed.region, null);
  });

  it('ne laisse jamais passer le ticker ni l ISIN vers la suite du pipeline', () => {
    const [parsed] = parsePositions([position()]);
    const keys = Object.keys(parsed).sort();

    assert.deepEqual(keys, ['country', 'currency', 'kind', 'openedAt', 'region', 'value']);
  });

  it('ecarte les lignes sans valeur exploitable', () => {
    const parsed = parsePositions([
      position({ walletImpact: { currency: 'EUR', currentValue: 0 } }),
      position({ walletImpact: null }),
    ]);

    assert.deepEqual(parsed, []);
  });

  it('survit a une reponse qui n est pas un tableau', () => {
    assert.deepEqual(parsePositions(null), []);
    assert.deepEqual(parsePositions({ error: 'nope' }), []);
  });
});

describe('parseOrders', () => {
  const order = (side, createdAt, status = 'FILLED') => ({
    order: { side, createdAt, status, ticker: 'AAPL_US_EQ', value: 1234.5 },
    fill: { quantity: 3, price: 185.5 },
  });

  it('ne garde que la date et le sens, jamais le montant', () => {
    const parsed = parseOrders({ items: [order('BUY', '2026-09-01T10:00:00Z')] });

    assert.deepEqual(parsed, [{ date: '2026-09-01T10:00:00Z', side: 'buy' }]);
  });

  it('normalise le sens en minuscules', () => {
    const parsed = parseOrders({ items: [order('SELL', '2026-09-01T10:00:00Z')] });
    assert.equal(parsed[0].side, 'sell');
  });

  // Un ordre annule ou rejete n'est pas un acte d'investissement : le compter
  // gonflerait le rythme affiche sans qu'aucune position ait bouge.
  it('ecarte les ordres non executes', () => {
    const parsed = parseOrders({
      items: [
        order('BUY', '2026-09-01T10:00:00Z', 'CANCELLED'),
        order('BUY', '2026-09-02T10:00:00Z', 'REJECTED'),
        order('BUY', '2026-09-03T10:00:00Z', 'FILLED'),
      ],
    });

    assert.equal(parsed.length, 1);
  });

  it('ecarte un ordre sans date exploitable', () => {
    assert.deepEqual(parseOrders({ items: [order('BUY', null)] }), []);
  });

  it('survit a une reponse vide ou inattendue', () => {
    assert.deepEqual(parseOrders(null), []);
    assert.deepEqual(parseOrders({ items: null }), []);
    assert.deepEqual(parseOrders({ error: 'nope' }), []);
  });
});
