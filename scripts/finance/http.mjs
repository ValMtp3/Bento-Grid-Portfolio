// Appels HTTP vers les services publics : timeout, en-tetes neutres et
// distinction des erreurs qui meritent une nouvelle tentative.
//
// Sans timeout explicite, un service qui coupe la connexion TLS au lieu de
// repondre laisse le job GitHub suspendu. C'est arrive pendant les tests avec
// deux des services ecartes.

const DEFAULT_TIMEOUT_MS = 12000;

// Un service qui bannit a l'IP repondra pareil dans deux secondes : insister
// gaspille le temps du job et aggrave parfois le blocage.
const PERMANENT_STATUSES = new Set([401, 403, 404, 430, 451]);

export class HttpError extends Error {
  constructor(status, url) {
    super(`HTTP ${status} sur ${new URL(url).host}`);
    this.name = 'HttpError';
    this.status = status;
    // Lu par la logique de reprise : inutile de retenter un bannissement.
    this.permanent = PERMANENT_STATUSES.has(status);
  }
}

/**
 * GET ou POST JSON avec garde-fous.
 * Pas d'en-tete Origin ni Referer : c'est la cause la plus courante des 403
 * renvoyes par les RPC publics a des clients serveur.
 */
export const fetchJson = async (url, { body, headers = {}, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) => {
  const response = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Bento-Grid-Portfolio/1.0 (+https://github.com/ValMtp3/Bento-Grid-Portfolio)',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) throw new HttpError(response.status, url);

  return response.json();
};

/**
 * Essaie une source puis sa remplacante. Les deux services d'un meme reseau
 * sont volontairement operes par des acteurs differents : une panne de l'un ne
 * doit pas etre une panne de l'autre.
 */
export const withFallback = async (primary, fallback, { onFallback } = {}) => {
  try {
    return await primary();
  } catch (error) {
    onFallback?.(error);
    return fallback();
  }
};
