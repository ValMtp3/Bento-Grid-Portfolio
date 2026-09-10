import { createRouter, createWebHistory } from 'vue-router';
import { getScrollBehavior } from '@/scroll';
import { routeMeta } from '@/data/seo.js';

const HomeView = () => import('@/views/HomeView.vue');
const LegalView = () => import('@/views/LegalView.vue');
const StackView = () => import('@/views/StackView.vue');
const ProjetsView = () => import('@/views/ProjetsView.vue');
const RaguiaView = () => import('@/views/projets/RaguiaView.vue');
const PolicyView = () => import('@/views/PolicyView.vue');
const AboutView = () => import('@/views/AboutView.vue');
const ContactView = () => import('@/views/ContactView.vue');
const PrivacyView = () => import('@/views/PrivacyView.vue');
const ChatbotView = () => import('@/views/ChatbotView.vue');
const JusticeView = () => import('@/views/JusticeView.vue');
const NotFound = () => import('@/views/errors/NotFound.vue');

// Titres, descriptions et images OG vivent dans src/data/seo.js : le meme fichier
// alimente la navigation client et la prerendition des coquilles HTML statiques.
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: routeMeta('home') },
    { path: '/legal', name: 'legal', component: LegalView, meta: routeMeta('legal') },
    { path: '/stack', name: 'stack', component: StackView, meta: routeMeta('stack') },
    { path: '/projets', name: 'projets', component: ProjetsView, meta: routeMeta('projets') },
    {
      path: '/projets/raguia',
      name: 'projet-raguia',
      component: RaguiaView,
      meta: routeMeta('projets-raguia'),
    },
    { path: '/policy', name: 'policy', component: PolicyView, meta: routeMeta('policy') },
    { path: '/chatbot', name: 'chatbot', component: ChatbotView, meta: routeMeta('chatbot') },
    // /about, /contact et /privacy sont les pages que les agents consultent pour
    // verifier qu'un site est legitime avant de le citer. Elles doublent
    // /legal et /policy en version lisible plutot qu'en version juridique.
    { path: '/about', name: 'about', component: AboutView, meta: routeMeta('about') },
    { path: '/contact', name: 'contact', component: ContactView, meta: routeMeta('contact') },
    { path: '/privacy', name: 'privacy', component: PrivacyView, meta: routeMeta('privacy') },
    {
      path: '/justice',
      name: 'justice',
      component: JusticeView,
      meta: { ...routeMeta('justice'), blankLayout: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound,
      meta: routeMeta('404'),
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    const behavior = getScrollBehavior();
    if (to.hash) {
      return { el: to.hash, behavior };
    }
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0, behavior };
  },
});
export default router;
