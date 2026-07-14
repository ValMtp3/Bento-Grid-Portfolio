<template>
  <div class="flex flex-col h-full bg-white dark:bg-coffee-bean-950 transition-colors duration-300">
    <!-- Zone de messages -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      :aria-busy="isLoading"
    >
      <div
        v-for="(message, index) in messages"
        :key="index"
        class="flex items-start gap-3 max-w-[85%]"
        :class="message.role === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : 'mr-auto'"
      >
        <!-- Avatar/Mascot if bot -->
        <div
          v-if="message.role === 'bot'"
          class="shrink-0 w-8 h-8 rounded-full bg-regal-navy-100 dark:bg-regal-navy-950 flex items-center justify-center text-lg border border-regal-navy-200 dark:border-regal-navy-800 shadow-sm animate-lobster select-none"
        >
          🦞
        </div>

        <div class="flex flex-col" :class="message.role === 'user' ? 'items-end' : 'items-start'">
          <div
            class="rounded-xl px-5 py-3 text-sm md:text-base shadow-sm transition-all duration-200"
            :class="[
              message.role === 'user'
                ? 'bg-regal-navy-500 text-white rounded-br-none dark:bg-regal-navy-700'
                : 'bg-gray-100 text-gray-800 rounded-bl-none dark:bg-coffee-bean-800 dark:text-soft-blush-100',
            ]"
          >
            <!-- Contenu du message -->
            <div
              v-if="message.role === 'bot'"
              class="markdown-content"
            >
              <MarkdownRender
                v-if="index > 0"
                mode="chat"
                :content="formatMarkdownLayout(message.content)"
                :final="message.final !== false"
                :smooth-streaming="false"
                html-policy="escape"
                :fade="false"
              />
              <span v-else>{{ message.content }}</span>
              <span
                v-if="message.final === false"
                class="streaming-cursor"
                aria-hidden="true"
              ></span>
            </div>
            <div v-else>{{ message.content }}</div>
          </div>

          <!-- Label auteur -->
          <span class="text-[10px] text-gray-400 dark:text-soft-blush-400 mt-1 px-1">
              {{ message.role === 'user' ? 'Vous' : 'Valentin Chatbot 🦞' }}
          </span>
        </div>
      </div>

      <!-- Indicateur de chargement -->
      <div v-if="isLoading && !isStreaming" class="flex items-start gap-3 max-w-[85%] mr-auto">
        <div
          class="shrink-0 w-8 h-8 rounded-full bg-regal-navy-100 dark:bg-regal-navy-950 flex items-center justify-center text-lg border border-regal-navy-200 dark:border-regal-navy-800 shadow-sm animate-lobster select-none"
        >
          🦞
        </div>
        <div class="flex flex-col items-start animate-pulse">
          <div
            class="bg-gray-100 dark:bg-coffee-bean-800 rounded-xl rounded-bl-none px-5 py-4 flex items-center space-x-2"
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
        <span class="text-xs text-gray-400 mt-1 px-1">Valentin Chatbot réfléchit...</span>
        </div>
      </div>
    </div>

    <!-- Zone de saisie -->
    <div class="p-4 bg-white dark:bg-coffee-bean-950 border-t border-gray-100 dark:border-coffee-bean-800/60">
      <!-- Widget Turnstile -->
      <div ref="turnstileContainer" class="mb-2 flex justify-center" v-show="!turnstileToken"></div>

      <form @submit.prevent="sendMessage" class="relative flex items-center">
        <input
          v-model="userInput"
          aria-label="Votre message"
          type="text"
          placeholder="Posez votre question..."
          :disabled="isLoading || !turnstileToken"
          class="w-full rounded-md border border-[#e0e0e0] dark:border-coffee-bean-700 bg-white dark:bg-coffee-bean-900/60 py-3 pl-6 pr-14 text-base font-medium text-[#6B7280] dark:text-soft-blush-100 outline-none focus:border-regal-navy-700 dark:focus:border-regal-navy-400 focus:shadow-md transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
        />

        <button
          type="submit"
          :disabled="!userInput.trim() || isLoading || !turnstileToken"
          class="absolute right-2 p-2 rounded-none bg-regal-navy-500 hover:bg-regal-navy-600 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
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
        <p v-if="!turnstileToken" class="text-[10px] text-amber-500 dark:text-amber-400">
          Veuillez compléter la vérification de sécurité pour envoyer un message.
        </p>
        <p class="text-[10px] text-gray-400 dark:text-soft-blush-400">
          L'IA peut faire des erreurs. Vérifiez les informations importantes.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, computed, defineAsyncComponent } from 'vue';
