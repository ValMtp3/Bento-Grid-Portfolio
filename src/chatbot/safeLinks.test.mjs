// deep-chat desactive la protection de son moteur Markdown contre les schemas
// d'URL dangereux (`validateLink = () => true` dans son code). Un lien
// `javascript:` produit par le modele deviendrait donc cliquable et s'executerait
// dans la page. Ces tests fixent la regle de neutralisation.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { neutralizeUnsafeLinks } from './safeLinks.js';

describe('neutralizeUnsafeLinks', () => {
  it('laisse intact un lien web normal', () => {
    const text = 'Voir [mon portfolio](https://valentin-fiess.fr) pour les projets.';

    assert.equal(neutralizeUnsafeLinks(text), text);
  });

  it('laisse intact un lien interne et un lien mail', () => {
    const text = '[La page projets](/projets) ou [m\'ecrire](mailto:bonjour@example.com).';

    assert.equal(neutralizeUnsafeLinks(text), text);
  });

  it('desamorce un lien javascript en gardant son libelle', () => {
    const result = neutralizeUnsafeLinks('[Cliquez ici](javascript:alert(1))');

    assert.doesNotMatch(result, /javascript:/i);
    assert.match(result, /Cliquez ici/, 'le texte visible ne doit pas disparaitre');
  });

  it('desamorce les autres schemas dangereux', () => {
    for (const scheme of ['data:text/html;base64,PHN2Zz4=', 'vbscript:msgbox(1)', 'file:///etc/passwd']) {
      const result = neutralizeUnsafeLinks(`[x](${scheme})`);
      assert.doesNotMatch(result, new RegExp(scheme.split(':')[0], 'i'), `${scheme} doit etre neutralise`);
    }
  });

  it('n\'est pas trompe par la casse ni par les espaces', () => {
    const result = neutralizeUnsafeLinks('[x](  JaVaScRiPt:alert(1))');

    assert.doesNotMatch(result, /javascript:/i);
  });

  it('n\'est pas trompe par une entite HTML dans le schema', () => {
    // `java&#115;cript:` est decode par le moteur Markdown avant d'atterrir dans
    // l'attribut href : le tester tel quel ne suffit pas.
    const result = neutralizeUnsafeLinks('[x](java&#115;cript:alert(1))');

    assert.doesNotMatch(result, /java&#115;cript:/i);
  });

  it('desamorce aussi une image et un lien automatique', () => {
    assert.doesNotMatch(neutralizeUnsafeLinks('![logo](javascript:alert(1))'), /javascript:/i);
    assert.doesNotMatch(neutralizeUnsafeLinks('<javascript:alert(1)>'), /javascript:/i);
  });

  it('rend le texte inchange quand il n\'y a aucun lien', () => {
    const text = 'Une reponse normale, avec du **gras** et une liste :\n- un\n- deux';

    assert.equal(neutralizeUnsafeLinks(text), text);
  });

  it('supporte une entree vide sans lever d\'erreur', () => {
    assert.equal(neutralizeUnsafeLinks(''), '');
    assert.equal(neutralizeUnsafeLinks(null), '');
  });
});
