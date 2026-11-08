// Filet anti-regression sur EmailProtection.vue : le composant est le dernier
// endroit ou l'email est reconstruit cote client. S'il reapparait en clair
// dans la source (prop user/domain, href mailto statique), un scan des assets
// le retrouve — d'ou ce test, qui lit le fichier source comme
// prerendered-content.test.mjs lit index.html.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import { EMAIL_B64 } from './data/seo.js';

const EMAIL = atob(EMAIL_B64);

const COMPONENT_PATH = fileURLToPath(new URL('./components/include/EmailProtection.vue', import.meta.url));
const source = readFileSync(COMPONENT_PATH, 'utf8');

describe('EmailProtection.vue, protection de l email', () => {
  it("ne contient pas l'adresse email en clair", () => {
    assert.ok(
      !source.includes(EMAIL),
      "l'email en clair dans le composant fuirait dans le bundle JS",
    );
    assert.doesNotMatch(source, /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
  });

  it('ne pose aucun href mailto dans le template', () => {
    const template = source.split('<template>')[1];
    assert.ok(template, 'pas de bloc <template> trouve');
    assert.doesNotMatch(template, /\s:?-?href\s*=/i, 'le template ne doit poser aucun attribut href');
  });

  it('decode la prop base64 et ne construit le mailto qu au clic', () => {
    assert.match(source, /atob\(props\.value\)/);
    assert.match(source, /window\.location\.href = `mailto:\$\{email\}`/);
  });
});

// Visiteur sans application mail (Gmail dans le navigateur) : le clic ne fait
// rien et le texte « [at] » n'est pas copiable. Le bouton « Copier » comble ce
// trou sans remettre l'email dans le DOM avant le clic.
describe('EmailProtection.vue, copie et accessibilite', () => {
  const template = source.split('<template>')[1] ?? '';

  it('propose un bouton Copier qui ne soumet rien', () => {
    assert.match(template, /<button[^>]*type="button"/);
    assert.match(template, /@click="copyEmail"/);
  });

  it("copie l'adresse via l'API presse-papiers, au clic seulement", () => {
    assert.match(source, /navigator\.clipboard\.writeText\(email\)/);
    assert.ok(
      !template.includes('navigator.clipboard'),
      'la copie ne doit pas se declencher au rendu',
    );
  });

  it("gere l'echec de la copie (contexte non securise, permission refusee)", () => {
    assert.match(source, /try\s*\{[\s\S]*clipboard[\s\S]*\}\s*catch/);
  });

  it('annonce le resultat aux lecteurs d ecran via une zone aria-live', () => {
    assert.match(template, /aria-live="polite"/);
  });

  it('nettoie le minuteur au demontage du composant', () => {
    assert.match(source, /onUnmounted\(/);
    assert.match(source, /clearTimeout\(/);
  });

  it("donne au lien un aria-label qui lit l'adresse (pas « at » / « point »)", () => {
    assert.match(template, /:aria-label="spokenEmail"/);
  });

  it('applique les attributs du parent au lien seulement (wrapper inline)', () => {
    assert.match(source, /defineOptions\(\{\s*inheritAttrs:\s*false\s*\}\)/);
  });
});
