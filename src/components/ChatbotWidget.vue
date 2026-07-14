<template>
  <div class="fixed bottom-4 right-4 z-50">
    <button
      v-if="!isOpen"
      ref="triggerButton"
      @click="openChatbot"
      class="chatbot-trigger group flex h-14 items-center gap-3 border border-coffee-bean-100 bg-soft-blush-50/95 px-3 shadow-sm shadow-coffee-bean-950/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-spicy-paprika-300 hover:shadow-md active:translate-y-0 dark:border-soft-blush-50/15 dark:bg-coffee-bean-900/95 dark:shadow-coffee-bean-950/30"
      aria-label="Ouvrir le chatbot"
    >
      <span
        class="lobster-icon flex h-9 w-9 shrink-0 items-center justify-center border border-spicy-paprika-200 bg-spicy-paprika-50 text-xl transition-transform duration-300 dark:border-spicy-paprika-700 dark:bg-spicy-paprika-950"
        aria-hidden="true"
      >
        🦞
      </span>
      <span class="hidden text-left sm:block">
        <span class="block font-heading text-sm font-bold text-coffee-bean-950 dark:text-soft-blush-50">
          Valentin Chatbot
        </span>
        <span class="block font-code text-[10px] text-coffee-bean-600 dark:text-soft-blush-300">
          Posez-moi une question
        </span>
      </span>
      <span class="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
        <span class="absolute inline-flex h-full w-full animate-ping bg-green-400 opacity-60"></span>
        <span class="relative inline-flex h-2.5 w-2.5 bg-green-500"></span>
      </span>
    </button>

    <div
      v-if="isOpen"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chatbot-title"
      class="bg-white dark:bg-coffee-bean-950 rounded-xl shadow-2xl border border-gray-200 dark:border-coffee-bean-800/60 w-[calc(100vw-2rem)] md:w-96 h-[70vh] md:h-150 flex flex-col"
    >
      <div
        class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-coffee-bean-800/60"
      >
        <h3 id="chatbot-title" class="font-semibold text-gray-900 dark:text-soft-blush-50 flex items-center gap-2 select-none">
          <span>Valentin Chatbot</span>
        </h3>
        <button
          ref="closeButton"
          @click="closeChatbot"
          class="flex min-h-11 min-w-11 items-center justify-center text-gray-500 hover:text-gray-700 dark:text-soft-blush-400 dark:hover:text-soft-blush-200"
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
import { defineAsyncComponent, nextTick } from 'vue';
import { trackMatomoEvent } from '@/matomo';

const ChatInterface = defineAsyncComponent(() => import('./ChatInterface.vue'));

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
    async openChatbot() {
      this.isOpen = true;
      trackMatomoEvent('chatbot', 'open', 'widget');
      await nextTick();
      this.$refs.closeButton?.focus();
    },

    async closeChatbot() {
      this.isOpen = false;
      await nextTick();
      this.$refs.triggerButton?.focus();
    },

    handleKeydown(event) {
      if (event.key === 'Escape' && this.isOpen) this.closeChatbot();
    },
  },
  mounted() {
    document.addEventListener('keydown', this.handleKeydown);
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
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

.chatbot-trigger:hover .lobster-icon {
  transform: rotate(-8deg);
}

@media (prefers-reduced-motion: reduce) {
  .chatbot-trigger,
  .lobster-icon,
  .fixed > div:last-child {
    transition: none;
    animation: none;
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
