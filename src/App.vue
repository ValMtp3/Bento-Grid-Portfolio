<script setup>
import { onMounted, watchEffect } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useThemeStore } from './stores/theme.js';
import Footer from './components/include/Footer.vue';
import CookieBanner from './components/include/CookieBanner.vue';
import ThemeToggle from './components/include/ThemeToggle.vue';
import HomeButton from './components/include/HomeButton.vue';
import ChatbotWidget from './components/ChatbotWidget.vue';

const route = useRoute();

// Meta tags globaux via vue-meta (Titre/Description)
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


// 1. Injection du JSON-LD

onMounted(() => {
  // 1. Injection du JSON-LD
  const scriptId = 'schema-json-ld';
  if (!document.getElementById(scriptId)) {
    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          'name': 'Valentin Fiess Portfolio',
          'url': 'https://www.valentin-fiess.fr/',
          'potentialAction': {
            '@type': 'SearchAction',
            'target': 'https://www.valentin-fiess.fr/?q={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
        },
        {
          '@type': 'Person',
          'name': 'Valentin Fiess',
          'url': 'https://www.valentin-fiess.fr',
          'sameAs': [
            'https://www.linkedin.com/in/valentin-fiess/',
            'https://www.github.com/ValMtp3',
          ],
          'jobTitle': 'Développeur Web',
          'knowsAbout': ['VueJS', 'Tailwind CSS', 'Python', 'PHP', 'Symfony'],
          'worksFor': {
            '@type': 'Organization',
            'name': 'Freelance',
          },
        },
      ],
    });
    document.head.appendChild(script);
  }
});

// 2. Gestion dynamique du Canonical
watchEffect(() => {
  if (route.path) {
    let link = document.querySelector("link[rel='canonical']");
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', `https://www.valentin-fiess.fr${route.path}`);
  }
});

// Récupérer l'état du mode sombre et initialiser le thème
const themeStore = useThemeStore();
themeStore.init();
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500"
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

    <HomeButton />

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
