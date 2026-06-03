import { createRouter, createWebHistory } from 'vue-router';

import HomeView from '@/views/HomeView.vue';
const LegalView = () => import('@/views/LegalView.vue');
const StackView = () => import('@/views/StackView.vue');
const ProjetsView = () => import('@/views/ProjetsView.vue');
const PolicyView = () => import('@/views/PolicyView.vue');
const ChatbotView = () => import('@/views/ChatbotView.vue');
const NotFound = () => import('@/views/errors/NotFound.vue');

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/legal',
      name: 'legal',
      component: LegalView,
    },
    {
      path: '/stack',
      name: 'stack',
      component: StackView,
    },
    {
      path: '/projets',
      name: 'projets',
      component: ProjetsView,
    },
    {
      path: '/policy',
      name: 'policy',
      component: PolicyView,
    },
    {
      path: '/chatbot',
      name: 'chatbot',
      component: ChatbotView,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound,
    },
  ],
});
export default router;
