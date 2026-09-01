<template>
  <div class="min-h-screen bg-gray-50 dark:bg-coffee-bean-950 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-coffee-bean-950 dark:text-soft-blush-50 mb-2">
          Assistant RAG
        </h1>
        <p class="text-coffee-bean-700 dark:text-soft-blush-300">
          Posez vos questions sur mon parcours, mes projets ou ma disponibilité. Les réponses sont
          générées à partir de mon CV, pas improvisées.
        </p>
      </div>

    <div class="bg-white dark:bg-coffee-bean-950 rounded-xl shadow-lg overflow-hidden h-200 dark:border dark:border-coffee-bean-800/40">
        <ChatInterface />
      </div>
    </div>
  </div>
</template>

<script setup>
// Les balises meta de la page sont appliquees par App.vue depuis router/index.js.
import ChatInterface from '@/components/ChatInterface.vue';
</script>
