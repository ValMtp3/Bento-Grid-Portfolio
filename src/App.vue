<script setup>
import { RouterView } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useThemeStore } from './stores/theme.js';
import Footer from './components/include/Footer.vue';
import CookieBanner from './components/include/CookieBanner.vue';
import ThemeToggle from './components/include/ThemeToggle.vue';
import ChatbotWidget from './components/ChatbotWidget.vue';

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

// Récupérer l'état du mode sombre et initialiser le thème
const themeStore = useThemeStore();
themeStore.init();
</script>

<template>
  <div
    class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500"
  >
    <!-- Lien d'évitement pour l'accessibilité -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-blue-600 text-white px-4 py-2 rounded z-50"
    >
      Aller au contenu principal
    </a>

    <div class="fixed top-4 right-4 z-50">
      <ThemeToggle />
    </div>

    <main id="main-content" role="main" class="min-h-screen">
      <router-view />
    </main>

    <footer
      class="bg-white dark:bg-gray-900 font-[AnonymousPro] transition-colors duration-300"
      role="contentinfo"
    >
      <Footer />
    </footer>

    <CookieBanner />

    <ChatbotWidget />
  </div>
</template>
