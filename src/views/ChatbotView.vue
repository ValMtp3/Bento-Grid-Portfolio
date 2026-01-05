<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Chatbot IA</h1>
        <p class="text-gray-600 dark:text-gray-400">Discutez avec mon assistant IA intelligent</p>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden p-8 text-center">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Chatbot IA</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Cliquez sur le bouton ci-dessous pour ouvrir le chatbot dans une nouvelle fenêtre.
        </p>
        <a
          href="https://valmtp3-chatbot-ia-cv.hf.space"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow transition-colors"
        >
          Ouvrir le Chatbot IA
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatbotView',
};
</script>

<style scoped></style>
