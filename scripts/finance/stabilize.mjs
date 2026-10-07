// Stabilisation de la performance publiee, sans reseau.
//
// Deux decisions de Valentin :
// - un % n'est republie que s'il bouge d'au moins 2 points : sinon chaque
//   passage du workflow (toutes les 6 h) produirait un commit pour un point
//   d'oscillation ;
// - une mesure en panne reprend la derniere valeur publiee si elle a moins de
//   24 h : un hoquet d'API ne doit pas effacer la ligne de la carte, mais une
//   valeur trop vieille ne doit pas passer pour actuelle.
//
// La date retenue est celle de la derniere publication de la valeur, pas celle
// de la derniere mesure : une valeur stable plus de 24 h puis en panne est
// donc masquee.

const PERFORMANCE_THRESHOLD_POINTS = 2;
const CARRY_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const PARTS = ['stocks', 'crypto'];

const integerOrNull = (value) => (Number.isInteger(value) ? value : null);

const isRecent = (iso, now) => {
  const time = Date.parse(iso);
  return Number.isFinite(time) && now.getTime() - time < CARRY_MAX_AGE_MS;
};

const closeEnough = (a, b) => Math.abs(a - b) < PERFORMANCE_THRESHOLD_POINTS;

// Une partie (bourse ou crypto) : sa valeur finale, sa date de publication, et
// si elle vient de la mesure courante ou d'un report.
const stabilizePart = (previous, current, part, now) => {
  const measured = integerOrNull(current?.[part]);
  const prior = integerOrNull(previous?.[part]);
  const priorAt = previous?.publishedAt?.[part] ?? null;

  if (measured !== null && prior !== null && closeEnough(measured, prior)) {
    // Un fichier publie avant l'ajout des dates n'en a pas : la valeur prend
    // celle du jour plutot que de rester sans date, donc jamais reportable.
    return { value: prior, at: priorAt ?? now.toISOString(), carried: false };
  }
  if (measured !== null) return { value: measured, at: now.toISOString(), carried: false };
  if (prior !== null && isRecent(priorAt, now)) return { value: prior, at: priorAt, carried: true };
  return { value: null, at: null, carried: false };
};

const stabilizeOverall = (previous, current, parts) => {
  if (parts.some((entry) => entry.value === null)) return null;

  const prior = integerOrNull(previous?.overall);
  // Une valeur reportee ne se recombine pas avec une fraiche : le global
  // obtenu ne correspondrait a aucune mesure reelle.
  if (parts.some((entry) => entry.carried)) return prior;

  const measured = integerOrNull(current?.overall);
  if (measured !== null && prior !== null && closeEnough(measured, prior)) return prior;
  return measured;
};

/**
 * Combine la performance mesuree avec celle du fichier precedent.
 * `previous` : objet performance publie (peut etre absent) ; `current` : sortie
 * de toPerformance (peut etre null) ; `now` : Date. Rend un nouvel objet, ou
 * null quand ni la bourse ni la crypto n'ont de valeur.
 */
export const stabilizePerformance = (previous, current, now) => {
  const [stocks, crypto] = PARTS.map((part) => stabilizePart(previous, current, part, now));
  if (stocks.value === null && crypto.value === null) return null;

  return {
    overall: stabilizeOverall(previous, current, [stocks, crypto]),
    stocks: stocks.value,
    crypto: crypto.value,
    publishedAt: { stocks: stocks.at, crypto: crypto.at },
  };
};
