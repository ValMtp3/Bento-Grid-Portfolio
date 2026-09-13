// Ecrit une coquille HTML par route dans dist/, avec ses propres meta.
// Necessaire parce que les crawlers sociaux (LinkedIn, Slack, Facebook, X)
// n'executent pas JavaScript : les meta posees par App.vue leur sont invisibles.
//
// La coquille porte aussi, pour les memes raisons, deux choses lisibles sans
// JavaScript : le JSON-LD de la page et une version texte de son contenu.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { agentContent } from '../src/data/agent-content.js';
import { renderMarkdown } from '../src/markdown.js';
import { SITE_URL, ogImagePath, seoRoutes } from '../src/data/seo.js';
import { buildJsonLd } from './generate-agent-manifests.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = resolve(root, 'dist');

const escapeHtml = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Les balises sont remplacees entierement : l'ordre des attributs varie dans la
// source, seul le couple (attribut identifiant, valeur) est stable.
const setMeta = (html, attribute, key, content) => {
  const pattern = new RegExp(`<meta\\b[^>]*\\b${attribute}="${key}"[^>]*/?>`, 'i');
  const tag = `<meta content="${escapeHtml(content)}" ${attribute}="${key}" />`;
  return pattern.test(html) ? html.replace(pattern, tag) : html;
};

// Le JSON-LD est insere dans un script : le seul caractere a neutraliser est le
// chevron fermant d'une balise script glissee dans une chaine.
const serializeJsonLd = (data) => JSON.stringify(data, null, 2).replace(/</g, '\\u003c');

// Contenu texte de la route, pose dans #app. Vue vide ce conteneur au montage
// (app.mount efface les enfants existants, il n'y a pas d'hydratation ici),
// donc ce bloc ne survit pas a l'arrivee du JavaScript : il ne sert qu'aux
// clients qui ne l'executent pas, agents inclus.
const buildStaticContent = (route) => {
  const entry = agentContent[route.slug];
  if (!entry) return '';

  const markdownUrl = `${SITE_URL}${route.path === '/' ? '/index.md' : `${route.path}.md`}`;

  return `
      <div class="prerendered-content">
        <h1>${escapeHtml(entry.heading)}</h1>
        <p><strong>${escapeHtml(route.description)}</strong></p>
${renderMarkdown(entry.body)
  .split('\n')
  .map((line) => `        ${line}`)
  .join('\n')}
        <hr />
        <p>
          Version Markdown de cette page :
          <a href="${markdownUrl}">${markdownUrl}</a>.
          Index du site : <a href="${SITE_URL}/llms.txt">${SITE_URL}/llms.txt</a>.
        </p>
      </div>`;
};

const buildShell = (shell, route) => {
  const url = `${SITE_URL}${route.path === '/' ? '/' : route.path}`;
  const image = `${SITE_URL}${ogImagePath(route.slug)}`;
  let html = shell;

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(route.title)}</title>`);
  html = html.replace(
    /<link\b[^>]*rel="canonical"[^>]*\/?>/i,
    `<link href="${url}" rel="canonical" />`,
  );

  html = setMeta(html, 'name', 'description', route.description);
  html = setMeta(html, 'name', 'robots', route.robots || 'index, follow');

  html = setMeta(html, 'property', 'og:title', route.title);
  html = setMeta(html, 'property', 'og:description', route.description);
  html = setMeta(html, 'property', 'og:url', url);
  html = setMeta(html, 'property', 'og:image', image);
  html = setMeta(html, 'property', 'og:image:alt', `${route.og.heading} — Valentin Fiess`);

  html = setMeta(html, 'name', 'twitter:title', route.title);
  html = setMeta(html, 'name', 'twitter:description', route.description);
  html = setMeta(html, 'property', 'twitter:url', url);
  html = setMeta(html, 'name', 'twitter:image', image);
  html = setMeta(html, 'name', 'twitter:image:alt', `${route.og.heading} — Valentin Fiess`);

  // Chaque page declare son jumeau Markdown : c'est la voie de decouverte des
  // agents qui lisent le <head> sans connaitre la convention .md.
  const markdownUrl = `${SITE_URL}${route.path === '/' ? '/index.md' : `${route.path}.md`}`;
  html = html.replace(
    /<link\b[^>]*rel="alternate"[^>]*type="text\/markdown"[^>]*\/?>/i,
    `<link href="${markdownUrl}" rel="alternate" type="text/markdown" />`,
  );

  html = html.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/i,
    `<script type="application/ld+json">\n${serializeJsonLd(buildJsonLd(route))}\n    </script>`,
  );

  // Le conteneur est vide dans index.html : le remplacer par du contenu ne
  // touche a rien d'autre que le point de montage.
  const staticContent = buildStaticContent(route);
  if (staticContent) {
    html = html.replace('<div id="app"></div>', `<div id="app">${staticContent}\n    </div>`);
  }

  // Les assets sont references en absolu par Vite : la coquille reste valide
  // depuis un sous-dossier sans reecriture de chemins.
  return html;
};

const main = async () => {
  const shellPath = resolve(distDir, 'index.html');
  const shell = await readFile(shellPath, 'utf8');

  for (const route of seoRoutes) {
    if (route.prerender === false || !route.og) continue;

    const html = buildShell(shell, route);
    if (route.path === '/') {
      await writeFile(shellPath, html);
    } else {
      const dir = resolve(distDir, route.path.replace(/^\//, ''));
      await mkdir(dir, { recursive: true });
      await writeFile(resolve(dir, 'index.html'), html);
    }
    console.log(`prerender: ${route.path}`);
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
