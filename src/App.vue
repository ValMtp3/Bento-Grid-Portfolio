<script setup>
import { RouterView } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useThemeStore } from './stores/theme.js';
import { storeToRefs } from 'pinia';
import Footer from './components/include/Footer.vue';
import CookieBanner from './components/include/CookieBanner.vue';
import ThemeToggle from './components/include/ThemeToggle.vue';

// Meta tags globaux
useMeta({
  title: 'Valentin Fiess | Portfolio Développeur',
  htmlAttrs: {
    lang: 'fr',
  },
  meta: [
    {
      name: 'description',
      content:
        'Portfolio de Valentin Fiess, développeur web et IA à Montpellier. Découvrez mes projets, mes compétences et mon parcours.',
    },
    {
      name: 'keywords',
      content:
        'développeur web, portfolio, Valentin Fiess, Montpellier, VueJS, Tailwind, Python, PHP Symfony',
    },
    { property: 'og:type', content: 'website' },
    { name: 'robots', content: 'index, follow' },
  ],
});

// Récupérer l'état du mode sombre
const themeStore = useThemeStore();
const { isDark } = storeToRefs(themeStore);
</script>

<template>
  <div
    class="bg-custom-gradient dark:bg-gradient-to-br dark:from-dark-start dark:to-dark-end transition-colors duration-500"
  >
    <ThemeToggle />
    <router-view />
    <div class="bg-white dark:bg-dark-secondary font-[AnonymousPro] transition-colors duration-300">
      <Footer />
    </div>
    <CookieBanner />
  </div>
</template>