<script setup>
import { onMounted, watchEffect } from 'vue';
import { useRoute, RouterView } from 'vue-router';
import { useMeta } from 'vue-meta';
import Footer from './components/include/Footer.vue';
import CookieBanner from './components/include/CookieBanner.vue';
import Navbar from './components/include/Navbar.vue';
import ChatbotWidget from './components/ChatbotWidget.vue';

const route = useRoute();

useMeta({
  title: 'Valentin Fiess - Développeur Data & IA',
  meta: [
    {
      name: 'description',
      content:
        "Portfolio de Valentin Fiess, développeur Data et intelligence artificielle spécialisé en RAG, automatisation et solutions IA.",
    },
    {
      name: 'keywords',
      content:
        'Valentin Fiess, développeur Data, IA, intelligence artificielle, RAG, automatisation, Python, MLOps, portfolio',
    },
    {
      property: 'og:title',
      content: 'Valentin Fiess - Développeur Data & IA',
    },
    {
      property: 'og:description',
      content: 'Portfolio de Valentin Fiess, développeur Data et intelligence artificielle.',
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
    jobTitle: 'Développeur Data & IA',
    knowsAbout: ['Intelligence Artificielle', 'RAG', 'Data', 'Python', 'MLOps'],
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
    class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-regal-navy-600 text-soft-blush-50 px-4 py-2 rounded-none z-50"
  >
    Aller au contenu principal
  </a>

  <div class="min-h-screen bg-custom-gradient dark:bg-custom-gradient-dark transition-colors duration-500">
    <Navbar />

    <router-view id="main-content" />

    <Footer />

    <CookieBanner />
    <ChatbotWidget />
  </div>
</template>
