// Source de verite unique des metadonnees par route.
// Consommee par le routeur (navigation client), par scripts/prerender.mjs
// (coquilles HTML statiques lues par les crawlers sociaux, qui n'executent pas JS)
// et par scripts/generate-agent-manifests.mjs (sitemap, jumeaux Markdown,
// manifestes .well-known lus par les agents).
export const SITE_URL = 'https://valentin-fiess.fr';

// Identite publique, reutilisee par le JSON-LD, l'agent-card et les manifestes.
// Une seule adresse a corriger le jour ou l'un de ces champs change.
export const IDENTITY = {
  name: 'Valentin Fiess',
  jobTitle: 'Ingenieur IA / Data',
  email: 'sobre.05.statue@icloud.com',
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
