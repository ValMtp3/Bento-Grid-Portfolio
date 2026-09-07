// Acces aux signaux "vivants" du portfolio.
//
// Le JSON est lu depuis raw.githubusercontent.com et non depuis le build : le
// site etant deploye a la main, un fichier servi par Apache resterait fige
// jusqu'au prochain deploiement. La meme astuce fait deja vivre le graphe de
// contributions.

const PULSE_URL =
  'https://raw.githubusercontent.com/ValMtp3/Bento-Grid-Portfolio/main/public/data/pulse.json';

// Copie embarquee dans le build. Elle date du dernier deploiement, donc elle ne
// sert que de repli : en developpement, ou le fichier distant peut ne pas
// encore exister sur main, et en production si GitHub est injoignable.
const FALLBACK_URL = '/data/pulse.json';

let pending;

const readJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`pulse ${response.status}`);
  return response.json();
};

// Un seul appel reseau, partage par toutes les cellules qui en ont besoin.
export const loadPulse = () => {
  pending ??= readJson(PULSE_URL)
    .catch(() => readJson(FALLBACK_URL))
    .catch(() => null);

  return pending;
};

const relative = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });

const UNITS = [
  { unit: 'year', ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: 'month', ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: 'day', ms: 24 * 60 * 60 * 1000 },
  { unit: 'hour', ms: 60 * 60 * 1000 },
  { unit: 'minute', ms: 60 * 1000 },
];

// "il y a 3 heures", "hier", "dans 4 jours".
export const formatRelative = (isoDate) => {
  if (!isoDate) return null;

  const diff = new Date(isoDate).getTime() - Date.now();
  if (Number.isNaN(diff)) return null;

  for (const { unit, ms } of UNITS) {
    if (Math.abs(diff) >= ms) return relative.format(Math.round(diff / ms), unit);
  }

  return "a l'instant";
};

const dayFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Paris',
});

// "dimanche 11 septembre, 20:45"
export const formatMatchDate = (isoDate) =>
  isoDate ? dayFormatter.format(new Date(isoDate)).replace(' à ', ', ') : null;
