// Verifie que ce qui a ete construit dans dist/ tient debout pour un agent.
//
// Pourquoi ce script existe : l'audit orank du site a perdu des points parce
// que les cinq liens declares par llms.txt ne resolvaient plus, et parce que
// des manifestes .well-known repondaient du HTML au lieu de JSON. Ces deux
// pannes sont silencieuses -- rien ne casse au build, le site a l'air normal,
// et seul un scanner externe s'en apercoit. Ce script transforme ces pannes en
// echec de build.
//
// Lance automatiquement en fin de `pnpm build`, ou seul via
// `pnpm verify:agents` (sur le dernier dist/ construit).
//
// Ne fait aucune requete reseau : tout est verifie sur le systeme de fichiers,
// donc le resultat est reproductible et fonctionne hors ligne.

import { access, readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SITE_URL, seoRoutes } from '../src/data/seo.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = resolve(root, 'dist');

const failures = [];
const checks = [];

const fail = (message) => failures.push(message);
const pass = (message) => checks.push(message);

// Traduit une URL publique du site en chemin dans dist/. Une URL du site qui
// n'est pas un fichier de dist/ est un lien mort : c'est precisement ce qu'on
// cherche.
const distPathForUrl = (url) => {
  const path = url.replace(SITE_URL, '').split('#')[0].split('?')[0];
  if (path === '' || path === '/') return resolve(distDir, 'index.html');
  const clean = path.replace(/^\//, '').replace(/\/$/, '');
  // Une route sans extension est servie par sa coquille prerendue.
  return /\.[a-z0-9]+$/i.test(clean)
    ? resolve(distDir, clean)
    : resolve(distDir, clean, 'index.html');
};

const exists = async (absolutePath) => {
  try {
    await access(absolutePath);
    return true;
  } catch {
    return false;
  }
};

const readJson = async (relativePath) => {
  const absolutePath = resolve(distDir, relativePath);
  if (!(await exists(absolutePath))) {
    fail(`${relativePath} est absent de dist/.`);
    return null;
  }
  const raw = await readFile(absolutePath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    fail(`${relativePath} n'est pas du JSON valide : ${error.message}`);
    return null;
  }
};

// ── 1. Les manifestes .well-known parsent ────────────────────────────────────

const WELL_KNOWN_JSON = [
  '.well-known/ard.json',
  '.well-known/ai-catalog.json',
  '.well-known/agent-card.json',
  '.well-known/api-catalog',
  '.well-known/agent-skills/index.json',
];

const verifyWellKnown = async () => {
  for (const path of WELL_KNOWN_JSON) {
    const parsed = await readJson(path);
    if (parsed) pass(`${path} : JSON valide`);
  }
};

// ── 2. Chaque lien interne declare resolve vers un fichier reel ──────────────

// Les liens sortants ne sont pas verifies : cela demanderait le reseau et
// rendrait le build dependant de serveurs tiers.
const collectSiteLinks = (text) => {
  const pattern = new RegExp(`${SITE_URL.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}[^\\s)\\]"'<>]*`, 'g');
  return [...new Set(text.match(pattern) || [])];
};

const verifyLinksIn = async (relativePath) => {
  const absolutePath = resolve(distDir, relativePath);
  if (!(await exists(absolutePath))) {
    fail(`${relativePath} est absent de dist/.`);
    return;
  }

  const text = await readFile(absolutePath, 'utf8');
  const links = collectSiteLinks(text);
  const broken = [];

  for (const link of links) {
    if (!(await exists(distPathForUrl(link)))) broken.push(link);
  }

  if (broken.length > 0) {
    fail(
      `${relativePath} declare ${broken.length} lien(s) qui ne resolvent pas :\n` +
        broken.map((link) => `      - ${link}`).join('\n'),
    );
    return;
  }

  pass(`${relativePath} : ${links.length} lien(s) internes resolvent`);
};

// ── 3. Chaque route publique a son jumeau Markdown ───────────────────────────

const verifyMarkdownTwins = async () => {
  const publicRoutes = seoRoutes.filter(
    (route) => route.prerender !== false && !String(route.robots || '').includes('noindex'),
  );

  for (const route of publicRoutes) {
    const target = route.path === '/' ? 'index.md' : `${route.path.replace(/^\//, '')}.md`;
    const absolutePath = resolve(distDir, target);

    if (!(await exists(absolutePath))) {
      fail(`Le jumeau Markdown /${target} manque pour la route ${route.path}.`);
      continue;
    }

    const body = await readFile(absolutePath, 'utf8');

    // Un agent qui recoit un document sans titre de niveau 1 ne sait pas
    // l'interpreter comme du Markdown : c'est le critere que verifient les
    // scanners.
    if (!body.startsWith('# ')) {
      fail(`/${target} ne commence pas par un titre de niveau 1.`);
      continue;
    }

    // 500 caracteres est le seuil retenu par les scanners d'agent-readiness
    // pour distinguer une page reelle d'un gabarit vide.
    if (body.length < 500) {
      fail(`/${target} ne contient que ${body.length} caracteres (500 attendus au minimum).`);
      continue;
    }

    pass(`/${target} : ${body.length} caracteres`);
  }
};

// ── 4. Les digests de l'index Agent Skills correspondent aux fichiers ────────

const verifySkillDigests = async () => {
  const index = await readJson('.well-known/agent-skills/index.json');
  if (!index) return;

  const skillsDir = resolve(distDir, '.well-known/agent-skills');
  const declared = new Set();

  for (const skill of index.skills || []) {
    if (!skill.name || !skill.description) {
      fail(`Une entree de l'index Agent Skills n'a ni name ni description.`);
      continue;
    }
    if (!/^sha256:[0-9a-f]{64}$/.test(skill.digest || '')) {
      fail(`${skill.name} : digest absent ou mal forme (sha256:<64 hex> attendu).`);
      continue;
    }

    const fileName = skill.url.split('/').pop();
    declared.add(fileName);
    const absolutePath = resolve(skillsDir, fileName);

    if (!(await exists(absolutePath))) {
      fail(`${skill.name} : l'artefact ${skill.url} n'existe pas dans dist/.`);
      continue;
    }

    const actual = `sha256:${createHash('sha256').update(await readFile(absolutePath)).digest('hex')}`;
    if (actual !== skill.digest) {
      fail(
        `${skill.name} : digest perime. Index ${skill.digest}, fichier ${actual}. ` +
          'Relancez `pnpm agent-manifests`.',
      );
      continue;
    }

    pass(`${skill.name} : digest conforme`);
  }

  // Une skill presente sur le disque mais absente de l'index est invisible pour
  // les agents : la panne est silencieuse, donc on la signale.
  const onDisk = (await readdir(skillsDir)).filter((file) => file.endsWith('.md'));
  for (const file of onDisk) {
    if (!declared.has(file)) {
      fail(`${file} existe mais n'est pas declare dans l'index Agent Skills.`);
    }
  }
};

// ── 5. Les coquilles HTML portent bien leur JSON-LD ──────────────────────────

const verifyJsonLd = async () => {
  const routes = seoRoutes.filter((route) => route.prerender !== false && route.og);

  for (const route of routes) {
    const relativePath =
      route.path === '/' ? 'index.html' : `${route.path.replace(/^\//, '')}/index.html`;
    const absolutePath = resolve(distDir, relativePath);

    if (!(await exists(absolutePath))) {
      fail(`La coquille ${relativePath} manque.`);
      continue;
    }

    const html = await readFile(absolutePath, 'utf8');
    const match = html.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/i,
    );

    if (!match) {
      fail(`${relativePath} n'a pas de bloc JSON-LD.`);
      continue;
    }

    try {
      const data = JSON.parse(match[1].replace(/\\u003c/g, '<'));
      const types = (data['@graph'] || []).map((node) => node['@type']);
      for (const required of ['Person', 'WebSite', 'WebPage']) {
        if (!types.includes(required)) {
          fail(`${relativePath} : le JSON-LD ne contient pas de noeud ${required}.`);
        }
      }
      pass(`${relativePath} : JSON-LD valide (${types.join(', ')})`);
    } catch (error) {
      fail(`${relativePath} : JSON-LD illisible — ${error.message}`);
    }
  }
};

