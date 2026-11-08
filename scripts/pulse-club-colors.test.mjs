import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { OM_COLORS, knownClubColors, normalizeClubName } from './pulse-club-colors.mjs';

describe('knownClubColors', () => {
  it("force l'OM en bleu ciel et blanc, meme avec un nom inattendu", () => {
    assert.deepEqual(knownClubColors({ om: true, name: 'Nom bizarre' }), OM_COLORS);
  });

  it("reconnait l'OM par son nom quand le drapeau manque", () => {
    assert.deepEqual(knownClubColors({ name: 'Olympique de Marseille' }), OM_COLORS);
  });

  it('ignore accents, casse et ponctuation', () => {
    assert.deepEqual(
      knownClubColors({ name: 'Paris Saint-Germain' }),
      knownClubColors({ name: 'PARIS SAINT GERMAIN' }),
    );
    assert.deepEqual(knownClubColors({ name: 'FC Bayern München', full: 'x' }), ['#dc052d', '#0066b2']);
  });

  it('rend Bayer Leverkusen rouge et noir', () => {
    assert.deepEqual(knownClubColors({ name: 'Bayer 04 Leverkusen' }), ['#e32221', '#000000']);
  });

  it("essaie le nom complet quand le nom court est inconnu", () => {
    assert.deepEqual(knownClubColors({ name: 'Xyz', full: 'RC Lens' }), ['#ed1c24', '#fff300']);
  });

  it('ne confond pas deux clubs au nom proche', () => {
    assert.equal(knownClubColors({ name: 'Internacional' }), null);
    assert.notDeepEqual(knownClubColors({ name: 'Inter' }), knownClubColors({ name: 'Milan' }));
  });

  it('rend null pour un club inconnu ou une entree vide', () => {
    assert.equal(knownClubColors({ name: 'FC Inconnu United' }), null);
    assert.equal(knownClubColors({}), null);
    assert.equal(knownClubColors(undefined), null);
  });

  it('rend une copie : modifier le resultat ne touche pas la table', () => {
    const first = knownClubColors({ om: true });
    first[0] = '#000000';
    assert.equal(knownClubColors({ om: true })[0], OM_COLORS[0]);
  });
});

describe('normalizeClubName', () => {
  it('gere les valeurs absentes', () => {
    assert.equal(normalizeClubName(null), '');
    assert.equal(normalizeClubName('  Saint-Étienne '), 'saint etienne');
  });
});
