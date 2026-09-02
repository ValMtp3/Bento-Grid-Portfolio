// Ecrit une coquille HTML par route dans dist/, avec ses propres meta.
// Necessaire parce que les crawlers sociaux (LinkedIn, Slack, Facebook, X)
// n'executent pas JavaScript : les meta posees par App.vue leur sont invisibles.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SITE_URL, ogImagePath, seoRoutes } from '../src/data/seo.js';

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
