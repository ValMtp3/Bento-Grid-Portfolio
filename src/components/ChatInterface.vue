```Bento Grid Portfolio/src/components/ChatInterface.vue
<template>
  <div class="flex flex-col h-full bg-white dark:bg-gray-800 transition-colors duration-300">
    <!-- Zone de messages -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
      <div
        v-for="(message, index) in messages"
        :key="index"
        class="flex flex-col"
        :class="message.role === 'user' ? 'items-end' : 'items-start'"
      >
        <div
          class="max-w-[85%] rounded-2xl px-5 py-3 text-sm md:text-base shadow-sm transition-all duration-200"
          :class="[
            message.role === 'user'
              ? 'bg-blue-500 text-white rounded-br-none dark:bg-blue-600'
              : 'bg-gray-100 text-gray-800 rounded-bl-none dark:bg-gray-700 dark:text-gray-100',
          ]"
        >
          <!-- Contenu du message -->
          <div
            v-if="message.role === 'bot'"
            class="markdown-content"
            v-html="renderMarkdown(message.content)"
          ></div>
          <div v-else>{{ message.content }}</div>
        </div>

        <!-- Label auteur (optionnel, pour plus de clarté) -->
        <span class="text-xs text-gray-400 mt-1 px-1">
          {{ message.role === 'user' ? 'Vous' : 'IA' }}
        </span>
      </div>

      <!-- Indicateur de chargement -->
      <div v-if="isLoading" class="flex flex-col items-start animate-pulse">
        <div
          class="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-none px-5 py-4 flex items-center space-x-2"
        >
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div
            class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style="animation-delay: 0.2s"
          ></div>
          <div
            class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style="animation-delay: 0.4s"
          ></div>
        </div>
        <span class="text-xs text-gray-400 mt-1 px-1">IA réfléchit...</span>
      </div>
    </div>

    <!-- Zone de saisie -->
    <div class="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
      <form @submit.prevent="sendMessage" class="relative flex items-center">
        <input
          v-model="userInput"
          type="text"
          placeholder="Posez votre question..."
          :disabled="isLoading"
          class="w-full rounded-xl border border-[#e0e0e0] dark:border-gray-600 bg-white dark:bg-gray-800 py-3 pl-6 pr-14 text-base font-medium text-[#6B7280] dark:text-white outline-none focus:border-blue-900 dark:focus:border-blue-500 focus:shadow-md dark:focus:shadow-dark-md transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
        />

        <button
          type="submit"
          :disabled="!userInput.trim() || isLoading"
          class="absolute right-2 p-2 rounded-lg bg-blue-400 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          aria-label="Envoyer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="w-5 h-5"
          >
            <path
              d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"
            />
          </svg>
        </button>
      </form>
      <div class="text-center mt-2">
        <p class="text-[10px] text-gray-400 dark:text-gray-500">
          L'IA peut faire des erreurs. Vérifiez les informations importantes.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue';
import { Client } from '@gradio/client';
import { marked } from 'marked';

const props = defineProps({
  initialMessage: {
    type: String,
    default:
      "Bonjour ! Je suis l'assistant virtuel de Valentin. Je peux répondre à vos questions sur son parcours, ses projets et ses compétences. Que souhaitez-vous savoir ?",
  },
});

const messages = ref([{ role: 'bot', content: props.initialMessage }]);
const userInput = ref('');
const isLoading = ref(false);
const messagesContainer = ref(null);
let client = null;

const SPACE_URL = 'https://valmtp3-chatbot-ia-cv.hf.space';

// Connexion initiale (lazy)
onMounted(async () => {
  scrollToBottom();
});

// Construction de l'historique pour l'API
// Format: [[user_msg1, bot_msg1], [user_msg2, bot_msg2], ...]
const history = computed(() => {
  const h = [];
  let currentPair = [];

  // On ignore le tout premier message de bienvenue s'il n'y a pas d'échange précédent
  // Mais pour simplifier, on reconstruit les paires user/bot existantes
  messages.value.forEach((msg) => {
    if (msg.role === 'user') {
      currentPair = [msg.content, null];
    } else if (msg.role === 'bot' && currentPair.length === 1) {
      currentPair[1] = msg.content;
      h.push(currentPair);
      currentPair = [];
    }
  });

  return h;
});

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const renderMarkdown = (text) => {
  try {
    return marked.parse(text);
  } catch {
    return text;
  }
};

const sendMessage = async () => {
  const text = userInput.value.trim();
  if (!text || isLoading.value) return;

  // Sauvegarde de l'historique AVANT l'ajout du message actuel
  // car l'API attend (message, history) où history est le passé.
  const currentHistory = history.value;

  // Ajout immédiat message utilisateur
  messages.value.push({ role: 'user', content: text });
  userInput.value = '';
  isLoading.value = true;
  await scrollToBottom();

  try {
    if (!client) {
      client = await Client.connect(SPACE_URL);
    }

    // Appel API
    // Signature: app.predict("/chat", [message, history])
    const result = await client.predict('/chat', [text, currentHistory]);

    if (result.data && result.data.length > 0) {
      messages.value.push({ role: 'bot', content: result.data[0] });
    } else {
      throw new Error('Réponse vide');
    }
  } catch (error) {
    console.error('Erreur Chatbot:', error);
    let errorMsg = 'Désolé, une erreur est survenue lors de la connexion.';

    if (error.status === 503) {
      errorMsg = 'Le serveur démarre (Cold Boot). Veuillez réessayer dans quelques secondes.';
    }

    messages.value.push({
      role: 'bot',
      content: errorMsg,
    });
  } finally {
    isLoading.value = false;
    await scrollToBottom();
  }
};
</script>

<style scoped>
/* Styles spécifiques pour le contenu Markdown généré */
.markdown-content :deep(p) {
  margin-bottom: 0.5rem;
}
.markdown-content :deep(p:last-child) {
  margin-bottom: 0;
}
.markdown-content :deep(a) {
  color: #3b82f6;
  text-decoration: underline;
}
.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-left: 1.2rem;
  margin-bottom: 0.5rem;
  list-style-type: disc;
}
.markdown-content :deep(strong) {
  font-weight: 600;
}
.markdown-content :deep(code) {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 0.1rem 0.3rem;
  border-radius: 0.2rem;
  font-family: monospace;
  font-size: 0.9em;
}
.dark .markdown-content :deep(code) {
  background-color: rgba(255, 255, 255, 0.1);
}
.markdown-content :deep(pre) {
  background-color: #1e293b;
  color: #f1f5f9;
  padding: 0.75rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 0.5rem;
}

/* Custom Scrollbar pour Webkit */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 20px;
}
.dark ::-webkit-scrollbar-thumb {
  background-color: rgba(75, 85, 99, 0.5);
}
</style>