import { loadTurnstile } from '@/turnstile';
import { trackMatomoEvent } from '@/matomo';

const MarkdownRender = defineAsyncComponent(() => import('markstream-vue'));

const props = defineProps({
  initialMessage: {
    type: String,
    default:
      "Bonjour ! Je suis Valentin Chatbot 🦞, l'assistant virtuel de Valentin. Je peux répondre à vos questions sur son parcours, ses projets et ses compétences. Que souhaitez-vous savoir ?",
  },
});

const messages = ref([{ role: 'bot', content: props.initialMessage, final: true }]);
const userInput = ref('');
const isLoading = ref(false);
const isStreaming = ref(false);
const messagesContainer = ref(null);
const turnstileToken = ref(null);
const turnstileContainer = ref(null);
const hasTrackedFirstMessage = ref(false);

const SPACE_URL = 'https://valmtp3-chatbot-ia-cv.hf.space';
const CHATBOT_API_URL = `${SPACE_URL}/gradio_api/call/generate_response`;
const CHATBOT_TIMEOUT_MS = 90000;
const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1' || 
   window.location.hostname.startsWith('192.168.'));

const TURNSTILE_SITE_KEY = isLocal 
  ? '1x00000000000000000000AA' 
  : (import.meta.env.VITE_TURNSTILE_SITE_KEY || 'YOUR_SITE_KEY');

onMounted(async () => {
  void scrollToBottom();
  initTurnstile();
});

const initTurnstile = async () => {
  try {
    const turnstile = await loadTurnstile();
    if (turnstileContainer.value) {
      turnstile.render(turnstileContainer.value, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'auto',
        callback: (token) => {
          turnstileToken.value = token;
        },
        'expired-callback': () => {
          turnstileToken.value = null;
        },
        'error-callback': () => {
          turnstileToken.value = null;
        },
      });
    }
  } catch (error) {
    console.warn('Turnstile:', error.message);
  }
};

// Format attendu par le Space : [[user_msg1, bot_msg1], ...]
const history = computed(() => {
  const chatHistory = [];
  let currentPair = [];

  messages.value.forEach((message) => {
    if (message.role === 'user') {
      currentPair = [message.content, null];
    } else if (message.role === 'bot' && currentPair.length === 1) {
      currentPair[1] = message.content;
      chatHistory.push(currentPair);
      currentPair = [];
    }
  });

  return chatHistory;
});

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const formatMarkdownLayout = (text) =>
  text.replace(
    /\n(?=\s*\*\*[^*\n]{2,80}\*\*(?:\s*[,.:]|$))/g,
    '\n\n',
  );

const parseGradioEvent = (eventBlock) => {
  const lines = eventBlock.split(/\r?\n/);
  const event = lines.find((line) => line.startsWith('event:'))?.slice(6).trim();
  const dataText = lines
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trimStart())
    .join('\n');

  if (event === 'error') {
    throw new Error('Erreur retournée par le Space Hugging Face');
  }

  if (!dataText || (event !== 'generating' && event !== 'complete')) {
    return { event, response: null };
  }

  const data = JSON.parse(dataText);
  const response = Array.isArray(data) ? data[0] : data;

  return {
    event,
    response: typeof response === 'string' ? response : null,
  };
};