// ── 6. Le contenu est lisible sans JavaScript ────────────────────────────────

const verifyNoJsContent = async () => {
  const routes = seoRoutes.filter((route) => route.prerender !== false && route.og);

  for (const route of routes) {
    const relativePath =
      route.path === '/' ? 'index.html' : `${route.path.replace(/^\//, '')}/index.html`;
    const absolutePath = resolve(distDir, relativePath);
    if (!(await exists(absolutePath))) continue;

    const html = await readFile(absolutePath, 'utf8');
    const block = html.match(
      /<div class="prerendered-content">([\s\S]*?)<\/div>\s*<\/div>/i,
    );

    if (!block) {
      fail(`${relativePath} : aucun contenu lisible sans JavaScript.`);
      continue;
    }

    // On mesure le texte, pas le balisage : c'est ce que compte un scanner.
    const textLength = block[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().length;
    if (textLength < 500) {
      fail(`${relativePath} : ${textLength} caracteres de texte brut (500 attendus).`);
      continue;
    }

    if (!/<h1>/i.test(block[1])) {
      fail(`${relativePath} : le contenu brut n'a pas de <h1>.`);
      continue;
    }

    pass(`${relativePath} : ${textLength} caracteres lisibles sans JavaScript`);
  }
};

// ── Execution ────────────────────────────────────────────────────────────────

const main = async () => {
  if (!(await exists(distDir))) {
    throw new Error('dist/ est absent. Lancez `pnpm build` avant la verification.');
  }

  await verifyWellKnown();
  await verifyLinksIn('llms.txt');
  await verifyLinksIn('projets/llms.txt');
  await verifyLinksIn('.well-known/ard.json');
  await verifyLinksIn('.well-known/ai-catalog.json');
  await verifyLinksIn('.well-known/agent-card.json');
  await verifyLinksIn('sitemap.xml');
  await verifyMarkdownTwins();
  await verifySkillDigests();
  await verifyJsonLd();
  await verifyNoJsContent();

  console.log(`verify-agents: ${checks.length} verification(s) passee(s)`);

  if (failures.length > 0) {
    console.error(`\nverify-agents: ${failures.length} probleme(s) :`);
    for (const failure of failures) console.error(`  ✗ ${failure}`);
    process.exitCode = 1;
    return;
  }

  console.log('verify-agents: tout est conforme.');
};

main().catch((error) => {
  console.error(`verify-agents: ${error.message}`);
  process.exitCode = 1;
});
