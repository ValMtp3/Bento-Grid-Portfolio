import { createRouter, createWebHistory } from 'vue-router';

const HomeView = () => import('@/views/HomeView.vue');
const LegalView = () => import('@/views/LegalView.vue');
const StackView = () => import('@/views/StackView.vue');
const ProjetsView = () => import('@/views/ProjetsView.vue');
const PolicyView = () => import('@/views/PolicyView.vue');
const ChatbotView = () => import('@/views/ChatbotView.vue');
const JusticeView = () => import('@/views/JusticeView.vue');
const NotFound = () => import('@/views/errors/NotFound.vue');

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: 'Valentin Fiess | Développeur Data & IA', description: 'Portfolio de Valentin Fiess, développeur Data et IA spécialisé en RAG, automatisation, Python et applications web. Découvrez ses projets et compétences.' },
    },
    {
      path: '/legal',
      name: 'legal',
      component: LegalView,
      meta: { title: 'Mentions légales | Valentin Fiess', description: 'Mentions légales et conditions générales d’utilisation du portfolio de Valentin Fiess.' },
    },
    {
      path: '/stack',
      name: 'stack',
      component: StackView,
      meta: { title: 'Stack technique | Valentin Fiess', description: 'Technologies et outils Data, IA et développement web utilisés par Valentin Fiess.' },
    },
    {
      path: '/projets',
      name: 'projets',
      component: ProjetsView,
      meta: { title: 'Projets Data, IA & Web | Valentin Fiess', description: 'Découvrez les projets Data, intelligence artificielle, automatisation et développement web réalisés par Valentin Fiess.' },
    },
    {
      path: '/policy',
      name: 'policy',
      component: PolicyView,
      meta: { title: 'Politique de confidentialité | Valentin Fiess', description: 'Politique de confidentialité du portfolio de Valentin Fiess.' },
    },
    {
      path: '/chatbot',
      name: 'chatbot',
      component: ChatbotView,
      meta: { title: 'Assistant IA | Valentin Fiess', description: 'Interrogez l\'assistant IA de Valentin Fiess sur son parcours, ses compétences et ses projets.' },
    },
    {
      path: '/justice',
      name: 'justice',
      component: JusticeView,
      meta: { title: 'Pièces justificatives | Valentin Fiess', description: 'Pièces justificatives.', robots: 'noindex, nofollow' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound,
      meta: { title: 'Page non trouvée | Valentin Fiess', description: 'La page demandée est introuvable.', robots: 'noindex, nofollow' },
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth';
    if (to.hash) {
      return {
        el: to.hash,
        behavior,
      };
    }
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0, behavior };
  },
});
export default router;
