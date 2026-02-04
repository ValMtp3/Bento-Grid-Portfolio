<template>
  <div class="fixed bottom-4 right-4 z-50">
    <button
      v-if="!isOpen"
      @click="openChatbot"
      class="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
      aria-label="Ouvrir le chatbot"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        ></path>
      </svg>
    </button>

    <div
      v-if="isOpen"
      class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 w-[calc(100vw-2rem)] md:w-96 h-[70vh] md:h-[600px] flex flex-col"
    >
      <div
        class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"
      >
        <h3 class="font-semibold text-gray-900 dark:text-white">Chatbot IA</h3>
        <button
          @click="closeChatbot"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Fermer le chatbot"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>

      <div class="flex-1 overflow-hidden relative">
        <ChatInterface />
      </div>
    </div>
  </div>
</template>

<script>
import ChatInterface from './ChatInterface.vue';

export default {
  name: 'ChatbotWidget',
  components: {
    ChatInterface,
  },
  data() {
    return {
      isOpen: false,
    };
  },
  methods: {
    openChatbot() {
      this.isOpen = true;
    },

    closeChatbot() {
      this.isOpen = false;
    },
  },
};
</script>

<style scoped>
.fixed > div:last-child {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-0.5rem);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}
</style>
