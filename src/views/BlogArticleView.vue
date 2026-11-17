<script setup>
// Vue generique des articles du blog : le nom de la route est le slug de
// l'article dans seo.js, qui sert de cle dans agent-content.js. Le contenu
// Markdown alimente la page HTML (DocArticle) et le jumeau .md servi aux
// agents : une seule source, deux formats.
import { useRoute } from 'vue-router';
import DocArticle from '@/components/include/DocArticle.vue';

const route = useRoute();
</script>

<template>
  <main class="mx-auto max-w-3xl px-4 pt-6 sm:px-6 sm:pt-8">
    <router-link
      to="/blog"
      class="mb-4 inline-block font-code text-xs uppercase tracking-[0.16em] text-coffee-bean-600 transition-colors hover:text-spicy-paprika-600 dark:text-soft-blush-300 dark:hover:text-spicy-paprika-400"
    >
      ← Tous les articles
    </router-link>
    <DocArticle :slug="route.name" />
  </main>
</template>
