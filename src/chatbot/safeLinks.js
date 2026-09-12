// Neutralise les liens dangereux dans une reponse du modele.
//
// Pourquoi ce fichier existe : deep-chat instancie son moteur Markdown puis
// remplace sa validation d'URL par une fonction qui accepte tout
// (`inline.validateLink = () => true`, visible dans son code distribue). La
// protection standard contre `javascript:`, `data:`, `vbscript:` et `file:`
// saute donc, et rien dans son API ne permet de la remettre. L'ancienne
// interface s'appuyait sur `html-policy="escape"` de markstream-vue ; ceci en
// prend le relais.
//
// Le HTML brut, lui, reste echappe par deep-chat (`html: false`) : ce module ne
// traite que les liens.
//
// Principe : on ne devine pas ce qui est dangereux, on n'autorise que ce qui est
// connu comme sur. La regle vient de src/markdown.js, pour que les deux chemins
// de rendu du site ne divergent jamais.

import { isSafeHref } from '../markdown.js';

// Le moteur Markdown decode les entites HTML avant de poser l'URL dans le href :
// `java&#115;cript:` devient `javascript:`. On doit donc tester l'URL telle
// qu'elle sera interpretee, pas telle qu'elle est ecrite.
const decodeEntities = (value) =>
  value
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);?/g, (_, decimal) => String.fromCodePoint(Number(decimal)))
    .replace(/&colon;/gi, ':')
    .replace(/&amp;/gi, '&');

// Les espaces et caracteres de controle sont ignores par les navigateurs au
// milieu d'un schema : `java\tscript:` s'execute. On les retire avant de juger.
const normalizeHref = (href) => decodeEntities(href).replace(/[\s\u0000-\u001f\u007f]/g, '');

const NEUTRALIZED_SUFFIX = ' (lien ignoré)';

/**
 * Remplace tout lien Markdown dont l'URL n'est pas sure par son seul libelle.
 * Le texte visible est conserve : masquer le libelle ferait disparaitre du
 * contenu sans que personne s'en apercoive.
 *
 * @param {string | null | undefined} markdown
 * @returns {string}
 */
export const neutralizeUnsafeLinks = (markdown) => {
  if (typeof markdown !== 'string' || markdown === '') return '';

  return (
    markdown
      // Liens et images : [libelle](url) et ![texte alternatif](url).
      .replace(/!?\[([^\]]*)\]\(([^)]*)\)/g, (match, label, href) => {
        if (isSafeHref(normalizeHref(href))) return match;
        // L'image comme le lien se replient sur leur texte : il n'y a rien de
        // sur a afficher a la place.
        return `${label}${NEUTRALIZED_SUFFIX}`;
      })
      // Liens automatiques : <url>.
      .replace(/<([^\s<>]+:[^\s<>]*)>/g, (match, href) =>
        isSafeHref(normalizeHref(href)) ? match : NEUTRALIZED_SUFFIX.trim(),
      )
  );
};
