/**
 * Comportement de defilement a passer a scrollIntoView / scrollTo.
 * Retourne 'auto' quand l'utilisateur a demande a reduire les animations, sinon
 * 'smooth' : un scroll fluide impose par JS ignore la regle CSS equivalente.
 */
export const getScrollBehavior = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
