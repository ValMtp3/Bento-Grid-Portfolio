<template>
  <div class="min-h-screen bg-gray-50 dark:bg-coffee-bean-950 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-soft-blush-50 mb-2">Chatbot IA</h1>
        <p class="text-gray-600 dark:text-soft-blush-300">Discutez avec mon assistant IA intelligent</p>
      </div>

    <div class="bg-white dark:bg-coffee-bean-950 rounded-xl shadow-lg overflow-hidden h-200 dark:border dark:border-coffee-bean-800/40">
        <ChatInterface />
      </div>
    </div>
  </div>
</template>

<script setup>
import ChatInterface from '@/components/ChatInterface.vue';
import { useMeta } from 'vue-meta';

useMeta({
  title: 'Chatbot IA | Valentin Fiess - Assistant Intelligent',
  meta: [
    {
      name: 'description',
      content:
        "Discutez avec le chatbot IA de Valentin Fiess. Un assistant intelligent connecté à mon CV pour répondre à vos questions sur mes compétences, projets et parcours.",
    },
    {
      name: 'keywords',
      content:
        'chatbot IA, assistant intelligent, Valentin Fiess, RAG, Mistral, intelligence artificielle, CV interactif',
    },
    { property: 'og:title', content: 'Chatbot IA | Valentin Fiess - Assistant Intelligent' },
    {
      property: 'og:description',
      content:
        "Discutez avec le chatbot IA de Valentin Fiess, connecté à son CV pour répondre à vos questions.",
    },
    { property: 'og:image', content: 'https://www.valentin-fiess.fr/assets/assets_index/Profile.webp' },
    { property: 'og:url', content: 'https://www.valentin-fiess.fr/chatbot' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Chatbot IA | Valentin Fiess - Assistant Intelligent' },
    {
      name: 'twitter:description',
      content: "Discutez avec le chatbot IA de Valentin Fiess.",
    },
    { name: 'twitter:image', content: 'https://www.valentin-fiess.fr/assets/assets_index/Profile.webp' },
    { name: 'author', content: 'Valentin Fiess' },
    { name: 'robots', content: 'index, follow' },
    { name: 'language', content: 'fr-FR' },
  ],
});
</script>

<style scoped></style>