const createTextSmoother = (onDisplay) => {
  const START_RESERVE = 120;
  const STREAM_RESERVE = 48;
  const TICK_MS = 20;
  let target = '';
  let displayedLength = 0;
  let timerId = null;
  let isComplete = false;
  let isCancelled = false;
  let resolveFinished;
  const finished = new Promise((resolve) => {
    resolveFinished = resolve;
  });

  const scheduleTick = () => {
    if (!timerId && !isCancelled) {
      timerId = window.setTimeout(tick, TICK_MS);
    }
  };

  const tick = () => {
    timerId = null;
    if (isCancelled) return;

    const remaining = target.length - displayedLength;
    if (remaining <= 0) {
      if (isComplete) {
        resolveFinished();
      }
      return;
    }

    if (!isComplete && displayedLength === 0 && target.length < START_RESERVE) {
      return;
    }

    const available = isComplete ? remaining : Math.max(0, remaining - STREAM_RESERVE);
    if (available <= 0) return;

    const step = remaining > 180 ? 4 : remaining > 80 ? 3 : remaining > 30 ? 2 : 1;
    displayedLength += Math.min(step, available);

    // Ne coupe pas un emoji entre ses deux unités UTF-16.
    const lastCodeUnit = target.charCodeAt(displayedLength - 1);
    if (lastCodeUnit >= 0xd800 && lastCodeUnit <= 0xdbff) {
      displayedLength += 1;
    }

    onDisplay(target.slice(0, displayedLength));
    scheduleTick();
  };

  return {
    push(value) {
      target = value;
      scheduleTick();
    },
    async finish() {
      isComplete = true;
      scheduleTick();
      await finished;
    },
    cancel() {
      isCancelled = true;
      window.clearTimeout(timerId);
      timerId = null;
      resolveFinished();
    },
  };
};

const fetchChatbotResponse = async (message, chatHistory, onUpdate) => {
  const controller = new AbortController();
  let timeoutId;

  const resetTimeout = () => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => controller.abort(), CHATBOT_TIMEOUT_MS);
  };

  resetTimeout();

  try {
    const submitResponse = await fetch(CHATBOT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [message, chatHistory],
      }),
      signal: controller.signal,
    });

    if (!submitResponse.ok) {
      const error = new Error(`Erreur HTTP ${submitResponse.status}`);
      error.status = submitResponse.status;
      throw error;
    }

    const { event_id: eventId } = await submitResponse.json();
    if (!eventId) {
      throw new Error('Identifiant de réponse manquant');
    }

    const resultResponse = await fetch(`${CHATBOT_API_URL}/${eventId}`, {
      signal: controller.signal,
    });

    if (!resultResponse.ok) {
      const error = new Error(`Erreur HTTP ${resultResponse.status}`);
      error.status = resultResponse.status;
      throw error;
    }

    if (!resultResponse.body) {
      throw new Error('Streaming indisponible dans ce navigateur');
    }

    const reader = resultResponse.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let finalResponse = '';
    let isComplete = false;

    const processEvent = (eventBlock) => {
      const { event, response } = parseGradioEvent(eventBlock);
      if (
        typeof response === 'string' &&
        response.trim()
      ) {
        finalResponse = response;
        onUpdate(response);
      }
      if (event === 'complete') {
        isComplete = true;
      }
    };

    while (!isComplete) {
      const { value, done } = await reader.read();
      if (done) break;

      resetTimeout();
      buffer += decoder.decode(value, { stream: true });
      const eventBlocks = buffer.split(/\r?\n\r?\n/);
      buffer = eventBlocks.pop() ?? '';
      for (const eventBlock of eventBlocks.filter(Boolean)) {
        processEvent(eventBlock);
      }
    }

    buffer += decoder.decode();
    if (buffer.trim()) {
      processEvent(buffer.trim());
    }

    if (!isComplete) {
      throw new Error('Réponse incomplète du Space Hugging Face');
    }
    if (!finalResponse.trim()) {
      throw new Error('Réponse vide');
    }

    return finalResponse;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Le chatbot met trop longtemps à répondre.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

