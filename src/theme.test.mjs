// Le module de theme touche localStorage, matchMedia et <html> : trois choses
// absentes de Node. On les remplace par des doublures minimales avant de
// l'importer, ce qui permet de tester la logique — le cycle des preferences, la
// resolution de 'system', la resistance a un stockage bloque — sans navigateur.

import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

// Doublure de <html> : on n'a besoin que de ce que le module manipule.
const createRoot = () => {
  const classes = new Set();
  return {
    classList: {
      toggle: (name, force) => (force ? classes.add(name) : classes.delete(name)),
      has: (name) => classes.has(name),
    },
    style: {},
  };
};

// Doublure de localStorage. `throwing` simule la navigation privee, ou toute
// lecture leve au lieu de renvoyer une valeur.
const createStorage = ({ initial = null, throwing = false } = {}) => {
  let value = initial;
  return {
    getItem: () => {
      if (throwing) throw new Error('stockage indisponible');
      return value;
    },
    setItem: (_key, next) => {
      if (throwing) throw new Error('stockage indisponible');
      value = next;
    },
    removeItem: () => {
      if (throwing) throw new Error('stockage indisponible');
      value = null;
    },
    read: () => value,
  };
};

// Chaque test recharge le module : ses refs sont des singletons de module, un
// import partage ferait fuir l'etat d'un test au suivant.
let loadCount = 0;
const loadTheme = async ({ stored = null, systemDark = false, throwing = false } = {}) => {
  const storage = createStorage({ initial: stored, throwing });
  const root = createRoot();

  globalThis.window = {
    localStorage: storage,
    matchMedia: () => ({ matches: systemDark, addEventListener: () => {} }),
  };
  // createElement n'est pas utilise par theme.js, mais le runtime de Vue
  // l'appelle des son chargement : la doublure de document doit le fournir,
  // sinon l'import du module echoue avant meme le premier test.
  globalThis.document = {
    documentElement: root,
    createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }),
  };

  loadCount += 1;
  const theme = await import(`./theme.js?test=${loadCount}`);
  theme.initTheme();

  return { theme, root, storage };
};

beforeEach(() => {
  delete globalThis.window;
  delete globalThis.document;
});

describe('etat initial', () => {
  it("suit le systeme quand rien n'a ete choisi", async () => {
    const { theme, root } = await loadTheme({ systemDark: true });

    assert.equal(theme.themePreference.value, theme.SYSTEM);
    assert.equal(theme.resolvedTheme.value, theme.DARK);
    assert.equal(root.classList.has('dark'), true);
    assert.equal(root.style.colorScheme, 'dark');
  });

  it('respecte un choix memorise contre la preference systeme', async () => {
    const { theme, root } = await loadTheme({ stored: 'light', systemDark: true });

    assert.equal(theme.themePreference.value, theme.LIGHT);
    assert.equal(root.classList.has('dark'), false);
  });

  it('ignore une valeur stockee inconnue', async () => {
    const { theme } = await loadTheme({ stored: 'fuchsia' });

    assert.equal(theme.themePreference.value, theme.SYSTEM);
  });
});

describe('cycle du bouton', () => {
  it('parcourt clair, sombre, systeme puis revient au clair', async () => {
    const { theme } = await loadTheme({ stored: 'light' });

    assert.equal(theme.themePreference.value, theme.LIGHT);
    theme.cycleThemePreference();
    assert.equal(theme.themePreference.value, theme.DARK);
    theme.cycleThemePreference();
    assert.equal(theme.themePreference.value, theme.SYSTEM);
    theme.cycleThemePreference();
    assert.equal(theme.themePreference.value, theme.LIGHT);
  });

  it('memorise un choix explicite et efface le retour au systeme', async () => {
    const { theme, storage } = await loadTheme({ stored: 'light' });

    theme.setThemePreference(theme.DARK);
    assert.equal(storage.read(), 'dark');

    theme.setThemePreference(theme.SYSTEM);
    assert.equal(storage.read(), null);
  });

  it('refuse une preference hors de la liste connue', async () => {
    const { theme } = await loadTheme({ stored: 'light' });

    theme.setThemePreference('fuchsia');
    assert.equal(theme.themePreference.value, theme.LIGHT);
  });
});

describe('stockage indisponible', () => {
  it('retombe sur la preference systeme sans lever', async () => {
    const { theme, root } = await loadTheme({ throwing: true, systemDark: true });

    assert.equal(theme.themePreference.value, theme.SYSTEM);
    assert.equal(root.classList.has('dark'), true);
  });

  it('laisse la bascule fonctionner pour la visite en cours', async () => {
    const { theme, root } = await loadTheme({ throwing: true, systemDark: true });

    theme.setThemePreference(theme.LIGHT);
    assert.equal(theme.themePreference.value, theme.LIGHT);
    assert.equal(root.classList.has('dark'), false);
  });
});
