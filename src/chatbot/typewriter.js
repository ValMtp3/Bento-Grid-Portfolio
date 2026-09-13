// Machine a ecrire du chatbot.
//
// Le Space Hugging Face renvoie sa reponse par paquets irreguliers : trois mots,
// puis rien pendant une seconde, puis un paragraphe entier. Affiche tel quel,
// le texte saute. Ce module met le flux en file d'attente et le restitue
// caractere par caractere, a la maniere d'un terminal.
//
// La vitesse est adaptative : plus le retard accumule est grand, plus le pas
// s'allonge. Sans cela, une reponse de deux mille caracteres mettrait une minute
// a s'afficher alors qu'elle est deja entierement recue.
//
// Les minuteurs sont injectables : c'est ce qui permet de tester la logique de
// temps sans attendre reellement, et sans navigateur.

// Rythme de base. En dessous de ~16 ms on depasse la frequence d'affichage de
// l'ecran : des images seraient calculees pour rien.
const TICK_MS = 18;

// Matiere minimale avant d'ecrire le premier caractere. Demarrer sur trois mots
// puis se retrouver a sec donne un demarrage hache.
const START_RESERVE = 120;

// Coussin conserve tant que le flux n'est pas termine. La machine reste
// volontairement en retard sur le reseau : c'est ce retard qui absorbe les
// silences du Space et garde un rythme regulier.
const STREAM_RESERVE = 48;

// Plafond du pas : au-dela, le texte apparait par blocs et l'effet disparait.
const MAX_STEP = 12;

/**
 * Nombre de caracteres a afficher sur un tour, selon le retard restant.
 * Fonction pure : c'est la regle de vitesse, isolee pour etre verifiable.
 */
export const computeStep = (remaining) => {
  if (remaining > 1200) return MAX_STEP;
  if (remaining > 400) return 6;
  if (remaining > 150) return 3;
  if (remaining > 40) return 2;
  return 1;
};

/**
 * Cree une machine a ecrire.
 *
 * @param {object} options
 * @param {(text: string) => void} options.onDisplay - recoit le texte a afficher.
 * @param {(callback: () => void, delay: number) => unknown} [options.setTimer]
 * @param {(id: unknown) => void} [options.clearTimer]
 * @param {number} [options.tickMs]
 */
export const createTypewriter = ({
  onDisplay,
  setTimer = (callback, delay) => globalThis.setTimeout(callback, delay),
  clearTimer = (id) => globalThis.clearTimeout(id),
  tickMs = TICK_MS,
}) => {
  let target = '';
  let displayedLength = 0;
  let timerId = null;
  let isComplete = false;
  let isCancelled = false;

  let resolveFinished;
  const finished = new Promise((resolve) => {
    resolveFinished = resolve;
  });

  const scheduleTick = () => {
    if (timerId === null && !isCancelled) {
      timerId = setTimer(tick, tickMs);
    }
  };

  const tick = () => {
    timerId = null;
    if (isCancelled) return;

    const remaining = target.length - displayedLength;
    if (remaining <= 0) {
      if (isComplete) resolveFinished();
      return;
    }

    // Rien n'est encore affiche et le flux vient de commencer : on laisse la
    // reserve se constituer. Le prochain push relancera un tour.
    if (!isComplete && displayedLength === 0 && target.length < START_RESERVE) return;

    const available = isComplete ? remaining : Math.max(0, remaining - STREAM_RESERVE);
    if (available <= 0) return;

    displayedLength += Math.min(computeStep(remaining), available);

    // Un emoji occupe deux unites UTF-16. Couper entre les deux afficherait un
    // losange noir le temps d'un tour.
    const lastCodeUnit = target.charCodeAt(displayedLength - 1);
    if (lastCodeUnit >= 0xd800 && lastCodeUnit <= 0xdbff) displayedLength += 1;

    onDisplay(target.slice(0, displayedLength));
    scheduleTick();
  };

  return {
    /** Pousse la reponse complete recue jusqu'ici (le Space envoie du cumulatif). */
    push(value) {
      target = value;
      scheduleTick();
    },
    /** Signale la fin du flux et attend que tout le texte soit sorti. */
    async finish() {
      isComplete = true;
      scheduleTick();
      await finished;
    },
    /** Arrete tout : plus aucun affichage, et finish() cesse d'attendre. */
    cancel() {
      isCancelled = true;
      if (timerId !== null) clearTimer(timerId);
      timerId = null;
      resolveFinished();
    },
  };
};
