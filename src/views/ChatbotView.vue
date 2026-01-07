<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Chatbot IA</h1>
        <p class="text-gray-600 dark:text-gray-400">Discutez avec mon assistant IA intelligent</p>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden h-[800px]">
        <ChatInterface />
      </div>
    </div>
  </div>
</template>

<script>
import ChatInterface from '@/components/ChatInterface.vue';

export default {
  name: 'ChatbotView',
  components: {
    ChatInterface,
  },
};
</script>

<style scoped></style>
