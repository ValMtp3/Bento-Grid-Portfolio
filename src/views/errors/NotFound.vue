<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 dark:from-blue-900 dark:to-blue-700 transition-colors duration-300"
  >
    <h1 class="text-8xl font-extrabold text-blue-600 dark:text-blue-400 mb-4">404</h1>
    <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Page non trouvée</h2>
    <p class="text-gray-600 dark:text-gray-300 mb-8 text-center px-4">
      Oups ! La page que vous cherchez n'existe pas ou a été déplacée.<br />
      Retournez à l'accueil ou explorez le site.
    </p>
    <router-link
      to="/"
      class="px-6 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-none font-semibold shadow transition-colors"
    >
      Retour à l'accueil
    </router-link>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { trackMatomoEvent } from '@/matomo';

// Titre, description et robots noindex sont appliques par App.vue depuis
// router/index.js : la route NotFound porte deja meta.robots = 'noindex, nofollow'.
onMounted(() => trackMatomoEvent('portfolio_error', 'not_found', 'route'));
</script>
