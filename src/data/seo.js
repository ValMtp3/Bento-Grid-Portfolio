// Source de verite unique des metadonnees par route.
// Consommee par le routeur (navigation client), par scripts/prerender.mjs
// (coquilles HTML statiques lues par les crawlers sociaux, qui n'executent pas JS)
// et par scripts/generate-agent-manifests.mjs (sitemap, jumeaux Markdown,
// manifestes .well-known lus par les agents).
export const SITE_URL = 'https://valentin-fiess.fr';

// Adresse de contact, encodee en base64 : jamais en clair dans aucune source,
// donc ni dans le HTML servi ni dans les bundles JS (un scan regex des assets
// ne la trouve pas). Seul EmailProtection la decode, au clic, pour construire
// le mailto. atob existe en Node 22 (scripts) comme dans le navigateur (Vue).
export const EMAIL_B64 = 'Ni5yYXJlLmt1ZHp1QGljbG91ZC5jb20=';

// Identite publique, reutilisee par le JSON-LD, l'agent-card et les manifestes.
// Une seule adresse a corriger le jour ou l'un de ces champs change.
// Pas de champ email ici : les manifestes agent pointent vers /contact.
export const IDENTITY = {
  name: 'Valentin Fiess',
  jobTitle: 'Ingénieur IA / Data',
  locality: 'Perols',
  postalCode: '34470',
  region: 'Occitanie',
  country: 'FR',
  sameAs: [
    'https://github.com/ValMtp3',
    'https://www.linkedin.com/in/valentin-fiess/',
    'https://x.com/WyqBzm',
  ],
};

// Photo de profil, declaree au meme endroit pour le JSON-LD, le sitemap et la
// coquille HTML prerendue. `slugs` liste les pages ou elle apparait vraiment :
// la declarer ailleurs dirait a Google qu'une page contient une image absente.
export const PROFILE_IMAGE = {
  path: '/assets/assets_index/Valentin_Fiess.webp',
  alt: 'Photo de Valentin Fiess',
  width: 1024,
  height: 1024,
  slugs: ['home', 'about'],
};

