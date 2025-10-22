Bento Grid Portfolio/src/views/ChatbotView.vue
<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Chatbot IA</h1>
        <p class="text-gray-600 dark:text-gray-400">Discutez avec mon assistant IA intelligent</p>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <!-- Zone d'affichage de la conversation -->
        <div
          ref="chatContainer"
          class="h-[500px] overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900"
        >
          <div v-if="messages.length === 0" class="flex items-center justify-center h-full">
            <p class="text-gray-500 dark:text-gray-400">Envoyez un message pour commencer</p>
          </div>

          <div
            v-for="(msg, index) in messages"
            :key="index"
            class="flex"
            :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[70%] rounded-lg px-4 py-2"
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
              class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2"
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

        <!-- Zone de saisie -->
        <div class="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <form @submit.prevent="sendMessage" class="flex gap-2">
            <input
              v-model="userMessage"
              type="text"
              placeholder="Tapez votre message..."
              class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              :disabled="isLoading || !isConnected"
            />
            <button
              type="submit"
              :disabled="!userMessage.trim() || isLoading || !isConnected"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="!isLoading">Envoyer</span>
              <span v-else>...</span>
            </button>
          </form>

          <p v-if="error" class="mt-2 text-sm text-red-500">{{ error }}</p>
          <p v-if="!isConnected" class="mt-2 text-sm text-yellow-600 dark:text-yellow-500">
            Connexion au chatbot...
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Client } from '@gradio/client';

export default {
  name: 'ChatbotView',
  data() {
    return {
      client: null,
      isConnected: false,
      isLoading: false,
      userMessage: '',
      messages: [],
      error: null,
    };
  },
  async mounted() {
    await this.initializeChatbot();
  },
  methods: {
    async initializeChatbot() {
      try {
        this.client = await Client.connect('ValMtp3/Chatbot_IA_CV');
        this.isConnected = true;
        this.error = null;
      } catch (error) {
        console.error('Erreur lors de la connexion au chatbot:', error);
        this.error = 'Impossible de se connecter au chatbot. Veuillez réessayer plus tard.';
        this.isConnected = false;
      }
    },

    async sendMessage() {
      if (!this.userMessage.trim() || !this.isConnected || this.isLoading) return;

      const message = this.userMessage.trim();
      this.userMessage = '';

      // Ajouter le message de l'utilisateur
      this.messages.push({
        role: 'user',
        content: message,
      });

      this.isLoading = true;
      this.error = null;

      try {
        // Appeler l'API Gradio
        const result = await this.client.predict('/chat', {
          message: message,
        });

        // Extraire la réponse du chatbot
        let botResponse = '';
        if (result && result.data && result.data.length > 0) {
          botResponse = result.data[0];
        } else {
          botResponse = "Désolé, je n'ai pas pu générer une réponse.";
        }

        // Ajouter la réponse du bot
        this.messages.push({
          role: 'assistant',
          content: botResponse,
        });

        // Faire défiler vers le bas
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      } catch (error) {
        console.error("Erreur lors de l'envoi du message:", error);
        this.error = "Erreur lors de l'envoi du message. Veuillez réessayer.";

        // Retirer le message de l'utilisateur en cas d'erreur
        this.messages.pop();
      } finally {
        this.isLoading = false;
      }
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
