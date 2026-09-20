// Identifiants de discussion et de visiteur, lisibles par un humain.
//
// Ils servent au tracage cote Space : sans eux, chaque message ouvre une
// session Langfuse distincte et une discussion de cinq questions se lit en cinq
// morceaux separes.
//
// Deux durees de vie differentes, donc deux stockages :
//   - le visiteur vit dans `localStorage` : il survit a la fermeture de
//     l'onglet, ce qui permet de reconnaitre quelqu'un qui revient ;
//   - la discussion vit dans `sessionStorage` : un nouvel onglet est une
//     nouvelle discussion.
//
// Aucune donnee personnelle : ce sont deux mots tires au hasard et un suffixe.
// `renard-curieux-k3f9x2` se retient et se lit, la ou un UUID ne dit rien.

export const VISITOR_STORAGE_KEY = 'chatbot.visitorId';
export const CONVERSATION_STORAGE_KEY = 'chatbot.conversationId';

// Le Space colle les deux identifiants dans un seul champ : ce caractere les
// separe. Il n'apparait dans aucun des mots ci-dessous.
export const SESSION_HASH_SEPARATOR = '~';

const SUFFIX_LENGTH = 6;
const SUFFIX_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';

const ADJECTIVES = [
  'agile', 'aimable', 'calme', 'curieux', 'discret', 'fidele', 'joyeux',
  'malin', 'paisible', 'patient', 'rapide', 'ruse', 'serein', 'sincere',
  'tenace', 'vaillant', 'vif', 'zele',
];

const NOUNS = [
  'renard', 'hibou', 'heron', 'lynx', 'martin', 'castor', 'loutre', 'faucon',
  'cerf', 'blaireau', 'ecureuil', 'goeland', 'colibri', 'marmotte', 'chamois',
  'mesange', 'belette', 'corbeau',
];

// `getRandomValues` est present dans tous les navigateurs vises et dans Node.
// Le repli sur `Math.random` sert aux environnements sans `crypto` : un
// identifiant moins imprevisible vaut mieux qu'une page qui plante.
const defaultRandomInt = (max) => {
  const webCrypto = globalThis.crypto;

  if (webCrypto?.getRandomValues) {
    const values = new Uint32Array(1);
    webCrypto.getRandomValues(values);
    return values[0] % max;
  }

  return Math.floor(Math.random() * max);
};

const pick = (list, randomInt) => list[randomInt(list.length)];

/**
 * Fabrique un identifiant du type `renard-curieux-k3f9x2`.
 *
 * @param {object} [options]
 * @param {(max: number) => number} [options.randomInt] - tirage injectable pour les tests.
 * @returns {string}
 */
export const createReadableId = ({ randomInt = defaultRandomInt } = {}) => {
  let suffix = '';
  for (let index = 0; index < SUFFIX_LENGTH; index += 1) {
    suffix += pick(SUFFIX_ALPHABET, randomInt);
  }

  return `${pick(NOUNS, randomInt)}-${pick(ADJECTIVES, randomInt)}-${suffix}`;
};

/**
 * Lit l'identifiant range sous `key`, ou en cree un et l'y range.
 *
 * Le stockage peut etre indisponible (navigation privee, cookies bloques,
 * quota plein) : dans ce cas on rend un identifiant neuf sans rien enregistrer.
 * Le tracage perd le lien entre deux messages, le visiteur ne voit rien.
 *
 * @param {Storage | null} storage
 * @param {string} key
 * @returns {string}
 */
export const readOrCreateId = (storage, key) => {
  try {
    const stored = storage?.getItem(key);
    if (stored && stored.trim()) return stored;
  } catch {
    return createReadableId();
  }

  const created = createReadableId();

  try {
    storage?.setItem(key, created);
  } catch {
    // Identifiant utilisable pour ce message, perdu au suivant : c'est le
    // comportement attendu quand le navigateur refuse d'ecrire.
  }

  return created;
};

/**
 * Assemble les deux identifiants en une seule valeur, seul champ libre que
 * l'API du Space accepte a cote des donnees.
 *
 * @param {string | null | undefined} visitorId
 * @param {string | null | undefined} conversationId
 * @returns {string} `visiteur~discussion`, ou la seule valeur connue.
 */
export const buildSessionHash = (visitorId, conversationId) =>
  [visitorId, conversationId]
    .map((value) => (value ?? '').trim())
    .filter(Boolean)
    .join(SESSION_HASH_SEPARATOR);

/**
 * Rend le stockage demande, ou `null` s'il est hors d'atteinte.
 *
 * Certains navigateurs ne se contentent pas de faire echouer `getItem` : ils
 * refusent la lecture meme de `globalThis.localStorage` (page dans une iframe
 * isolee, stockage bloque dans les reglages). Sans ce filet, l'erreur remonte
 * jusqu'au gestionnaire de chat, qui affiche un message d'echec au lieu de
 * repondre.
 *
 * @param {'localStorage' | 'sessionStorage'} name
 * @returns {Storage | null}
 */
const readStorage = (name) => {
  try {
    return globalThis[name] ?? null;
  } catch {
    return null;
  }
};

/**
 * Identifiant a joindre a chaque message, lu depuis les stockages du navigateur.
 *
 * @param {object} [options] - stockages injectables pour les tests.
 * @returns {string}
 */
export const getSessionHash = ({
  localStorage = readStorage('localStorage'),
  sessionStorage = readStorage('sessionStorage'),
} = {}) =>
  buildSessionHash(
    readOrCreateId(localStorage, VISITOR_STORAGE_KEY),
    readOrCreateId(sessionStorage, CONVERSATION_STORAGE_KEY),
  );
