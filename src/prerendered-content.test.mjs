// Le contenu pre-rendu (scripts/prerender.mjs) est pose dans #app et reste
// affiche jusqu'a ce que Vue monte : sans precaution, chaque visiteur voit
// passer la version Markdown de la page avant l'interface.
//
// Deux moitiees resolvent cela, et elles ne valent que ensemble : le script en
// ligne de index.html marque la page comme "JavaScript disponible", et une regle
// CSS masque le bloc sur cette seule marque. Retirer l'une des deux ramene le
// clignotement sans qu'aucun test existant ne s'en apercoive — d'ou celui-ci.
//
// Le script est reellement execute, pas simplement cherche au texte : c'est la
// seule facon de verifier qu'il pose la classe dans tous les cas de figure,
// y compris quand le stockage est bloque.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createContext, runInContext } from 'node:vm';
import { describe, it } from 'node:test';

const INDEX_PATH = fileURLToPath(new URL('../index.html', import.meta.url));
const html = readFileSync(INDEX_PATH, 'utf8');

// Le script d'amorçage est le premier <script> en ligne du document.
const extractBootScript = () => {
  const match = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(match, 'aucun script en ligne trouve dans index.html');
  return match[1];
};

// Doublures minimales : uniquement ce que le script d'amorçage manipule.
const runBootScript = ({ storageThrows = false, storedTheme = null } = {}) => {
  const classes = new Set();

  const sandbox = {
    window: {
      matchMedia: () => ({ matches: false }),
      localStorage: {
        getItem: () => {
          if (storageThrows) throw new Error('stockage bloque');
          return storedTheme;
        },
      },
    },
    document: {
      documentElement: {
        classList: {
          add: (name) => classes.add(name),
          toggle: (name, force) => (force ? classes.add(name) : classes.delete(name)),
        },
        style: {},
      },
    },
  };

  runInContext(extractBootScript(), createContext(sandbox));
  return classes;
};

describe('amorçage de index.html', () => {
  it('marque la page comme disposant de JavaScript', () => {
    assert.ok(
      runBootScript().has('js'),
      "le script d'amorçage doit poser la classe 'js' sur <html>",
    );
  });

  it('la pose meme quand le stockage est bloque', () => {
    // Navigation privee : le theme retombe sur la preference systeme, mais la
    // page dispose toujours de JavaScript. Sans cette garantie, un visiteur en
    // navigation privee serait le seul a voir le clignotement.
    assert.ok(
      runBootScript({ storageThrows: true }).has('js'),
      "la classe 'js' ne doit pas dependre de l'acces au stockage",
    );
  });
});

describe('contenu pre-rendu', () => {
  it('est masque des que JavaScript est disponible', () => {
    const rule = html.match(/\.js\s+\.prerendered-content\s*{([^}]*)}/);

    assert.ok(rule, 'aucune regle ne masque .prerendered-content sous .js');
    assert.match(
      rule[1],
      /display:\s*none/,
      'la regle doit masquer le bloc, pas seulement le rendre transparent',
    );
  });

  it('reste visible sans JavaScript', () => {
    // Le bloc ne doit jamais etre masque par une regle inconditionnelle : il est
    // le seul contenu des visiteurs sans JavaScript et des agents qui lisent le
    // HTML brut.
    const unconditional = html.match(/(?<!\.js\s)\.prerendered-content\s*{([^}]*)}/);

    if (unconditional) {
      assert.doesNotMatch(
        unconditional[1],
        /display:\s*none/,
        'le bloc ne doit pas etre masque en dehors de la regle .js',
      );
    }
  });
});
