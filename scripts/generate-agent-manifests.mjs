// Genere tous les artefacts destines aux agents a partir de src/data/seo.js et
// src/data/agent-content.js.
//
// Pourquoi generer plutot qu'ecrire a la main : ces fichiers se recoupent tous
// (le sitemap, llms.txt et les jumeaux Markdown listent les memes routes).
// Ecrits a la main, ils divergent des qu'une page est ajoutee -- c'est
// exactement le defaut releve par l'audit orank, ou llms.txt pointait vers des
// URL qui ne repondaient plus.
//
// Produit dans public/ :
//   sitemap.xml                          index XML des pages indexables
//   llms.txt                             index texte pour les agents
//   llms.md, index.md, <route>.md        jumeaux Markdown de chaque page
//   projets/llms.txt                     index de section
//   .well-known/ard.json                 Agentic Resource Discovery
//   .well-known/ai-catalog.json          AI Catalog
//   .well-known/agent-card.json          carte A2A
//   .well-known/api-catalog              catalogue d'API (RFC 9727)
//   .well-known/agent-skills/index.json  index Agent Skills v0.2.0
//
// Les fichiers produits sont commites, comme les images OG de generate-og.mjs.

import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { agentContent, AGENT_INSTRUCTIONS, faq } from '../src/data/agent-content.js';
import { IDENTITY, SITE_URL, seoRoutes } from '../src/data/seo.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = resolve(root, 'public');
const wellKnownDir = resolve(publicDir, '.well-known');
const skillsDir = resolve(wellKnownDir, 'agent-skills');

const REPO_URL = 'https://github.com/ValMtp3/Bento-Grid-Portfolio';

// Date de mise a jour des manifestes.
//
// Volontairement derivee du contenu (le lastmod le plus recent de seo.js) et
// non de l'horloge. Avec `new Date()`, chaque build reecrivait les manifestes
// avec un horodatage neuf : `git status` restait sale en permanence, les diffs
// etaient noyes de bruit, et le champ annoncait une mise a jour qui n'avait pas
// eu lieu. Ici, la date ne bouge que lorsqu'une page bouge reellement -- ce qui
// est aussi ce qu'un agent comprend en lisant `updated`.
const latestLastmod = seoRoutes
  .map((route) => route.lastmod)
  .filter(Boolean)
  .sort()
  .at(-1);

if (!latestLastmod) {
  throw new Error('Aucune route de seo.js ne porte de lastmod : impossible de dater les manifestes.');
}

const generatedAt = `${latestLastmod}T00:00:00.000Z`;

// ── Helpers ──────────────────────────────────────────────────────────────────

const absoluteUrl = (path) => `${SITE_URL}${path === '/' ? '/' : path}`;

// Les routes reellement publiques : /justice est en noindex et le catch-all 404
// n'est pas une page.
const publicRoutes = seoRoutes.filter(
  (route) => route.prerender !== false && !String(route.robots || '').includes('noindex'),
);

// Chemin du jumeau Markdown. L'accueil est un cas particulier : les agents
// attendent /index.md pour la racine.
const markdownPath = (route) => (route.path === '/' ? '/index.md' : `${route.path}.md`);

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

// Ecrit un fichier en creant l'arborescence manquante, et journalise le chemin
// relatif pour que la sortie du build reste lisible.
const write = async (absolutePath, content) => {
  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, content, 'utf8');
  console.log(`agent-manifests: ${absolutePath.slice(root.length + 1)}`);
};

const writeJson = (absolutePath, value) => write(absolutePath, `${JSON.stringify(value, null, 2)}\n`);

// Le contenu d'une route, avec un repli explicite : une route ajoutee dans
// seo.js sans entree dans agent-content.js doit se voir, pas se taire.
const contentFor = (route) => {
  const entry = agentContent[route.slug];
  if (!entry) {
    throw new Error(
      `agent-content.js n'a pas d'entree pour la route "${route.slug}" (${route.path}). ` +
        'Ajoutez-la, sinon son jumeau Markdown serait vide.',
    );
  }
  return entry;
};

