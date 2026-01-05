<template>
  <div class="fixed bottom-4 right-4 z-50">
    <button
      v-if="!isOpen"
      @click="openChatbot"
      class="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105"
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
      class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 w-96 h-[500px] flex flex-col"
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

      <div
        ref="chatContainer"
        class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900"
      >
        <div
          v-if="messages.length === 0 && !connectionError"
          class="flex items-center justify-center h-full"
        >
          <p class="text-gray-500 dark:text-gray-400 text-sm">Envoyez un message pour commencer</p>
        </div>

        <div v-if="connectionError" class="flex items-center justify-center h-full">
          <div class="text-center text-red-500">
            <p class="text-sm mb-2">Erreur de connexion</p>
            <p class="text-xs">Réessayez plus tard</p>
          </div>
        </div>

        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="flex"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-[80%] rounded-lg px-3 py-2 text-sm"
            :class="
              msg.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
            "
          >
            <p class="whitespace-pre-wrap">{{ msg.content }}</p>
          </div>
        </div>

        <div v-if="isLoading" class="flex justify-start">
          <div
            class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2"
          >
            <div class="flex space-x-2">
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div
                class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style="animation-delay: 0.1s"
              ></div>
              <div
                class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style="animation-delay: 0.2s"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800">
        <form @submit.prevent="sendMessage" class="flex gap-2">
          <input
            v-model="userMessage"
            type="text"
            placeholder="Tapez votre message..."
            class="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            :disabled="isLoading || !isConnected"
          />
          <button
            type="submit"
            :disabled="!userMessage.trim() || isLoading || !isConnected"
            class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="!isLoading">→</span>
            <span v-else>...</span>
          </button>
        </form>

        <p
          v-if="!isConnected && !connectionError"
          class="mt-2 text-xs text-yellow-600 dark:text-yellow-500"
        >
          Connexion...
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { Client } from '@gradio/client';

export default {
  name: 'ChatbotWidget',
  data() {
    return {
      isOpen: false,
      isConnected: false,
      isLoading: false,
      connectionError: false,
      client: null,
      userMessage: '',
      messages: [],
    };
  },
  methods: {
    async openChatbot() {
      this.isOpen = true;

      if (!this.client && !this.connectionError) {
        await this.initializeChatbot();
      }
    },

    async initializeChatbot() {
      try {
        this.client = await Client.connect('ValMtp3/Chatbot_IA_CV');
        this.isConnected = true;
        this.connectionError = false;
      } catch (error) {
        console.error('Erreur lors de la connexion au chatbot:', error);
        this.connectionError = true;
        this.isConnected = false;
      }
    },

    async sendMessage() {
      if (!this.userMessage.trim() || !this.isConnected || this.isLoading) return;

      const message = this.userMessage.trim();
      this.userMessage = '';

      this.messages.push({
        role: 'user',
        content: message,
      });

      this.isLoading = true;

      try {
        console.log('Sending message:', message);
        const result = await this.client.predict('/chat', {
          message: message,
        });
        console.log('Result received:', result);

        let botResponse = '';
        if (result && result.data && result.data.length > 0) {
          botResponse = result.data[0];
        } else {
          botResponse = "Désolé, je n'ai pas pu générer une réponse.";
        }
        console.log('Bot response:', botResponse);

        this.messages.push({
          role: 'assistant',
          content: botResponse,
        });

        this.$nextTick(() => {
          this.scrollToBottom();
        });
      } catch (error) {
        console.error("Erreur lors de l'envoi du message:", error);
        this.messages.push({
          role: 'assistant',
          content: "Erreur lors de l'envoi du message. Veuillez réessayer.",
        });
      } finally {
        console.log('Loading finished');
        this.isLoading = false;
      }
    },

    closeChatbot() {
      this.isOpen = false;
    },

    scrollToBottom() {
      const container = this.$refs.chatContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
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
