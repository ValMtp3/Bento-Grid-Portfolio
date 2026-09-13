// Orchestration des sources externes du portefeuille.
//
// Regle unique et non negociable : soit toutes les sources repondent, soit on
// ne publie rien. Une allocation privee d'une de ses sources reste parfaitement
// credible a l'ecran tout en etant fausse — c'est le seul mensonge que cette
// carte pourrait raconter, donc on l'interdit a la racine.
//
// En cas d'echec, le fichier precedent reste en place et vieillit visiblement
// sur la carte ("il y a 2 jours"), pendant que le job GitHub passe au rouge.

const DEFAULT_ATTEMPTS = 3;
const DEFAULT_DELAY_MS = 2000;
// Large pour un RPC blockchain lent, court devant l'intervalle de six heures.
const DEFAULT_TIMEOUT_MS = 15000;

export class CollectError extends Error {
  constructor(failures) {
    const names = failures.map((failure) => failure.name).join(', ');
    super(`sources injoignables : ${names}`);
    this.name = 'CollectError';
    this.failures = failures;
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Relance une operation reseau quelques fois avant d'abandonner. Les API
 * gratuites repondent 429 ou 502 de temps en temps ; echouer des le premier
 * hoquet ferait clignoter le job sans raison.
 */
export const withRetry = async (task, { attempts = DEFAULT_ATTEMPTS, delayMs = DEFAULT_DELAY_MS } = {}) => {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      // Cle refusee, IP bannie, ressource absente : la reponse sera identique
      // au prochain essai. Insister allonge le job pour rien.
      if (error?.permanent) break;
      // Pause croissante : une limite de debit se libere avec le temps, la
      // marteler immediatement ne ferait que prolonger le blocage.
      if (attempt < attempts) await wait(delayMs * attempt);
    }
  }

  throw lastError;
};

const withTimeout = async (task, timeoutMs, name) => {
  let timer;
  const guard = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${name} : pas de reponse en ${timeoutMs} ms`)), timeoutMs);
  });

  try {
    return await Promise.race([task(), guard]);
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Interroge toutes les sources en parallele et fusionne leurs positions.
 * Leve une CollectError des qu'une seule source manque a l'appel.
 */
export const collectAll = async (sources, options = {}) => {
  const {
    attempts = DEFAULT_ATTEMPTS,
    delayMs = DEFAULT_DELAY_MS,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options;

  // allSettled et non all : on veut connaitre toutes les sources fautives d'un
  // coup, pas seulement la premiere, pour ne pas deboguer en quatre passages.
  const settled = await Promise.allSettled(
    sources.map((source) =>
      withRetry(() => withTimeout(source.collect, timeoutMs, source.name), { attempts, delayMs }),
    ),
  );

  const failures = settled
    .map((result, index) => ({ result, name: sources[index].name }))
    .filter((entry) => entry.result.status === 'rejected')
    .map((entry) => ({ name: entry.name, cause: entry.result.reason }));

  if (failures.length > 0) throw new CollectError(failures);

  return {
    positions: settled.flatMap((result) => result.value),
    sources: sources.map((source) => source.name),
  };
};
