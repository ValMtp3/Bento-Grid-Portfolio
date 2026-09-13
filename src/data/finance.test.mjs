// formatHolding est de la logique d'affichage pure : elle se teste sans Vue ni
// DOM, donc avec le lanceur natif de Node comme le reste du projet.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatHolding, segmentColor } from './finance.js';

describe('formatHolding', () => {
  it('reste en jours sous le mois', () => {
    assert.equal(formatHolding(1), '1 jour');
    assert.equal(formatHolding(12), '12 jours');
  });

  it('bascule en mois invariables', () => {
    assert.equal(formatHolding(30), '1 mois');
    assert.equal(formatHolding(214), '7 mois');
  });

  it('passe aux annees au dela de douze mois', () => {
    assert.equal(formatHolding(365), '1 an');
    assert.equal(formatHolding(760), '2 ans et 1 mois');
  });

  it('omet les mois quand l anniversaire tombe juste', () => {
    assert.equal(formatHolding(720), '2 ans');
  });

  // Le collecteur rend null quand aucune position n'a de date d'ouverture
  // exploitable : la carte doit masquer la ligne, pas afficher "NaN mois".
  it('rend null sur une entree inutilisable', () => {
    for (const input of [null, undefined, 0, -5, Number.NaN]) {
      assert.equal(formatHolding(input), null, String(input));
    }
  });
});

describe('segmentColor', () => {
  it('donne des teintes distinctes aux premieres tranches', () => {
    const colors = [0, 1, 2, 3].map(segmentColor);
    assert.equal(new Set(colors).size, colors.length);
  });

  it('retombe sur une teinte neutre au dela de la palette', () => {
    assert.equal(segmentColor(99), segmentColor(100));
  });
});
