<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Chatbot IA</h1>
        <p class="text-gray-600 dark:text-gray-400">Discutez avec mon assistant IA intelligent</p>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <iframe
          src="https://valmtp3-chatbot-ia-cv.hf.space"
          class="w-full h-[700px] border-0"
          title="Chatbot IA"
        ></iframe>
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