// ── sitemap.xml ──────────────────────────────────────────────────────────────

// Ressources indexables qui ne sont pas des routes de l'application.
const extraSitemapUrls = [
  { loc: '/assets/assets_index/CV_Valentin_Fiess.pdf', lastmod: '2026-07-11' },
];

const buildSitemap = () => {
  const entries = [
    ...publicRoutes.map((route) => ({
      loc: route.path,
      lastmod: route.lastmod,
      // Declare le jumeau Markdown comme representation alternative : un agent
      // qui lit le sitemap trouve la version machine sans la deviner.
      alternate: markdownPath(route),
    })),
    ...extraSitemapUrls,
  ];

  const body = entries
    .map(({ loc, lastmod, alternate }) => {
      const alternateTag = alternate
        ? `\n    <xhtml:link rel="alternate" type="text/markdown" href="${escapeXml(absoluteUrl(alternate))}" />`
        : '';
      const lastmodTag = lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : '';
      return `  <url>\n    <loc>${escapeXml(absoluteUrl(loc))}</loc>${lastmodTag}${alternateTag}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Genere par scripts/generate-agent-manifests.mjs. Ne pas editer a la main. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`;
};

// ── llms.txt ─────────────────────────────────────────────────────────────────

// Ordre de lecture pense pour un agent : identite, puis pages, puis annexes.
const llmsTxtSections = [
  {
    title: 'Pages principales',
    slugs: ['home', 'about', 'projets', 'projets-raguia', 'stack', 'contact', 'chatbot'],
  },
  { title: 'Informations légales', slugs: ['privacy', 'policy', 'legal'] },
];

const buildLlmsTxt = () => {
  const bySlug = new Map(publicRoutes.map((route) => [route.slug, route]));

  const renderSection = ({ title, slugs }) => {
    const lines = slugs
      .map((slug) => bySlug.get(slug))
      .filter(Boolean)
      .map(
        (route) =>
          `- [${contentFor(route).heading}](${absoluteUrl(route.path)}) : ${route.description} Version Markdown : ${absoluteUrl(markdownPath(route))}`,
      );
    return `## ${title}\n\n${lines.join('\n')}`;
  };

  return `# ${IDENTITY.name} — Portfolio

> Portfolio de ${IDENTITY.name}, ${IDENTITY.jobTitle} à Montpellier : RAG, LLM, MLOps, Python et applications web.

Langue principale : français
URL canonique : ${SITE_URL}/
Dernière génération : ${generatedAt.slice(0, 10)}

${AGENT_INSTRUCTIONS}

${llmsTxtSections.map(renderSection).join('\n\n')}

## Profils officiels

${IDENTITY.sameAs.map((url) => `- ${url}`).join('\n')}
- Code source de ce site : ${REPO_URL}

## Ressources pour agents

- Index des pages : ${SITE_URL}/sitemap.xml
- Version Markdown de l'accueil : ${SITE_URL}/index.md
- Ce document en Markdown : ${SITE_URL}/llms.md
- Compétences déclarées : ${SITE_URL}/.well-known/agent-skills/index.json
- Carte agent (A2A) : ${SITE_URL}/.well-known/agent-card.json
- Flux de données structurées : ${SITE_URL}/schemamap.xml
- Contact sécurité : ${SITE_URL}/.well-known/security.txt

## Pour les agents de code

Le code source de ce site est public et documenté pour les agents :

- Dépôt : ${REPO_URL}
- Instructions agent : ${REPO_URL}/blob/main/AGENTS.md
- Skill publiée : ${REPO_URL}/blob/main/SKILL.md
- Manifeste Agent Plugin : ${REPO_URL}/blob/main/plugin.json

## Ce que ce site n'expose pas

Aucune API publique, aucun endpoint authentifié, aucun serveur MCP, aucun
paiement. Les documents Markdown ci-dessus sont la seule interface destinée aux
machines.
`;
};

// Index de section : un agent qui ne s'interesse qu'aux projets n'a pas a lire
// tout le manuel.
const buildSectionLlmsTxt = (title, slugs, intro) => {
  const bySlug = new Map(publicRoutes.map((route) => [route.slug, route]));
  const lines = slugs
    .map((slug) => bySlug.get(slug))
    .filter(Boolean)
    .map(
      (route) =>
        `- [${contentFor(route).heading}](${absoluteUrl(route.path)}) : ${route.description} Markdown : ${absoluteUrl(markdownPath(route))}`,
    );

  return `# ${title}

> ${intro}

${lines.join('\n')}

Index complet du site : ${SITE_URL}/llms.txt
`;
};

// ── Jumeaux Markdown ─────────────────────────────────────────────────────────

const buildRouteMarkdown = (route) => {
  const { heading, body } = contentFor(route);
  return `# ${heading}

> ${route.description}

- URL canonique : ${absoluteUrl(route.path)}
- Dernière mise à jour : ${route.lastmod}
- Auteur : ${IDENTITY.name}

${body}

---

Index du site : ${SITE_URL}/llms.txt · Toutes les pages sont disponibles en Markdown en ajoutant \`.md\` à leur URL.
`;
};

// ── Manifestes .well-known ───────────────────────────────────────────────────

// Pas de champ $schema ici : l'URL de schema de cette specification n'est pas
// publiee a une adresse stable, et declarer un $schema qui repond 404 envoie un
// agent validateur dans le vide. On reference la specification elle-meme, qui
// existe.
const buildArd = () => ({
  specification: 'https://agenticresourcediscovery.org/',
  version: '1.0',
  updated: generatedAt,
  resource: {
    name: `${IDENTITY.name} — Portfolio`,
    description: `Portfolio professionnel de ${IDENTITY.name}, ${IDENTITY.jobTitle} à Montpellier. Source primaire sur son parcours, ses compétences et ses projets.`,
    url: `${SITE_URL}/`,
    type: 'content',
    language: 'fr',
    license: 'https://creativecommons.org/licenses/by/4.0/',
  },
  contact: { email: IDENTITY.email, url: `${SITE_URL}/contact` },
  // Ce que le site sait faire, en clair : un agent doit pouvoir arbitrer sans
  // ouvrir une seule page.
  capabilities: [
    {
      name: 'profil-professionnel',
      description:
        'Parcours, expériences, formation et compétences de Valentin Fiess, en français.',
      url: `${SITE_URL}/about.md`,
    },
    {
      name: 'catalogue-projets',
      description: 'Projets Data, IA, automatisation et web, avec étude de cas architecturale.',
      url: `${SITE_URL}/projets.md`,
    },
    {
      name: 'prise-de-contact',
      description: 'Canaux de contact humains et façon de rédiger une demande utile.',
      url: `${SITE_URL}/contact.md`,
    },
  ],
  resources: [
    { type: 'llms-txt', url: `${SITE_URL}/llms.txt` },
    { type: 'sitemap', url: `${SITE_URL}/sitemap.xml` },
    { type: 'agent-skills', url: `${SITE_URL}/.well-known/agent-skills/index.json` },
    { type: 'agent-card', url: `${SITE_URL}/.well-known/agent-card.json` },
    { type: 'security-txt', url: `${SITE_URL}/.well-known/security.txt` },
  ],
  // Declare explicitement l'absence d'API : sans cette ligne, un agent la
  // cherche et perd du temps sur des 404.
  interfaces: { api: null, mcp: null, payments: null },
});

const buildAiCatalog = () => ({
  specification: 'https://ai-catalog.io/',
  version: '1.0',
  updated: generatedAt,
  name: `${IDENTITY.name} — Portfolio`,
  description: `Site personnel et portfolio de ${IDENTITY.name}, ${IDENTITY.jobTitle} basé à Montpellier (France).`,
  url: `${SITE_URL}/`,
  language: ['fr'],
  categories: ['portfolio', 'personal-website', 'artificial-intelligence', 'data-engineering'],
  provider: {
    name: IDENTITY.name,
    type: 'Person',
    url: `${SITE_URL}/`,
    email: IDENTITY.email,
    sameAs: IDENTITY.sameAs,
  },
  content: publicRoutes.map((route) => ({
    title: contentFor(route).heading,
    url: absoluteUrl(route.path),
    markdown: absoluteUrl(markdownPath(route)),
    description: route.description,
    updated: route.lastmod,
  })),
  access: {
    authentication: 'none',
    pricing: 'free',
    rateLimit: null,
    formats: ['text/html', 'text/markdown'],
    contentNegotiation: 'Envoyer Accept: text/markdown, ou ajouter .md à l’URL.',
  },
  usagePolicy: {
    indexing: 'allowed',
    citation: 'allowed',
    training: 'allowed',
    attribution: `${IDENTITY.name} — ${SITE_URL}`,
  },
});

const buildAgentCard = (skills) => ({
  specification: 'https://a2a-protocol.org/',
  protocolVersion: '0.3.0',
  name: 'valentin-fiess-portfolio',
  description: `Ressource documentaire sur ${IDENTITY.name}, ${IDENTITY.jobTitle}. Répond aux questions sur son parcours, ses compétences et ses projets à partir de documents Markdown publics.`,
  version: '1.0.0',
  url: `${SITE_URL}/`,
  documentationUrl: `${SITE_URL}/llms.txt`,
  provider: {
    organization: IDENTITY.name,
    url: `${SITE_URL}/`,
  },
  // HTTP+JSON est la seule valeur de l'enum A2A qui corresponde : le site sert
  // des documents en HTTP, sans JSON-RPC ni gRPC. Le champ documentFormat
  // ci-dessous precise qu'il s'agit de documents statiques, sans sortir de
  // l'enum -- une valeur inventee ferait echouer la validation d'un agent.
  preferredTransport: 'HTTP+JSON',
  documentFormat: 'static-documents',
  capabilities: { streaming: false, pushNotifications: false, stateTransitionHistory: false },
  defaultInputModes: ['text/plain'],
  defaultOutputModes: ['text/markdown', 'text/html'],
  securitySchemes: {},
  security: [],
  skills: skills.map((skill) => ({
    id: skill.name,
    name: skill.name,
    description: skill.description,
    tags: ['portfolio', 'profil', 'contact'],
    examples: skill.examples,
    inputModes: ['text/plain'],
    outputModes: ['text/markdown'],
  })),
});

// RFC 9727. Le linkset est vide et c'est l'information utile : le site ne
// publie aucune API. Un catalogue vide et valide vaut mieux qu'un 404 que le
// scanner interprete comme un document casse.
const buildApiCatalog = () => ({
  linkset: [],
  'x-status': {
    apis: 'none',
    reason:
      "valentin-fiess.fr est un site statique de portfolio. Il n'expose aucune API HTTP publique, donc aucune description de service à cataloguer.",
    machineReadableAlternative: `${SITE_URL}/llms.txt`,
    updated: generatedAt,
  },
});

// Index Agent Skills v0.2.0. Le digest est calcule sur les octets bruts du
// fichier servi : un agent peut verifier qu'il a bien recu l'artefact declare.
const buildSkillsIndex = async () => {
  const files = (await readdir(skillsDir)).filter((file) => file.endsWith('.md')).sort();

  if (files.length === 0) {
    throw new Error(`Aucun SKILL Markdown trouve dans ${skillsDir}.`);
  }

  const skills = await Promise.all(
    files.map(async (file) => {
      const raw = await readFile(resolve(skillsDir, file));
      const text = raw.toString('utf8');

      // Le frontmatter YAML est minimal (name, description) : deux regex
      // suffisent et evitent une dependance de parsing.
      const name = text.match(/^name:\s*(.+)$/m)?.[1]?.trim();
      const description = text.match(/^description:\s*(.+)$/m)?.[1]?.trim();

      if (!name || !description) {
        throw new Error(
          `${file} : frontmatter incomplet. "name" et "description" sont obligatoires pour l'index v0.2.0.`,
        );
      }

      return {
        name,
        description,
        type: 'skill-md',
        url: `${SITE_URL}/.well-known/agent-skills/${file}`,
        digest: `sha256:${createHash('sha256').update(raw).digest('hex')}`,
        license: 'CC-BY-4.0',
        examples:
          name === 'contact-valentin-fiess'
            ? ['Comment contacter Valentin Fiess ?', 'Écris-lui un email pour une mission RAG.']
            : ['Qui est Valentin Fiess ?', 'Quelle est son expérience en MLOps ?'],
      };
    }),
  );

  const index = {
    $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
    version: '0.2.0',
    updated: generatedAt,
    provider: { name: IDENTITY.name, url: `${SITE_URL}/` },
    skills: skills.map(({ examples, ...skill }) => skill),
  };

  return { index, skills };
};

// ── Schema Map et feed structure (NLWeb) ─────────────────────────────────────

// robots.txt pointe vers ce fichier via la directive `schemamap:`. Il declare
// ou trouver les donnees structurees du site sous forme de flux, plutot que
// page par page.
const buildSchemaMap = () => `<?xml version="1.0" encoding="UTF-8"?>
<!-- Genere par scripts/generate-agent-manifests.mjs. Ne pas editer a la main. -->
<schemamap xmlns="http://www.schemamap.org/schemas/schemamap/0.1">
  <feed>
    <loc>${SITE_URL}/feeds/pages.jsonl</loc>
    <type>application/jsonl</type>
    <schema>https://schema.org/WebPage</schema>
    <lastmod>${generatedAt.slice(0, 10)}</lastmod>
    <description>Une ligne JSON-LD par page publique du site.</description>
  </feed>
</schemamap>
`;

// Un objet JSON-LD par ligne : c'est le format que les consommateurs NLWeb
// lisent en flux, sans charger tout le document en memoire.
const buildPagesFeed = () =>
  `${publicRoutes
    .map((route) =>
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${absoluteUrl(route.path)}#webpage`,
        url: absoluteUrl(route.path),
        name: route.title,
        headline: contentFor(route).heading,
        description: route.description,
        inLanguage: 'fr-FR',
        dateModified: route.lastmod,
        author: { '@type': 'Person', name: IDENTITY.name, url: `${SITE_URL}/` },
        encoding: {
          '@type': 'MediaObject',
          encodingFormat: 'text/markdown',
          contentUrl: absoluteUrl(markdownPath(route)),
        },
      }),
    )
    .join('\n')}\n`;

// ── JSON-LD, partage avec le prerender ───────────────────────────────────────

// Exporte pour scripts/prerender.mjs : le meme graphe doit etre injecte dans
// les coquilles HTML et decrit dans les manifestes.
export const buildJsonLd = (route) => {
  const personId = `${SITE_URL}/#person`;
  const websiteId = `${SITE_URL}/#website`;

  const graph = [
    {
      '@type': 'Person',
      '@id': personId,
      name: IDENTITY.name,
      jobTitle: IDENTITY.jobTitle,
      description: `${IDENTITY.jobTitle} à Montpellier : RAG, LLM, MLOps, Python et applications web.`,
      url: `${SITE_URL}/`,
      email: `mailto:${IDENTITY.email}`,
      image: `${SITE_URL}/assets/assets_index/Valentin_Fiess.webp`,
      sameAs: IDENTITY.sameAs,
      address: {
        '@type': 'PostalAddress',
        addressLocality: IDENTITY.locality,
        postalCode: IDENTITY.postalCode,
        addressRegion: IDENTITY.region,
        addressCountry: IDENTITY.country,
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'professional',
        email: IDENTITY.email,
        url: `${SITE_URL}/contact`,
        availableLanguage: ['fr', 'en'],
      },
      worksFor: { '@type': 'Organization', name: 'Shaarp', url: 'https://shaarp.ai' },
      alumniOf: { '@type': 'EducationalOrganization', name: 'EPSI Montpellier' },
      knowsAbout: [
        'Retrieval-Augmented Generation',
        'Large Language Models',
        'MLOps',
        'Ingénierie des données',
        'Vision par ordinateur',
        'Python',
        'Vue.js',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: `${SITE_URL}/`,
      name: `${IDENTITY.name} — Portfolio`,
      description: `Portfolio de ${IDENTITY.name}, ${IDENTITY.jobTitle}.`,
      inLanguage: 'fr-FR',
      publisher: { '@id': personId },
      author: { '@id': personId },
      license: 'https://creativecommons.org/licenses/by/4.0/',
    },
    {
      '@type': 'WebPage',
      '@id': `${absoluteUrl(route.path)}#webpage`,
      url: absoluteUrl(route.path),
      name: route.title,
      description: route.description,
      inLanguage: 'fr-FR',
      isPartOf: { '@id': websiteId },
      about: { '@id': personId },
      dateModified: route.lastmod,
      primaryImageOfPage: `${SITE_URL}/assets/og/${route.slug}.png`,
      // Declare le jumeau Markdown au niveau de la page : c'est le signal que
      // lit un agent qui ne connait pas la convention .md.
      encoding: {
        '@type': 'MediaObject',
        encodingFormat: 'text/markdown',
        contentUrl: absoluteUrl(markdownPath(route)),
      },
    },
  ];

  // Fil d'Ariane : seulement pour les pages internes, la racine n'en a pas.
  if (route.path !== '/') {
    const segments = route.path.split('/').filter(Boolean);
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${absoluteUrl(route.path)}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${SITE_URL}/` },
        ...segments.map((segment, depth) => ({
          '@type': 'ListItem',
          position: depth + 2,
          name: depth === segments.length - 1 ? route.og.heading : segment,
          item: absoluteUrl(`/${segments.slice(0, depth + 1).join('/')}`),
        })),
      ],
    });
  }

  // La FAQ ne vaut que sur l'accueil : la repeter partout est un signal de
  // duplication pour les moteurs.
  if (route.path === '/') {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${SITE_URL}/#faq`,
      mainEntity: faq.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
};

// ── Execution ────────────────────────────────────────────────────────────────

const main = async () => {
  await write(resolve(publicDir, 'sitemap.xml'), buildSitemap());

  const llmsTxt = buildLlmsTxt();
  await write(resolve(publicDir, 'llms.txt'), llmsTxt);
  // llms.md sert la meme chose sous une extension que les agents reconnaissent
  // comme du Markdown sans avoir a lire l'en-tete Content-Type.
  await write(resolve(publicDir, 'llms.md'), llmsTxt);

  await write(
    resolve(publicDir, 'projets/llms.txt'),
    buildSectionLlmsTxt(
      'Projets — Valentin Fiess',
      ['projets', 'projets-raguia'],
      'Réalisations Data, IA, automatisation et développement web, avec une étude de cas architecturale détaillée.',
    ),
  );

  for (const route of publicRoutes) {
    const target = markdownPath(route).replace(/^\//, '');
    await write(resolve(publicDir, target), buildRouteMarkdown(route));
  }

  await write(resolve(publicDir, 'schemamap.xml'), buildSchemaMap());
  await write(resolve(publicDir, 'feeds/pages.jsonl'), buildPagesFeed());

  const { index, skills } = await buildSkillsIndex();
  await writeJson(resolve(skillsDir, 'index.json'), index);
  await writeJson(resolve(wellKnownDir, 'ard.json'), buildArd());
  await writeJson(resolve(wellKnownDir, 'ai-catalog.json'), buildAiCatalog());
  await writeJson(resolve(wellKnownDir, 'agent-card.json'), buildAgentCard(skills));
  await writeJson(resolve(wellKnownDir, 'api-catalog'), buildApiCatalog());
};

// Le script est aussi importe par prerender.mjs pour buildJsonLd : ne declencher
// la generation que lorsqu'il est lance directement.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`agent-manifests: ${error.message}`);
    process.exitCode = 1;
  });
}