export const seoRoutes = [
  {
    path: '/',
    slug: 'home',
    lastmod: '2026-07-11',
    title: 'Valentin Fiess | Ingénieur IA & Data',
    description:
      'Ingénieur IA/Data à Montpellier. RAG, LLM, MLOps, Python. Projets, stack technique et parcours.',
    og: { kicker: 'valentin-fiess.fr', heading: 'Ingénieur IA / Data', sub: 'RAG · LLM · MLOps · Python — Montpellier' },
  },
  {
    path: '/projets',
    slug: 'projets',
    lastmod: '2026-07-11',
    title: 'Projets Data, IA & Web | Valentin Fiess',
    description:
      'Projets Data et IA : RAG, agents, vision par ordinateur, pipelines ETL et applications web. Code source et démos.',
    og: { kicker: 'valentin-fiess.fr/projets', heading: 'Projets', sub: 'RAG · Agents · Vision · ETL' },
  },
  {
    path: '/projets/raguia',
    slug: 'projets-raguia',
    lastmod: '2026-09-01',
    title: 'Raguia, étude de cas | Valentin Fiess',
    description:
      "Étude de cas Raguia : un RAG multi-tenant sécurisé. Pourquoi PGVector plutôt qu'une base vectorielle dédiée, et pourquoi le filtrage des permissions se fait au retrieval.",
    og: {
      kicker: 'valentin-fiess.fr/projets/raguia',
      heading: 'Raguia',
      sub: 'Étude de cas — RAG multi-tenant sécurisé',
    },
  },
  {
    path: '/projets/seed-generator',
    slug: 'projets-seed-generator',
    lastmod: '2026-11-17',
    title: 'Seed Generator, étude de cas | Valentin Fiess',
    description:
      "Étude de cas Seed Generator : un générateur de phrases BIP-39 hors ligne en Go, zéro dépendance, vérifiable plutôt que cru sur parole.",
    og: {
      kicker: 'valentin-fiess.fr/projets/seed-generator',
      heading: 'Seed Generator',
      sub: 'Étude de cas — BIP-39 hors ligne, zero-dep',
    },
  },
  {
    path: '/projets/juste-recrute-moi',
    slug: 'projets-juste-recrute-moi',
    lastmod: '2026-11-17',
    title: 'Juste Recrute Moi, étude de cas | Valentin Fiess',
    description:
      "Étude de cas Juste Recrute Moi : un agrégateur local-first d'offres d'emploi pour le marché français, fork de JustHireMe adapté aux sources hexagonales.",
    og: {
      kicker: 'valentin-fiess.fr/projets/juste-recrute-moi',
      heading: 'Juste Recrute Moi',
      sub: "Étude de cas — agrégateur local-first d'offres",
    },
  },
  {
    path: '/projets/chiffremento-cli',
    slug: 'projets-chiffremento-cli',
    lastmod: '2026-11-17',
    title: 'Chiffremento CLI, étude de cas | Valentin Fiess',
    description:
      "Étude de cas Chiffremento CLI : chiffrement authentifié de fichiers en Go, format v4 à enveloppe DEK/KEK, Argon2id et releases signées.",
    og: {
      kicker: 'valentin-fiess.fr/projets/chiffremento-cli',
      heading: 'Chiffremento CLI',
      sub: 'Étude de cas — chiffrement authentifié en Go',
    },
  },
  {
    path: '/blog',
    slug: 'blog',
    lastmod: '2026-11-17',
    title: 'Blog — notes et études de cas | Valentin Fiess',
    description:
      "Blog de Valentin Fiess : études de cas de projets Data et IA (RAG, chiffrement, agrégation d'offres) et notes techniques, publiées au fil des réalisations.",
    og: { kicker: 'valentin-fiess.fr/blog', heading: 'Blog', sub: 'Études de cas · notes Data & IA' },
  },
  {
    path: '/blog/modeles-de-decision',
    slug: 'blog-modeles-de-decision',
    lastmod: '2026-11-17',
    title:
      'Modèles de décision (Jev, Elephant, d1 de Liquid AI) et routage de modèles | Valentin Fiess',
    description:
      "Jev (TypeSafe), Elephant-1 (Base Labs) et d1 (Liquid AI) : ce que sont les modèles de décision System One, comment ils remplacent le LLM-as-a-judge et accélèrent le routage de modèles, avec cas d'usage, benchmarks et limites.",
    og: {
      kicker: 'valentin-fiess.fr/blog/modeles-de-decision',
      heading: 'Modèles de décision & routage',
      sub: 'Jev · Elephant-1 · d1 — System One en production',
    },
  },
  {
    path: '/blog/harness2-google',
    slug: 'blog-harness2-google',
    lastmod: '2026-11-17',
    title: 'Harness² de Google : l’agent qui réécrit son propre harness | Valentin Fiess',
    description:
      "Le papier arXiv:2610.14224 et le framework open source google-research/harness2 : raffinement récursif du harness (prompts, outils, mémoire) à poids figés, Propose-Probe-Compose sans vérificateur, jusqu'à +11,5 points sur WorkBuddy-Bench.",
    og: {
      kicker: 'valentin-fiess.fr/blog/harness2-google',
      heading: 'Harness² de Google',
      sub: 'Recursive agent harnessing — arXiv:2610.14224',
    },
  },
  {
    path: '/blog/olala-ovh',
    slug: 'blog-olala-ovh',
    lastmod: '2026-11-17',
    title: 'Olala mini 7A1B : le premier LLM souverain d’OVHcloud | Valentin Fiess',
    description:
      "OVHcloud dévoile Olala, sa première famille de LLM : Olala mini 7A1B, modèle compact 7A1B open source (Apache 2.0) entraîné de zéro sur des supercalculateurs européens, qui tourne sur 8 Go de VRAM voire sans GPU. Contexte, rachat de Dragon LLM et enjeux de souveraineté.",
    og: {
      kicker: 'valentin-fiess.fr/blog/olala-ovh',
      heading: 'Olala mini 7A1B — OVHcloud',
      sub: 'Premier LLM souverain d’OVHcloud, open source',
    },
  },
  {
    path: '/blog/mistral-automne-2026',
    slug: 'blog-mistral-automne-2026',
    lastmod: '2026-11-17',
    title:
      'Mistral à l’automne 2026 : Large 4 « Le Chonk », Voxtral 3 et Vibe 3.0 en Rust | Valentin Fiess',
    description:
      "Trois annonces Mistral : Mistral Large 4 (1T paramètres, poids ouverts, n°1 open du Coding Agent Index, cyberdéfense), Voxtral 3 (transcription 50+ langues, TTS, SDK d'agents vocaux LiveKit) et Vibe CLI 3.0 réécrit en Rust avec un harness unifié.",
    og: {
      kicker: 'valentin-fiess.fr/blog/mistral-automne-2026',
      heading: 'Mistral — automne 2026',
      sub: 'Large 4 · Voxtral 3 · Vibe 3.0 en Rust',
    },
  },
  {
    path: '/stack',
    slug: 'stack',
    lastmod: '2026-07-11',
    title: 'Stack technique | Valentin Fiess',
    description:
      'Stack technique complète : développement agentique avec OpenCode, MCP et lean-ctx, ZED, VPS OVH, Docker et Cloudflare.',
    og: { kicker: 'valentin-fiess.fr/stack', heading: 'Stack technique', sub: 'OpenCode · MCP · Docker · OVH' },
  },
  {
    path: '/chatbot',
    slug: 'chatbot',
    lastmod: '2026-07-11',
    title: 'Assistant IA | Valentin Fiess',
    description:
      "Chatbot RAG connecté au parcours de Valentin Fiess : expériences, compétences et projets, sourcés depuis son CV.",
    og: { kicker: 'valentin-fiess.fr/chatbot', heading: 'Assistant IA', sub: 'Chatbot RAG connecté au CV' },
  },
  {
    path: '/legal',
    slug: 'legal',
    lastmod: '2026-07-11',
    title: 'Mentions légales | Valentin Fiess',
    description: "Mentions légales et conditions générales d'utilisation du portfolio de Valentin Fiess.",
    og: { kicker: 'valentin-fiess.fr/legal', heading: 'Mentions légales', sub: 'Éditeur, hébergement, propriété intellectuelle' },
  },
  {
    path: '/policy',
    slug: 'policy',
    lastmod: '2026-07-11',
    title: 'Politique de confidentialité | Valentin Fiess',
    description:
      'Politique de confidentialité : données collectées, cookies, mesure d’audience Matomo et droits RGPD.',
    og: { kicker: 'valentin-fiess.fr/policy', heading: 'Confidentialité', sub: 'Cookies · Matomo · RGPD' },
  },
  {
    path: '/about',
    slug: 'about',
    lastmod: '2026-09-10',
    title: 'À propos de Valentin Fiess | Ingénieur IA & Data',
    description:
      "Qui est Valentin Fiess : parcours d'ingénieur IA/Data à Montpellier, expériences chez Shaarp, Raguia et R2D automation, formation EPSI et façon de travailler.",
    og: { kicker: 'valentin-fiess.fr/about', heading: 'À propos', sub: 'Parcours · Méthode · Disponibilité' },
  },
  {
    path: '/contact',
    slug: 'contact',
    lastmod: '2026-09-10',
    title: 'Contact | Valentin Fiess',
    description:
      'Contacter Valentin Fiess, ingénieur IA/Data à Montpellier : email, LinkedIn, GitHub, délai de réponse et types de missions étudiées.',
    og: { kicker: 'valentin-fiess.fr/contact', heading: 'Contact', sub: 'Email · LinkedIn · GitHub' },
  },
  {
    path: '/privacy',
    slug: 'privacy',
    lastmod: '2026-09-10',
    title: 'Confidentialité et traitement des données | Valentin Fiess',
    description:
      'Résumé en clair du traitement des données sur valentin-fiess.fr : mesure d’audience Matomo, formulaire de contact, cookies, durées de conservation et droits RGPD.',
    og: { kicker: 'valentin-fiess.fr/privacy', heading: 'Confidentialité', sub: 'Données · Cookies · RGPD' },
  },
  {
    path: '/justice',
    slug: 'justice',
    title: 'Pièces justificatives | Valentin Fiess',
    description: 'Pièces justificatives.',
    robots: 'noindex, nofollow',
    prerender: false,
  },
  {
    path: '/:pathMatch(.*)*',
    slug: '404',
    title: 'Page non trouvée | Valentin Fiess',
    description: 'La page demandée est introuvable.',
    robots: 'noindex, nofollow',
    prerender: false,
  },
];

export const ogImagePath = (slug) => `/assets/og/${slug}.png`;

// Meta pretes a poser sur une route vue-router.
export const routeMeta = (slug) => {
  const entry = seoRoutes.find((route) => route.slug === slug);
  return {
    title: entry.title,
    description: entry.description,
    robots: entry.robots || 'index, follow',
    image: `${SITE_URL}${ogImagePath(entry.prerender === false ? 'home' : slug)}`,
  };
};
