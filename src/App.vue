<script setup>
import { onMounted, watchEffect } from 'vue';
import { useRoute, RouterView } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useThemeStore } from './stores/theme';
import Footer from './components/include/Footer.vue';
import CookieBanner from './components/include/CookieBanner.vue';
import ThemeToggle from './components/include/ThemeToggle.vue';
import HomeButton from './components/include/HomeButton.vue';
import ChatbotWidget from './components/ChatbotWidget.vue';

const route = useRoute();
const themeStore = useThemeStore();

themeStore.init();

useMeta({
  title: 'Valentin Fiess - Développeur Web & IA',
  meta: [
    {
      name: 'description',
      content:
        'Portfolio de Valentin Fiess, développeur web et intelligence artificielle. Découvrez mes projets, compétences et expériences.',
    },
    {
      name: 'keywords',
      content:
        'Valentin Fiess, développeur web, IA, intelligence artificielle, portfolio, React, Vue, Python, full-stack',
    },
    {
      property: 'og:title',
      content: 'Valentin Fiess - Développeur Web & IA',
    },
    {
      property: 'og:description',
      content: 'Portfolio de Valentin Fiess, développeur web et intelligence artificielle.',
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      property: 'og:url',
      content: 'https://valentin-fiess.com',
    },
  ],
});

onMounted(() => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Valentin Fiess',
    url: 'https://valentin-fiess.com',
    jobTitle: 'Développeur Web & IA',
    knowsAbout: ['Développement Web', 'Intelligence Artificielle', 'Full-Stack'],
    sameAs: ['https://github.com/valentinfiess', 'https://linkedin.com/in/valentinfiess'],
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'json-ld-person';
  script.textContent = JSON.stringify(jsonLd);
  document.head.appendChild(script);
});

watchEffect(() => {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = `https://valentin-fiess.com${route.path}`;
});
</script>

<template>
  <a
    href="#main-content"
    class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-regal-navy-600 text-soft-blush-50 px-4 py-2 rounded z-50"
  >
    Aller au contenu principal
  </a>

  <div
    class="min-h-screen bg-custom-gradient dark:bg-coffee-bean-950 transition-colors duration-500"
  >
    <HomeButton />
    <ThemeToggle />

    <router-view id="main-content" />

    <div class="bg-soft-blush-50 dark:bg-coffee-bean-900 font-body transition-colors duration-300">
      <Footer />
    </div>

    <CookieBanner />
    <ChatbotWidget />
  </div>
</template>
