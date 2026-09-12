// Revelation au defilement : un element entre dans le champ, il apparait.
//
// Deux precautions guident cette implementation.
//
// D'abord, l'etat masque est pose par le script, jamais par la feuille de
// style. Le site est pre-rendu : si le script ne s'execute pas, une regle CSS
// d'opacite nulle laisserait une page blanche aux visiteurs comme aux robots
// d'indexation. En posant la classe depuis le script, l'absence de script rend
// simplement la page sans animation.
//
// Ensuite, un seul observateur sert tous les elements. Un observateur par
// element multiplierait les rappels du navigateur pour un resultat identique.

const PENDING = 'reveal-pending';
const VISIBLE = 'reveal-in';

// Le seuil reste a zero : il se mesure en pourcentage de l'element, pas de
// l'ecran. Un bloc plus haut que quelques ecrans n'atteindrait jamais un seuil
// de 12 %, et resterait masque indefiniment.
const THRESHOLD = 0;

// L'observation demarre sous le bord bas de l'ecran. L'animation a donc le temps
// de se jouer pendant que l'element monte encore : il arrive deja en place, au
// lieu de s'animer sous les yeux du visiteur qui defile dessus.
const ROOT_MARGIN = '0px 0px 160px 0px';

let observer;

const reveal = (element) => {
  element.classList.remove(PENDING);
  element.classList.add(VISIBLE);
  observer?.unobserve(element);
};

const getObserver = () => {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) reveal(entry.target);
      }
    },
    { rootMargin: ROOT_MARGIN, threshold: THRESHOLD },
  );

  return observer;
};

export const vReveal = {
  mounted(element, binding) {
    // Navigateur sans observateur, ou visiteur qui a demande moins
    // d'animations : on affiche directement, sans rien masquer.
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!('IntersectionObserver' in window) || prefersReduced) return;

    // Le decalage permet d'echelonner plusieurs elements d'un meme bloc.
    if (binding.value) element.style.setProperty('--reveal-delay', `${binding.value}ms`);

    element.classList.add(PENDING);
    getObserver().observe(element);
  },

  unmounted(element) {
    observer?.unobserve(element);
  },
};
