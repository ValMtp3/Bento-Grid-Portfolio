<script setup>
import { nextTick, watch } from 'vue';
import { useRoute, RouterView } from 'vue-router';
import Footer from './components/include/Footer.vue';
import CookieBanner from './components/include/CookieBanner.vue';
import Navbar from './components/include/Navbar.vue';
import ChatbotWidget from './components/ChatbotWidget.vue';
import TerminalEasterEgg from './components/TerminalEasterEgg.vue';

const route = useRoute();

watch(
  () => route.fullPath,
  async () => {
    await nextTick();
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = `https://valentin-fiess.fr${route.path === '/' ? '/' : route.path}`;

    document.title = route.meta.title;

    const metaTags = [
      ['meta[name="description"]', route.meta.description],
      ['meta[name="robots"]', route.meta.robots || 'index, follow'],
      ['meta[property="og:title"]', route.meta.title],
      ['meta[property="og:description"]', route.meta.description],
      ['meta[property="og:url"]', link.href],
      ['meta[property="og:image"]', route.meta.image],
      ['meta[name="twitter:title"]', route.meta.title],
      ['meta[name="twitter:description"]', route.meta.description],
      ['meta[property="twitter:url"]', link.href],
      ['meta[name="twitter:image"]', route.meta.image],
    ];
    metaTags.forEach(([selector, content]) => {
      const meta = document.querySelector(selector);
      if (meta) meta.content = content;
    });
  },
  { immediate: true },
);
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
    <TerminalEasterEgg />
  </div>
</template>