const sendMessage = async () => {
  const text = userInput.value.trim();
  if (!text || isLoading.value) return;

  if (!turnstileToken.value) {
    messages.value.push({
      role: 'bot',
      content: "Veuillez compléter la vérification de sécurité avant d'envoyer un message.",
    });
    await scrollToBottom();
    return;
  }

  messages.value.push({ role: 'user', content: text });
  if (!hasTrackedFirstMessage.value) {
    hasTrackedFirstMessage.value = trackMatomoEvent('chatbot', 'first_message', 'widget');
  }
  userInput.value = '';
  isLoading.value = true;
  await scrollToBottom();

  let botMessage = null;
  const currentHistory = history.value;
  const smoother = createTextSmoother((displayedResponse) => {
    if (!botMessage) {
      botMessage = reactive({ role: 'bot', content: '', final: false });
      messages.value.push(botMessage);
      isStreaming.value = true;
    }
    botMessage.content = displayedResponse;
    void scrollToBottom();
  });

  try {
    await fetchChatbotResponse(text, currentHistory, (partialResponse) => {
      smoother.push(partialResponse);
    });
    await smoother.finish();
  } catch (error) {
    smoother.cancel();
    console.error('Erreur Chatbot:', error);
    const errorType = error.status === 503
      ? 'cold_start'
      : error.message === 'Le chatbot met trop longtemps à répondre.'
        ? 'timeout'
        : 'request_failure';
    trackMatomoEvent('chatbot', 'error', errorType);
    let errorMsg = 'Désolé, une erreur est survenue lors de la connexion.';

    if (error.status === 503) {
      errorMsg = 'Le serveur démarre (Cold Boot). Veuillez réessayer dans quelques secondes.';
    } else if (error.message === 'Le chatbot met trop longtemps à répondre.') {
      errorMsg = 'Le chatbot met trop longtemps à répondre. Veuillez réessayer dans quelques instants.';
    }

    if (botMessage) {
      botMessage.content = errorMsg;
      botMessage.final = true;
    } else {
      messages.value.push({ role: 'bot', content: errorMsg, final: true });
    }
  } finally {
    if (botMessage) {
      botMessage.final = true;
    }
    isLoading.value = false;
    isStreaming.value = false;
    await scrollToBottom();
  }
};
</script>

<style scoped>
/* Typographie des réponses Markdown, finales comme progressives */
.markdown-content {
  min-width: 0;
  line-height: 1.65;
  overflow-wrap: anywhere;
}

.markdown-content :deep(p) {
  margin: 0 0 0.85rem;
}

.markdown-content :deep(.markdown-renderer > .node-slot:last-of-type p:last-child) {
  margin-bottom: 0;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4) {
  margin: 1.15rem 0 0.55rem;
  color: inherit;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  line-height: 1.25;
}

.markdown-content :deep(h1:first-child),
.markdown-content :deep(h2:first-child),
.markdown-content :deep(h3:first-child),
.markdown-content :deep(h4:first-child) {
  margin-top: 0;
}

.markdown-content :deep(h1) { font-size: 1.2em; }
.markdown-content :deep(h2) { font-size: 1.12em; }
.markdown-content :deep(h3),
.markdown-content :deep(h4) { font-size: 1.04em; }

.markdown-content :deep(a) {
  color: #2563eb;
  font-weight: 600;
  text-decoration: underline;
  text-decoration-thickness: 0.08em;
  text-underline-offset: 0.18em;
}

.markdown-content :deep(a:hover) {
  color: #1d4ed8;
}

