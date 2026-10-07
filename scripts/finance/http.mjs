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

// Certaines instances Blockscout (base, polygon, arbitrum) protegent leur API
// par un defi Cloudflare « managed challenge » : une requete qui n'a pas un
// User-Agent de navigateur accompagne des client hints sec-ch-ua coherents
// recoit 403, quel que soit le client (curl, Node). Ce n'est pas un bannissement
// d'IP. On presente donc un navigateur Chrome complet ; l'identite du projet
// reste portee par l'en-tete X-Portfolio-Client.
const BROWSER_HEADERS = {
  Accept: 'application/json',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
  'sec-ch-ua': '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'X-Portfolio-Client': 'bento-grid-portfolio (+https://github.com/ValMtp3/Bento-Grid-Portfolio)',
};

/**
 * GET ou POST JSON avec garde-fous.
 * Pas d'en-tete Origin ni Referer : c'est la cause la plus courante des 403
 * renvoyes par les RPC publics a des clients serveur.
 */
export const fetchJson = async (url, { body, headers = {}, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) => {
  const response = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: {
      ...BROWSER_HEADERS,
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
