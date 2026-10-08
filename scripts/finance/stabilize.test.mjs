// Le workflow tourne toutes les 6 h : sans stabilisation, un % qui oscille
// d'un point produirait un commit a chaque passage, et une panne passagere
// effacerait la ligne de la carte. Ces tests figent les deux decisions :
// seuil de 2 points et memoire de 24 h.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { assertSafe } from './anonymize.mjs';
import { stabilizePerformance } from './stabilize.mjs';

const HOUR = 60 * 60 * 1000;
const NOW = new Date(Date.UTC(2026, 9, 7, 12));
const ago = (hours) => new Date(NOW.getTime() - hours * HOUR).toISOString();
const NOW_ISO = NOW.toISOString();

const published = (values, dates) => ({ ...values, publishedAt: dates });

describe('stabilizePerformance', () => {
  it('publie la mesure telle quelle sans fichier precedent', () => {
    assert.deepEqual(
      stabilizePerformance(null, { overall: 12, stocks: 10, crypto: 20 }, NOW),
      published({ overall: 12, stocks: 10, crypto: 20 }, { stocks: NOW_ISO, crypto: NOW_ISO }),
    );
  });

  it('garde la valeur precedente et sa date pour un ecart de 1 point', () => {
    const previous = published({ overall: 12, stocks: 10, crypto: 20 }, { stocks: ago(30), crypto: ago(30) });
    assert.deepEqual(
      stabilizePerformance(previous, { overall: 13, stocks: 11, crypto: 19 }, NOW),
      previous,
    );
  });

  it('publie la nouvelle valeur pour un ecart de 2 points', () => {
    const previous = published({ overall: 12, stocks: 10, crypto: 20 }, { stocks: ago(30), crypto: ago(30) });
    assert.deepEqual(
      stabilizePerformance(previous, { overall: 13, stocks: 12, crypto: 20 }, NOW),
      published({ overall: 12, stocks: 12, crypto: 20 }, { stocks: NOW_ISO, crypto: ago(30) }),
    );
  });

  it('applique le seuil au global quand les deux mesures sont fraiches', () => {
    const previous = published({ overall: 12, stocks: 10, crypto: 20 }, { stocks: ago(1), crypto: ago(1) });
    const result = stabilizePerformance(previous, { overall: 14, stocks: 13, crypto: 20 }, NOW);
    assert.equal(result.overall, 14);
  });

  it('publie une mesure qui apparait (null -> valeur)', () => {
    const previous = published({ overall: null, stocks: 10, crypto: null }, { stocks: ago(1), crypto: null });
    assert.deepEqual(
      stabilizePerformance(previous, { overall: 15, stocks: 10, crypto: 30 }, NOW),
      published({ overall: 15, stocks: 10, crypto: 30 }, { stocks: ago(1), crypto: NOW_ISO }),
    );
  });

  it('reporte une valeur publiee il y a 23 h quand sa mesure echoue', () => {
    const previous = published({ overall: 12, stocks: 10, crypto: 20 }, { stocks: ago(1), crypto: ago(23) });
    assert.deepEqual(
      stabilizePerformance(previous, { overall: null, stocks: 10, crypto: null }, NOW),
      published({ overall: 12, stocks: 10, crypto: 20 }, { stocks: ago(1), crypto: ago(23) }),
    );
  });

  it('masque une valeur publiee il y a 25 h quand sa mesure echoue', () => {
    const previous = published({ overall: 12, stocks: 10, crypto: 20 }, { stocks: ago(1), crypto: ago(25) });
    assert.deepEqual(
      stabilizePerformance(previous, { overall: null, stocks: 10, crypto: null }, NOW),
      published({ overall: null, stocks: 10, crypto: null }, { stocks: ago(1), crypto: null }),
    );
  });

  it('reporte les deux valeurs et le global quand toute la mesure echoue', () => {
    const previous = published({ overall: 12, stocks: 10, crypto: 20 }, { stocks: ago(2), crypto: ago(3) });
    assert.deepEqual(stabilizePerformance(previous, null, NOW), previous);
  });

  // Une valeur reportee et une fraiche ne se recombinent pas en un nouveau
  // global : on garde le dernier global publie.
  it('garde le global precedent quand une des deux valeurs est reportee', () => {
    const previous = published({ overall: 12, stocks: 10, crypto: 20 }, { stocks: ago(2), crypto: ago(2) });
    const result = stabilizePerformance(previous, { overall: null, stocks: 30, crypto: null }, NOW);
    assert.deepEqual(result, published({ overall: 12, stocks: 30, crypto: 20 }, { stocks: NOW_ISO, crypto: ago(2) }));
  });

  it('masque le global reporte s il n existait pas', () => {
    const previous = published({ overall: null, stocks: 10, crypto: 20 }, { stocks: ago(2), crypto: ago(2) });
    const result = stabilizePerformance(previous, { overall: null, stocks: 10, crypto: null }, NOW);
    assert.equal(result.overall, null);
  });

  it('masque le global quand une des deux valeurs finales est nulle', () => {
    const previous = published({ overall: 12, stocks: 10, crypto: 20 }, { stocks: ago(2), crypto: ago(30) });
    const result = stabilizePerformance(previous, { overall: null, stocks: 10, crypto: null }, NOW);
    assert.equal(result.crypto, null);
    assert.equal(result.overall, null);
  });

  it('rend null quand rien n est mesure ni reportable', () => {
    assert.equal(stabilizePerformance(null, null, NOW), null);
    const stale = published({ overall: 12, stocks: 10, crypto: 20 }, { stocks: ago(30), crypto: ago(30) });
    assert.equal(stabilizePerformance(stale, null, NOW), null);
  });

  // Un fichier publie avant l'ajout de publishedAt n'a pas de date : la valeur
  // reste mesuree, elle prend la date du jour au lieu de rester sans date.
  it('date du jour une valeur gardee qui n avait pas de date', () => {
    const result = stabilizePerformance({ overall: 12, stocks: 10, crypto: 20 }, { overall: 12, stocks: 10, crypto: 21 }, NOW);
    assert.deepEqual(result, published({ overall: 12, stocks: 10, crypto: 20 }, { stocks: NOW_ISO, crypto: NOW_ISO }));
  });

  it('ne reporte pas une valeur precedente sans date', () => {
    const result = stabilizePerformance({ overall: 12, stocks: 10, crypto: 20 }, { overall: null, stocks: 10, crypto: null }, NOW);
    assert.equal(result.crypto, null);
  });

  it('ne modifie pas ses arguments', () => {
    const previous = Object.freeze(published(
      { overall: 12, stocks: 10, crypto: 20 },
      Object.freeze({ stocks: ago(2), crypto: ago(2) }),
    ));
    const current = Object.freeze({ overall: 30, stocks: 30, crypto: 30 });
    assert.doesNotThrow(() => stabilizePerformance(previous, current, NOW));
  });

  // Une date n'est pas un montant : la frontiere d'anonymisation doit
  // l'accepter sans etre assouplie.
  it('produit une forme acceptee par assertSafe', () => {
    const result = stabilizePerformance(null, { overall: 12, stocks: 10, crypto: 20 }, NOW);
    assert.doesNotThrow(() => assertSafe({ performance: result }));
  });
});