.dark .markdown-content :deep(a) {
  color: #93c5fd;
}

.dark .markdown-content :deep(a:hover) {
  color: #bfdbfe;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 0.35rem 0 0.9rem;
  padding-left: 1.4rem;
}

.markdown-content :deep(ul) {
  list-style-type: disc;
}

.markdown-content :deep(ol) {
  list-style-type: decimal;
}

.markdown-content :deep(li) {
  margin: 0.3rem 0;
  padding-left: 0.15rem;
}

.markdown-content :deep(li::marker) {
  color: #64748b;
  font-weight: 700;
}

.dark .markdown-content :deep(li::marker) {
  color: #cbd5e1;
}

.markdown-content :deep(li > ul),
.markdown-content :deep(li > ol) {
  margin: 0.3rem 0 0.2rem;
}

.markdown-content :deep(strong) {
  color: inherit;
  font-weight: 700;
}

.markdown-content :deep(blockquote) {
  margin: 0.85rem 0;
  padding: 0.65rem 0.85rem;
  border-left: 3px solid #94a3b8;
  background: rgba(148, 163, 184, 0.12);
  color: #475569;
}

.markdown-content :deep(blockquote p:last-child) {
  margin-bottom: 0;
}

.dark .markdown-content :deep(blockquote) {
  border-left-color: #64748b;
  background: rgba(148, 163, 184, 0.08);
  color: #cbd5e1;
}

.markdown-content :deep(code) {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 0.14rem 0.35rem;
  border-radius: 0.3rem;
  font-family: 'Intel One Mono', monospace;
  font-size: 0.88em;
}

.dark .markdown-content :deep(code) {
  background-color: rgba(255, 255, 255, 0.1);
}

.markdown-content :deep(pre) {
  margin: 0.85rem 0 1rem;
  padding: 0.9rem 1rem;
  background-color: #1e293b;
  color: #f1f5f9;
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 0.65rem;
  overflow-x: auto;
  line-height: 1.55;
}

.markdown-content :deep(pre code) {
  padding: 0;
  background: transparent;
  border-radius: 0;
  color: inherit;
  font-size: 0.84em;
}

.markdown-content :deep(hr) {
  margin: 1rem 0;
  border: 0;
  border-top: 1px solid rgba(100, 116, 139, 0.3);
}

.markdown-content :deep(table) {
  display: block;
  width: 100%;
  margin: 0.85rem 0 1rem;
  overflow-x: auto;
  border-collapse: collapse;
  font-size: 0.9em;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  padding: 0.5rem 0.65rem;
  border: 1px solid rgba(100, 116, 139, 0.3);
  text-align: left;
  vertical-align: top;
}

.markdown-content :deep(th) {
  background: rgba(148, 163, 184, 0.14);
  font-weight: 700;
}

.streaming-cursor {
  display: inline-block;
  width: 0.12em;
  height: 1em;
  margin-left: 0.12em;
  vertical-align: -0.12em;
  background: currentColor;
  animation: cursorBlink 0.9s steps(2, start) infinite;
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
  background-color: rgba(156, 163, 175, 0.3);
}

@keyframes wiggleSlow {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-8deg); }
  75% { transform: rotate(8deg); }
}

@keyframes cursorBlink {
  50% { opacity: 0; }
}

.animate-lobster {
  animation: wiggleSlow 2.5s ease-in-out infinite;
}

@media (max-width: 480px) {
  .markdown-content {
    line-height: 1.58;
  }

  .markdown-content :deep(p) {
    margin-bottom: 0.72rem;
  }

  .markdown-content :deep(ul),
  .markdown-content :deep(ol) {
    padding-left: 1.2rem;
  }

  .markdown-content :deep(pre) {
    margin-inline: -0.25rem;
    padding: 0.75rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .animate-lobster {
    animation: none;
  }

  .streaming-cursor {
    animation: none;
  }
}
</style>
