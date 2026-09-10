// Convertisseur Markdown -> HTML minimal, sans dependance.
//
// Pourquoi maison plutot qu'une librairie : l'entree est exclusivement le
// contenu de src/data/agent-content.js, ecrit par nous. Le sous-ensemble
// Markdown utilise tient en six regles. Ajouter markdown-it (et ses
// dependances) pour ca serait payer une dependance sans en avoir besoin.
//
// Deux consommateurs, une seule sortie :
//   - les vues Vue /about, /contact, /privacy ;
//   - scripts/prerender.mjs, pour le HTML lisible sans JavaScript.
// C'est ce partage qui garantit que la page et son jumeau .md ne divergent pas.
//
// SECURITE : le HTML de l'entree est echappe AVANT toute generation de balise.
// Aucune balise presente dans la source Markdown ne survit, donc le resultat
// est sur a poser dans un v-html meme si la source venait a changer de main.

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Schemas autorises dans un href. Tout le reste -- javascript:, data:, vbscript:
// -- est refuse et rendu comme du texte.
//
// Aujourd'hui la source est src/data/agent-content.js, un fichier de code
// versionne : aucune URL hostile ne peut y arriver. Cette allowlist protege le
// jour ou ce convertisseur servira un contenu moins maitrise, ou l'echappement
// HTML seul ne suffirait plus : escapeHtml ne touche pas au schema d'une URL,
// donc `javascript:alert(1)` traverserait intact jusqu'a l'attribut href.
const isSafeHref = (href) =>
  /^(https?:|mailto:)/i.test(href) || href.startsWith('/') || href.startsWith('#');

// Les liens externes recoivent rel="noopener noreferrer" : sans lui, la page
// ouverte garde une reference vers celle-ci via window.opener.
const renderLink = (label, href) => {
  if (!isSafeHref(href)) {
    // Le lien est neutralise, pas efface : masquer silencieusement le libelle
    // ferait disparaitre du contenu sans que personne ne s'en apercoive.
    return `${label} (lien ignoré)`;
  }

  const isExternal = /^https?:\/\//i.test(href) && !href.startsWith('https://valentin-fiess.fr');
  const attributes = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `<a href="${href}"${attributes}>${label}</a>`;
};

// Applique les marques de niveau ligne. L'ordre compte : le code littéral est
// traite en dernier pour que son contenu ne soit pas re-interprete.
const renderInline = (text) => {
  let html = escapeHtml(text);
  html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => renderLink(label, href));
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  return html;
};

// Le rendu est volontairement sans classes : chaque vue habille le resultat via
// une classe parente, ce qui evite de dupliquer la charte dans ce fichier.
export const renderMarkdown = (markdown) => {
  if (typeof markdown !== 'string' || markdown.trim() === '') {
    return '';
  }

  const blocks = markdown.trim().split(/\n{2,}/);
  const html = [];

  for (const block of blocks) {
    const lines = block.split('\n');

    const heading = block.match(/^(#{2,4})\s+(.+)$/);
    if (heading && lines.length === 1) {
      const level = heading[1].length;
      html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      continue;
    }

    // Listes a puces et listes numerotees. Le meme traitement s'applique aux
    // deux : seuls le marqueur reconnu et la balise produite changent.
    const listKinds = [
      { marker: /^[-*]\s+/, tag: 'ul' },
      { marker: /^\d+\.\s+/, tag: 'ol' },
    ];

    const kind = listKinds.find(({ marker }) => marker.test(lines[0]));
    if (kind && lines.every((line) => kind.marker.test(line) || /^\s+/.test(line))) {
      // Une puce peut courir sur plusieurs lignes : on recolle avant de rendre,
      // sinon la continuation devient un item vide.
      const items = [];
      for (const line of lines) {
        if (kind.marker.test(line)) {
          items.push(line.replace(kind.marker, ''));
        } else if (items.length > 0) {
          items[items.length - 1] += ` ${line.trim()}`;
        }
      }
      if (items.length > 0) {
        html.push(
          `<${kind.tag}>${items.map((item) => `<li>${renderInline(item)}</li>`).join('')}</${kind.tag}>`,
        );
        continue;
      }
    }

    // Les tableaux Markdown ne sont pas utilises dans les pages rendues : les
    // ignorer silencieusement masquerait du contenu, on les rend en texte.
    html.push(`<p>${renderInline(lines.join(' '))}</p>`);
  }

  return html.join('\n');
};
