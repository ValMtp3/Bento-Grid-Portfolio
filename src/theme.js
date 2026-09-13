// Theme clair / sombre / systeme.
//
// Trois preferences possibles, et une seule apparence reellement appliquee :
// 'system' n'est pas une troisieme apparence, c'est l'absence de choix, qui
// laisse la main au reglage du systeme d'exploitation du visiteur.
//
// L'etat initial est pose par le script en ligne de index.html, avant meme que
// ce module soit charge. Ici on reprend la suite : memoriser le choix, suivre
// le systeme quand aucun choix n'est fait, et exposer l'etat a l'interface.

import { readonly, ref } from 'vue';

const STORAGE_KEY = 'theme';

export const LIGHT = 'light';
export const DARK = 'dark';
export const SYSTEM = 'system';

// L'ordre du cycle quand on clique sur le bouton.
export const THEME_ORDER = [LIGHT, DARK, SYSTEM];

const DARK_QUERY = '(prefers-color-scheme: dark)';

const isSupportedPreference = (value) => THEME_ORDER.includes(value);

// Toutes les lectures et ecritures du stockage passent par ces deux fonctions :
// un navigateur en navigation privee, ou dont les cookies sont bloques, leve une
// exception au moindre acces. Le theme doit degrader, jamais casser la page.
const readStoredPreference = () => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isSupportedPreference(stored) ? stored : SYSTEM;
  } catch {
    return SYSTEM;
  }
};

const writeStoredPreference = (preference) => {
  try {
    if (preference === SYSTEM) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // Choix non memorise : il vaut pour la visite en cours, c'est tout.
  }
};

const matchDarkQuery = () => {
  if (typeof window.matchMedia !== 'function') return null;
  return window.matchMedia(DARK_QUERY);
};

const prefersSystemDark = () => matchDarkQuery()?.matches ?? false;

// La preference du visiteur : ce qu'il a demande.
const preference = ref(SYSTEM);
// L'apparence reellement affichee : ce qu'il voit. Les deux ne coincident pas
// quand la preference vaut 'system'.
const resolved = ref(LIGHT);

// La classe et color-scheme sont poses ensemble. color-scheme prend en charge ce
// que le CSS du site ne couvre pas : barres de defilement, champs de formulaire
// et menus deroulants dessines par le navigateur lui-meme.
const applyTheme = () => {
  const isDark = preference.value === DARK || (preference.value === SYSTEM && prefersSystemDark());

  resolved.value = isDark ? DARK : LIGHT;

  const root = document.documentElement;
  root.classList.toggle('dark', isDark);
  root.style.colorScheme = isDark ? DARK : LIGHT;
};

export const setThemePreference = (next) => {
  if (!isSupportedPreference(next)) return;

  preference.value = next;
  writeStoredPreference(next);
  applyTheme();
};

export const cycleThemePreference = () => {
  const index = THEME_ORDER.indexOf(preference.value);
  setThemePreference(THEME_ORDER[(index + 1) % THEME_ORDER.length]);
};

// Appele une fois au demarrage de l'application. Le suivi du systeme reste
// branche en permanence, mais applyTheme ignore le signal tant que la preference
// n'est pas 'system' : le visiteur qui change de theme dans son systeme
// d'exploitation pendant sa visite voit le site suivre, sauf s'il a choisi.
export const initTheme = () => {
  preference.value = readStoredPreference();
  applyTheme();

  const query = matchDarkQuery();
  // addEventListener n'existe sur MediaQueryList que depuis Safari 14 ; sur les
  // versions anterieures le site reste fonctionnel, simplement il ne reagit pas
  // a un changement de theme systeme survenu en cours de visite.
  query?.addEventListener?.('change', applyTheme);
};

export const themePreference = readonly(preference);
export const resolvedTheme = readonly(resolved);
