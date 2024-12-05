import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import LegalView from '@/views/LegalView.vue';
import StackView from '@/views/StackView.vue';
import ProjetsView from '@/views/ProjetsView.vue';
import PolicyView from '@/views/PolicyView.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/legal',
            name: 'legal',
            component: LegalView
        },
        {
            path: '/stack',
            name: 'stack',
            component: StackView
        },
        {
            path: '/projets',
            name: 'projets',
            component: ProjetsView
        },
        {
            path: '/policy',
            name: 'policy',
            component: PolicyView
        }
    ]
})
export default router
