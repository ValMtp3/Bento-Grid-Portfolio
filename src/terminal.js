// Moteur de l'effet terminal de la cellule OM : le curseur clignote seul,
// puis les lignes s'ecrivent caractere par caractere, pause avec le texte
// complet, effacement en remontant, et la boucle recommence. Le clignotement
// lui-meme est en CSS (voir le composant) ; ce module ne gere que la sequence.
//
// Logique de temps pure : les minuteurs sont injectables, comme pour la
// machine a ecrire du chatbot, ce qui rend le test deterministe.

const DEFAULTS = {
  blinkMs: 1100, // curseur seul avant la premiere frappe (~un cycle de clignotement)
  charMs: 34, // vitesse d'ecriture
  holdMs: 3600, // texte complet visible avant l'effacement
  eraseMs: 16, // vitesse d'effacement (plus rapide que l'ecriture)
  pauseMs: 800, // ecran vide entre deux boucles
  loop: true, // false : on s'arrete sur le texte complet (le curseur CSS clignote encore)
};

/**
 * Cree un lecteur de lignes façon terminal.
 *
 * @param {object} options
 * @param {string[]} options.lines - lignes completes a faire defiler en boucle.
 * @param {(visible: string[]) => void} options.onUpdate - recoit les lignes
 *   visibles a chaque tour (la derniere peut etre partielle).
 * @param {(callback: () => void, delay: number) => unknown} [options.setTimer]
 * @param {(id: unknown) => void} [options.clearTimer]
 * @param {boolean} [options.loop] - true : boucle (efface puis retape) ;
 *   false : s'arrete sur le texte complet, le curseur continue de clignoter.
 */
export const createTerminalPlayer = ({
  lines,
  onUpdate,
  setTimer = (callback, delay) => globalThis.setTimeout(callback, delay),
  clearTimer = (id) => globalThis.clearTimeout(id),
  ...timings
}) => {
  const { blinkMs, charMs, holdMs, eraseMs, pauseMs, loop } = { ...DEFAULTS, ...timings };

  let timerId = null;
  let stopped = false;
  // lineIndex/charIndex designent la position du curseur : la ligne en cours
  // et le nombre de caracteres deja affiches sur cette ligne.
  let lineIndex = 0;
  let charIndex = 0;

  const emit = () => {
    const visible = lines.slice(0, lineIndex);
    if (lineIndex < lines.length) visible.push(lines[lineIndex].slice(0, charIndex));
    if (visible.length === 0) visible.push('');
    onUpdate(visible);
  };

  const schedule = (delay, fn) => {
    if (stopped) return;
    timerId = setTimer(() => {
      timerId = null;
      if (!stopped) fn();
    }, delay);
  };

  const tickType = () => {
    const line = lines[lineIndex];

    // Fin de ligne : le curseur saute sur la ligne suivante, encore vide.
    if (charIndex >= line.length) {
      lineIndex += 1;
      charIndex = 0;
      emit();
      if (lineIndex >= lines.length) {
        // Sans boucle, on s'arrete sur le texte complet : aucun minuteur de
        // plus, le curseur reste visible et clignote en CSS.
        if (!loop) return;
        schedule(holdMs, tickHold);
        return;
      }
      schedule(charMs, tickType);
      return;
    }

    let next = charIndex + 1;
    // Un emoji occupe deux unites UTF-16 : avancer de deux d'un coup pour ne
    // jamais afficher la moitie d'un caractere (losange noir).
    const unit = line.charCodeAt(charIndex);
    if (unit >= 0xd800 && unit <= 0xdbff) next += 1;
    charIndex = Math.min(next, line.length);
    emit();
    schedule(charMs, tickType);
  };

  const tickHold = () => {
    lineIndex = lines.length - 1;
    charIndex = lines[lineIndex]?.length ?? 0;
    schedule(eraseMs, tickErase);
  };

  const tickErase = () => {
    const line = lines[lineIndex];
    let prev = charIndex - 1;
    // Ne pas couper un emoji en deux en effacant non plus.
    const unit = line.charCodeAt(prev);
    if (unit >= 0xdc00 && unit <= 0xdfff) prev -= 1;
    charIndex = Math.max(prev, 0);
    emit();

    if (charIndex > 0) {
      schedule(eraseMs, tickErase);
      return;
    }
    lineIndex -= 1;
    if (lineIndex < 0) {
      // Tout est efface : petite pause, puis la boucle repart.
      charIndex = 0;
      schedule(pauseMs, tickPause);
      return;
    }
    charIndex = lines[lineIndex].length;
    schedule(eraseMs, tickErase);
  };

  const tickPause = () => schedule(blinkMs, tickBlink);

  const tickBlink = () => {
    // Le curseur seul a deja ete emis par play() : on passe directement a
    // l'ecriture.
    lineIndex = 0;
    charIndex = 0;
    schedule(charMs, tickType);
  };

  return {
    /** Lance la boucle : curseur seul (blinkMs), puis ecriture, pause, effacement. */
    play() {
      if (stopped || lines.length === 0) return;
      lineIndex = 0;
      charIndex = 0;
      emit(); // le curseur clignote seul pendant blinkMs
      schedule(blinkMs, tickBlink);
    },
    /** Arrete tout : plus aucun affichage, plus aucun minuteur. */
    stop() {
      stopped = true;
      if (timerId !== null) clearTimer(timerId);
      timerId = null;
    },
  };
};
