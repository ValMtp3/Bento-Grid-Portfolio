import { createRouter, createWebHistory } from 'vue-router';
import { getScrollBehavior } from '@/scroll';
import { routeMeta } from '@/data/seo.js';

const HomeView = () => import('@/views/HomeView.vue');
const LegalView = () => import('@/views/LegalView.vue');
const StackView = () => import('@/views/StackView.vue');
const ProjetsView = () => import('@/views/ProjetsView.vue');
const RaguiaView = () => import('@/views/projets/RaguiaView.vue');
const SeedGeneratorView = () => import('@/views/projets/SeedGeneratorView.vue');
const JusteRecruteMoiView = () => import('@/views/projets/JusteRecruteMoiView.vue');
const ChiffrementoCliView = () => import('@/views/projets/ChiffrementoCliView.vue');
const BlogView = () => import('@/views/BlogView.vue');
const BlogArticleView = () => import('@/views/BlogArticleView.vue');
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
    {
      path: '/projets/seed-generator',
      name: 'projet-seed-generator',
      component: SeedGeneratorView,
      meta: routeMeta('projets-seed-generator'),
    },
    {
      path: '/projets/juste-recrute-moi',
      name: 'projet-juste-recrute-moi',
      component: JusteRecruteMoiView,
      meta: routeMeta('projets-juste-recrute-moi'),
    },
    {
      path: '/projets/chiffremento-cli',
      name: 'projet-chiffremento-cli',
      component: ChiffrementoCliView,
      meta: routeMeta('projets-chiffremento-cli'),
    },
    { path: '/blog', name: 'blog', component: BlogView, meta: routeMeta('blog') },
    // Le nom de la route est le slug de l'article : BlogArticleView lit
    // agent-content.js avec, une seule source pour la page et le jumeau .md.
    {
      path: '/blog/modeles-de-decision',
      name: 'blog-modeles-de-decision',
      component: BlogArticleView,
      meta: routeMeta('blog-modeles-de-decision'),
    },
    {
      path: '/blog/harness2-google',
      name: 'blog-harness2-google',
      component: BlogArticleView,
      meta: routeMeta('blog-harness2-google'),
    },
    {
      path: '/blog/olala-ovh',
      name: 'blog-olala-ovh',
      component: BlogArticleView,
      meta: routeMeta('blog-olala-ovh'),
    },
    {
      path: '/blog/mistral-automne-2026',
      name: 'blog-mistral-automne-2026',
      component: BlogArticleView,
      meta: routeMeta('blog-mistral-automne-2026'),
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
