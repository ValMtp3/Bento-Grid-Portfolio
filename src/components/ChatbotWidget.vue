Bento Grid Portfolio/src/components/ChatbotWidget.vue
<template>
  <div class="fixed bottom-4 right-4 z-50">
    <!-- Bouton d'ouverture -->
    <button
      v-if="!isOpen"
      @click="openChatbot"
      class="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105"
      :class="{ 'animate-pulse': isLoading }"
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

    <!-- Fenêtre du chatbot -->
    <div
      v-if="isOpen"
      class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 w-80 h-96 flex flex-col"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"
      >
        <h3 class="font-semibold text-gray-900 dark:text-white">Chatbot IA</h3>
        <button
          @click="closeChatbot"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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

      <!-- Conteneur du chatbot -->
      <div class="flex-1 p-4 overflow-hidden">
        <div id="chatbot-widget-container" class="h-full">
          <!-- Le chatbot sera injecté ici -->
        </div>
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
      isLoading: false,
      client: null,
      app: null,
    };
  },
  methods: {
    async openChatbot() {
      this.isOpen = true;
      this.isLoading = true;

      try {
        if (!this.client) {
          this.client = await Client.connect('ValMtp3/Chatbot_IA_CV');
          this.app = await this.client.view_api();
        }

        // Attendre que le DOM soit mis à jour
        await this.$nextTick();

        const container = document.getElementById('chatbot-widget-container');
        if (container && this.app) {
          // Vider le conteneur avant de rendre
          container.innerHTML = '';
          await this.app.render(container);
        }
      } catch (error) {
        console.error('Erreur lors de la connexion au chatbot:', error);
        const container = document.getElementById('chatbot-widget-container');
        if (container) {
          container.innerHTML = `
            <div class="flex items-center justify-center h-full text-red-500 text-center">
              <p class="text-sm mb-2">Erreur de connexion</p>
              <p class="text-xs">Réessayez plus tard</p>
            </div>
          `;
        }
      } finally {
        this.isLoading = false;
      }
    },

    closeChatbot() {
      this.isOpen = false;
    },
  },
};
</script>

<style scoped>
/* Animation d'ouverture */
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

/* Style pour le conteneur du chatbot */
#chatbot-widget-container {
  border-radius: 0.375rem;
  overflow: hidden;
}

/* Masquer les éléments Gradio non désirés dans le widget */
#chatbot-widget-container .gradio-container .wrap {
  padding: 0 !important;
}

#chatbot-widget-container .gradio-container .contain {
  padding: 0 !important;
}
</style>
