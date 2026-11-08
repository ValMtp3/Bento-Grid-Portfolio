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
