// Source de verite unique des metadonnees par route.
// Consommee par le routeur (navigation client) et par scripts/prerender.mjs
// (coquilles HTML statiques lues par les crawlers sociaux, qui n'executent pas JS).
export const SITE_URL = 'https://valentin-fiess.fr';

export const seoRoutes = [
  {
    path: '/',
    slug: 'home',
    title: 'Valentin Fiess | Ingénieur IA & Data',
    description:
      'Ingénieur IA/Data à Montpellier. RAG, LLM, MLOps, Python. Projets, stack technique et parcours.',
    og: { kicker: 'valentin-fiess.fr', heading: 'Ingénieur IA / Data', sub: 'RAG · LLM · MLOps · Python — Montpellier' },
  },
  {
    path: '/projets',
    slug: 'projets',
    title: 'Projets Data, IA & Web | Valentin Fiess',
    description:
      'Projets Data et IA : RAG, agents, vision par ordinateur, pipelines ETL et applications web. Code source et démos.',
    og: { kicker: 'valentin-fiess.fr/projets', heading: 'Projets', sub: 'RAG · Agents · Vision · ETL' },
  },
  {
    path: '/projets/raguia',
    slug: 'projets-raguia',
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
    title: 'Stack technique | Valentin Fiess',
    description:
      'Stack technique complète : développement agentique avec OpenCode, MCP et lean-ctx, ZED, VPS OVH, Docker et Cloudflare.',
    og: { kicker: 'valentin-fiess.fr/stack', heading: 'Stack technique', sub: 'OpenCode · MCP · Docker · OVH' },
  },
  {
    path: '/chatbot',
    slug: 'chatbot',
    title: 'Assistant IA | Valentin Fiess',
    description:
      "Chatbot RAG connecté au parcours de Valentin Fiess : expériences, compétences et projets, sourcés depuis son CV.",
    og: { kicker: 'valentin-fiess.fr/chatbot', heading: 'Assistant IA', sub: 'Chatbot RAG connecté au CV' },
  },
  {
    path: '/legal',
    slug: 'legal',
    title: 'Mentions légales | Valentin Fiess',
    description: "Mentions légales et conditions générales d'utilisation du portfolio de Valentin Fiess.",
    og: { kicker: 'valentin-fiess.fr/legal', heading: 'Mentions légales', sub: 'Éditeur, hébergement, propriété intellectuelle' },
  },
  {
    path: '/policy',
    slug: 'policy',
    title: 'Politique de confidentialité | Valentin Fiess',
    description:
      'Politique de confidentialité : données collectées, cookies, mesure d’audience Matomo et droits RGPD.',
    og: { kicker: 'valentin-fiess.fr/policy', heading: 'Confidentialité', sub: 'Cookies · Matomo · RGPD' },
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
