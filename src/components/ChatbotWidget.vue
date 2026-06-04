<template>
  <div class="fixed bottom-4 right-4 z-50">
    <button
      v-if="!isOpen"
      @click="openChatbot"
      class="bg-regal-navy-500 hover:bg-regal-navy-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center w-14 h-14"
      aria-label="Ouvrir le chatbot"
    >
      <span class="text-2xl transition-transform duration-300 lobster-icon">🦞</span>
    </button>

    <div
      v-if="isOpen"
      class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 w-[calc(100vw-2rem)] md:w-96 h-[70vh] md:h-150 flex flex-col"
    >
      <div
        class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"
      >
        <h3 class="font-semibold text-gray-900 dark:text-white flex items-center gap-2 select-none">
          <span>Homard GPT</span>
        </h3>
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

.lobster-icon {
  display: inline-block;
}

button:hover .lobster-icon {
  animation: wiggle 0.5s ease-in-out infinite;
}

@keyframes wiggle {
  0%,
  100% {
    transform: rotate(0deg) scale(1);
  }
  25% {
    transform: rotate(-15deg) scale(1.1);
  }
  75% {
    transform: rotate(15deg) scale(1.1);
  }
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
</style>
