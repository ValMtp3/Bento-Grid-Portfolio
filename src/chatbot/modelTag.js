// Signature du modele, en fin de reponse.
//
// Le Space Hugging Face termine chaque reponse par une balise HTML qui nomme le
// modele utilise :
//
//   Salut ! ...\n\n<small style="opacity:0.5">open-mistral-nemo</small>
//
// deep-chat n'interprete pas le HTML des reponses (`html: false`, voir
// safeLinks.js) : sans ce module, la balise s'afficherait telle quelle dans la
// bulle. On la retire donc du texte, et on rend le nom a l'interface, qui
// l'affiche elle-meme sous la reponse.
//
// Deux precautions, chacune couverte par un test :
//
//   1. Le flux livre la reponse morceau par morceau : la balise arrive coupee
//      en deux ("<small sty..."). Un debut de balise en fin de texte est donc
//      masque lui aussi, sinon il clignoterait dans la bulle.
//   2. Le nom vient d'un serveur exterieur et finit dans le DOM : il n'est
//      accepte que s'il ressemble a un identifiant de modele. Tout le reste est
//      ignore.

const OPEN_TAG = '<small';

// Identifiants de modeles : `open-mistral-nemo`, `gpt-4o`, `mistral-small:24b`.
// Ni espace, ni chevron, ni guillemet : rien qui puisse porter du balisage.
const MODEL_NAME = /^[a-z0-9][a-z0-9._:/-]{0,39}$/i;

// Position d'un debut de balise `<small` colle a la fin du texte, -1 sinon.
// Un chevron isole suffit : il vaut mieux retenir un caractere une fraction de
// seconde que d'afficher une balise a moitie ecrite.
const trailingPartialIndex = (value) => {
  for (let length = Math.min(OPEN_TAG.length, value.length); length > 0; length -= 1) {
    if (value.endsWith(OPEN_TAG.slice(0, length))) return value.length - length;
  }
  return -1;
};

/**
 * Separe une reponse de la signature du modele qui la termine.
 *
 * @param {string | null | undefined} value - la reponse telle que le Space l'envoie.
 * @returns {{ text: string, model: string | null }} le texte a afficher, et le
 *   nom du modele quand la signature est complete et digne de confiance.
 */
export const extractModelTag = (value) => {
  if (typeof value !== 'string' || value === '') return { text: '', model: null };

  const openIndex = value.lastIndexOf(OPEN_TAG);

  if (openIndex === -1) {
    const partialIndex = trailingPartialIndex(value);
    return partialIndex === -1
      ? { text: value, model: null }
      : { text: value.slice(0, partialIndex).trimEnd(), model: null };
  }

  const tail = value.slice(openIndex);
  // `[\s\S]*` plutot que `[^<]*` : une balise qui en contient d'autres reste une
  // balise a retirer, meme si son contenu ne sera pas retenu comme nom.
  const signature = /^<small\b[^>]*>([\s\S]*)<\/small>\s*$/.exec(tail);

  // Une balise fermee ailleurs qu'en fin de reponse n'est pas la signature du
  // Space : couper la ferait disparaitre du contenu ecrit par le modele.
  if (!signature && tail.includes('</small>')) return { text: value, model: null };

  const name = signature?.[1].trim() ?? '';

  return {
    text: value.slice(0, openIndex).trimEnd(),
    model: MODEL_NAME.test(name) ? name : null,
  };
};

// --- Rendu -----------------------------------------------------------------
//
// L'etiquette est construite en JavaScript, et non dans le template Vue, parce
// qu'elle est posee a l'interieur du shadow DOM de deep-chat, ou Vue n'entre
// pas. Son habillage, lui, vient de styles.js comme tout le reste du composant.

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

// Cadenas ferme, trace de Material Design Icons (mdi:lock), la meme famille que
// les icones du site. Un SVG et non l'emoji 🔒 : l'emoji est colore et change
// de dessin d'un systeme a l'autre.
const LOCK_PATH =
  'M12 17a2 2 0 0 1-2-2 2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 1-2 2m6 3V10H6v10h12' +
  'm0-12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5' +
  ' 5 5 0 0 1 5 5v2h1m-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3Z';

export const MODEL_TOOLTIP =
  'Modèle français, hébergé en France. Aucune rétention de vos données.';

export const MODEL_TAG_CLASS = 'chat-model-tag';

// Les identifiants doivent etre uniques dans le shadow DOM : `aria-describedby`
// ne relierait sinon toutes les etiquettes a la meme infobulle.
let tooltipCount = 0;

/**
 * Construit l'etiquette « cadenas + nom du modele » et son infobulle.
 *
 * @param {string} model - nom du modele, deja verifie par extractModelTag.
 * @param {Document} [doc]
 * @returns {HTMLElement}
 */
export const createModelTagElement = (model, doc = globalThis.document) => {
  const container = doc.createElement('div');
  container.className = MODEL_TAG_CLASS;

  const trigger = doc.createElement('button');
  // Sans type explicite, un bouton vaut « envoyer » dans un formulaire.
  trigger.type = 'button';
  trigger.className = `${MODEL_TAG_CLASS}-trigger`;

  const icon = doc.createElementNS(SVG_NAMESPACE, 'svg');
  icon.setAttribute('class', `${MODEL_TAG_CLASS}-icon`);
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('aria-hidden', 'true');
  icon.setAttribute('focusable', 'false');
  const path = doc.createElementNS(SVG_NAMESPACE, 'path');
  path.setAttribute('d', LOCK_PATH);
  icon.appendChild(path);

  const name = doc.createElement('span');
  name.className = `${MODEL_TAG_CLASS}-name`;
  // `textContent` et jamais `innerHTML` : ce nom vient d'un serveur exterieur.
  name.textContent = model;

  const tooltip = doc.createElement('span');
  tooltipCount += 1;
  tooltip.id = `chat-model-tip-${tooltipCount}`;
  tooltip.className = `${MODEL_TAG_CLASS}-tip`;
  tooltip.setAttribute('role', 'tooltip');
  tooltip.textContent = MODEL_TOOLTIP;

  // Le lecteur d'ecran lit l'explication en meme temps que le nom du modele :
  // elle ne depend donc pas du survol, qui n'existe pas pour lui.
  trigger.setAttribute('aria-describedby', tooltip.id);
  trigger.append(icon, name);

  // Echappement : une infobulle doit pouvoir se refermer sans deplacer le
  // pointeur ni le focus (critere 1.4.13 des WCAG).
  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') trigger.blur();
  });

  container.append(trigger, tooltip);
  return container;
};
