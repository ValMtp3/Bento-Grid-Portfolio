// Acces aux statistiques de portefeuille (courtier + wallets crypto).
//
// Meme strategie de lecture que src/data/pulse.js : le JSON vient de
// raw.githubusercontent.com, pas du build, parce que le site est deploye a la
// main. Un commit du collecteur suffit a rafraichir la carte.
//
// Le fichier distant ne contient que des parts et des compteurs. Aucun montant,
// aucun nom de position, aucune adresse : voir scripts/finance/anonymize.mjs.

const FINANCE_URL =
  'https://raw.githubusercontent.com/ValMtp3/Bento-Grid-Portfolio/main/public/data/finance.json';

// Copie embarquee dans le build, figee au dernier deploiement. Elle sert de
// repli en developpement et si GitHub est injoignable.
const FALLBACK_URL = '/data/finance.json';

let pending;

const readJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`finance ${response.status}`);
  return response.json();
};

// Un seul appel reseau, partage par toutes les cellules qui en ont besoin.
export const loadFinance = () => {
  pending ??= readJson(FINANCE_URL)
    .catch(() => readJson(FALLBACK_URL))
    .catch(() => null);

  return pending;
};

// Couleurs de segments prises dans la palette du portfolio : contrairement aux
// langages, qui ont des couleurs canoniques chez GitHub, une classe d'actifs
// n'impose aucune teinte. Navy pour la dimension data, paprika en accent.
const SEGMENT_COLORS = [
  '#123b7d',
  '#4c82df',
  '#e65a28',
  '#7aa7ef',
  '#f1885b',
  '#2b5fad',
];

const FALLBACK_COLOR = '#abc9f7';

// L'index vient de la position dans la liste, deja triee par part decroissante :
// les plus grosses tranches recoivent donc les teintes les plus contrastees.
export const segmentColor = (index) => SEGMENT_COLORS[index] ?? FALLBACK_COLOR;

const plural = (count, singular, pluralForm = `${singular}s`) =>
  `${count} ${count > 1 ? pluralForm : singular}`;

// "7 mois", "1 an et 3 mois" : une duree de detention parle mieux en langage
// courant qu'en nombre de jours brut.
export const formatHolding = (days) => {
  if (!Number.isFinite(days) || days <= 0) return null;

  const months = Math.round(days / 30);
  if (months < 1) return plural(Math.round(days), 'jour');
  if (months < 12) return plural(months, 'mois', 'mois');

  const years = Math.floor(months / 12);
  const remainder = months % 12;
  const yearsLabel = plural(years, 'an');

  return remainder === 0 ? yearsLabel : `${yearsLabel} et ${plural(remainder, 'mois', 'mois')}`;
};
