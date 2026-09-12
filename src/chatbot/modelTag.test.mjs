// Le Space signe chaque reponse par le nom du modele. Ce qui est verifie ici :
// la signature disparait toujours du texte affiche, y compris quand elle arrive
// morceau par morceau, et le nom recupere ne peut pas servir de vecteur
// d'injection.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { extractModelTag } from './modelTag.js';

const SIGNATURE = '<small style="opacity:0.5">open-mistral-nemo</small>';

describe('extractModelTag', () => {
  it('retire la signature du texte et en tire le nom du modele', () => {
    const { text, model } = extractModelTag(`Salut !\n\n${SIGNATURE}`);

    assert.equal(text, 'Salut !');
    assert.equal(model, 'open-mistral-nemo');
  });

  it('laisse intacte une reponse sans signature', () => {
    const { text, model } = extractModelTag('Une reponse ordinaire.');

    assert.equal(text, 'Une reponse ordinaire.');
    assert.equal(model, null);
  });

  it('masque la signature pendant qu\'elle s\'ecrit', () => {
    // Le flux livre la reponse par morceaux : sans cette coupe, un debut de
    // balise s'afficherait une fraction de seconde dans la bulle.
    const steps = [
      'Salut !\n\n<',
      'Salut !\n\n<sm',
      'Salut !\n\n<small',
      'Salut !\n\n<small style="opa',
      'Salut !\n\n<small style="opacity:0.5">open-mis',
    ];

    for (const step of steps) {
      const { text, model } = extractModelTag(step);
      assert.equal(text, 'Salut !', `morceau non nettoye : ${step}`);
      assert.equal(model, null);
    }
  });

  it('refuse un nom de modele qui n\'en est pas un', () => {
    // Le nom vient d'un serveur exterieur : il finit dans le DOM, il est donc
    // verifie avant d'etre accepte.
    const suspects = [
      '<small><img src=x onerror=alert(1)></small>',
      '<small>nom avec espaces</small>',
      `<small>${'a'.repeat(80)}</small>`,
      '<small></small>',
    ];

    for (const suspect of suspects) {
      const { text, model } = extractModelTag(`Salut !\n\n${suspect}`);
      assert.equal(model, null, `nom accepte a tort : ${suspect}`);
      assert.equal(text, 'Salut !');
    }
  });

  it('ne coupe pas une balise suivie de texte', () => {
    // Ailleurs qu'en fin de reponse, ce n'est pas la signature du Space : on ne
    // touche pas au contenu.
    const value = `Debut ${SIGNATURE} et la suite.`;
    const { text, model } = extractModelTag(value);

    assert.equal(text, value);
    assert.equal(model, null);
  });

  it('accepte une valeur vide sans se plaindre', () => {
    assert.deepEqual(extractModelTag(''), { text: '', model: null });
    assert.deepEqual(extractModelTag(null), { text: '', model: null });
    assert.deepEqual(extractModelTag(undefined), { text: '', model: null });
  });
});
