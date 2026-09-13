<template>
  <div class="flex h-full min-h-0 flex-col bg-soft-blush-50 dark:bg-coffee-bean-950">
    <!-- En-tete de la page dediee. Le widget flottant a deja la sienne, dans
         ChatbotWidget.vue : la redoubler ferait deux bandeaux empiles. -->
    <header
      v-if="variant === 'page'"
      class="flex items-center gap-3 border-b border-coffee-bean-100 px-4 py-3 dark:border-soft-blush-50/10"
    >
      <span
        class="chat-avatar flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-spicy-paprika-200 bg-spicy-paprika-50 text-lg dark:border-spicy-paprika-700/60 dark:bg-spicy-paprika-950/40"
        aria-hidden="true"
      >
        🦞
      </span>

      <div class="min-w-0 flex-1">
        <p class="font-heading text-sm font-bold text-regal-navy-700 dark:text-regal-navy-300">
          Valentin Chatbot
        </p>
        <p
          class="truncate font-code text-[10px] uppercase tracking-[0.18em] text-coffee-bean-600 dark:text-soft-blush-300"
        >
          $ assistant du portfolio
        </p>
      </div>

      <!-- L'etat affiche est l'etat reel du composant, pas une pastille
           decorative toujours verte. -->
      <p
        class="flex shrink-0 items-center gap-2 font-code text-[10px] uppercase tracking-[0.18em]"
        :class="
          isStreaming
            ? 'text-spicy-paprika-600 dark:text-spicy-paprika-300'
            : 'text-regal-navy-600 dark:text-regal-navy-400'
        "
      >
        <!-- Meme respiration que dans la bulle d'attente, cote a cote avec le
             fil : l'en-tete et la reponse en cours battent au meme rythme. -->
        <span v-if="isStreaming" class="flex items-center gap-[3px]" aria-hidden="true">
          <span class="breath-dot h-1.5 w-1.5 bg-spicy-paprika-500 dark:bg-spicy-paprika-300"></span>
          <span class="breath-dot h-1.5 w-1.5 bg-spicy-paprika-500 dark:bg-spicy-paprika-300"></span>
          <span class="breath-dot h-1.5 w-1.5 bg-spicy-paprika-500 dark:bg-spicy-paprika-300"></span>
        </span>
        <span v-else class="h-2 w-2 bg-green-500" aria-hidden="true"></span>
        {{ isStreaming ? 'répond' : 'prêt' }}
      </p>
    </header>

    <!-- deep-chat vit dans un shadow DOM : son habillage vient de buildChatStyles,
         pas des classes Tailwind. La cle force sa reconstruction au changement de
         theme, car sa feuille de style interne n'est posee qu'une fois.

         Le conteneur intermediaire n'est pas decoratif : deep-chat naît en
         350x320 px fixes, et sa hauteur interne est heritee de l'element. Lui
         donner 100% d'une boite dont le flex a deja fixe la hauteur est la
         seule facon d'obtenir un chat qui remplit la place sans deborder. -->
    <div class="min-h-0 flex-1">
      <deep-chat ref="chatElement" :key="chatKey">
        <div v-if="hasSuggestions" style="display: none">
          <div class="chat-intro">
            <div class="chat-intro-lobster" aria-hidden="true">🦞</div>
            <div class="chat-intro-label">$ assistant du portfolio</div>
            <div class="chat-intro-text">{{ initialMessage }}</div>
            <!-- Les suggestions entrent l'une apres l'autre, comme les cellules
                 du bento sur la page d'accueil. -->
            <div
              v-for="question in SUGGESTED_QUESTIONS"
              :key="question"
              class="chat-intro-suggestion"
            >
              <span class="chat-intro-arrow">→</span>
              <span class="chat-intro-suggestion-text">{{ question }}</span>
            </div>
          </div>
        </div>
      </deep-chat>
    </div>

    <!-- Verification Cloudflare en mode discret : le cadre n'apparait que si un
         defi est reellement demande au visiteur. -->
    <div ref="turnstileContainer" class="flex justify-center empty:hidden"></div>

    <div
      class="flex items-center gap-3 border-t border-coffee-bean-100 px-3 py-2 dark:border-soft-blush-50/10"
      :class="variant === 'page' ? 'justify-between' : 'justify-center'"
    >
      <div v-if="variant === 'page'" class="flex shrink-0 items-center gap-2">
        <button type="button" class="chat-action" :disabled="!hasAnswer" @click="copyLastAnswer">
          <Icon :icon="copyIcon" class="chat-action-icon" aria-hidden="true" />
          <span>{{ copyLabel }}</span>
        </button>
        <button type="button" class="chat-action" @click="startNewConversation">
          <Icon icon="mdi:refresh" class="chat-action-icon" aria-hidden="true" />
          <span class="hidden sm:inline">Nouvelle conversation</span>
          <span class="sm:hidden">Effacer</span>
        </button>
      </div>

      <p
        class="min-w-0 font-code text-[10px] leading-tight text-coffee-bean-500 dark:text-soft-blush-400"
        :class="variant === 'page' ? 'text-right' : 'text-center'"
      >
        <span class="hidden sm:inline">L'IA peut faire des erreurs. Vérifiez les informations importantes.</span>
        <span class="sm:hidden">L'IA peut se tromper.</span>
      </p>
    </div>

    <!-- Les changements d'etat sont annonces aux lecteurs d'ecran, qui ne voient
         pas le texte du bouton changer. -->
    <p class="sr-only" role="status" aria-live="polite">{{ statusMessage }}</p>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Icon } from '@iconify/vue';
import 'deep-chat';

import { createChatHandler } from '@/chatbot/handler';
import { createModelTagElement, MODEL_TAG_CLASS } from '@/chatbot/modelTag';
import { buildChatStyles, buildIntroPanelStyles } from '@/chatbot/styles';
import { trackMatomoEvent } from '@/matomo';
import { DARK, resolvedTheme } from '@/theme';
import { removeTurnstile, renderTurnstile } from '@/turnstile';

const DEFAULT_INITIAL_MESSAGE =
  "Bonjour ! Je suis Valentin Chatbot 🦞, l'assistant virtuel de Valentin. Je peux répondre à vos questions sur son parcours, ses projets et ses compétences. Que souhaitez-vous savoir ?";

const SUGGESTED_QUESTIONS = [
  'Quel est ton parcours ?',
  'Sur quels projets as-tu travaillé ?',
  'Quelles technos maitrises-tu ?',
];

// Le bouton de copie porte trois etats, chacun avec son libelle et son icone.
// Les deduire d'un seul etat evite que le texte et l'icone se desynchronisent.
const COPY_STATES = {
  idle: { label: 'Copier', icon: 'mdi:content-copy' },
  done: { label: 'Copié', icon: 'mdi:check' },
  failed: { label: 'Échec', icon: 'mdi:alert-circle-outline' },
};
const COPY_FEEDBACK_MS = 2000;

const props = defineProps({
  initialMessage: { type: String, default: DEFAULT_INITIAL_MESSAGE },
  variant: {
    type: String,
    default: 'page',
    validator: (value) => ['page', 'widget'].includes(value),
  },
});

const chatElement = ref(null);
const turnstileContainer = ref(null);
const turnstileToken = ref(null);
const chatKey = ref(0);
const copyState = ref('idle');
const statusMessage = ref('');
const hasAnswer = ref(false);

const isStreaming = ref(false);

let themeChangeIsPending = false;
let copyFeedbackTimer = null;
let hasTrackedFirstMessage = false;
// Interrompt la reponse en cours d'ecriture, s'il y en a une. Renseigne par le
// handler au debut de chaque echange, remis a null a la fin.
let stopActiveAnswer = null;
// Promesse du montage Turnstile, gardee pour pouvoir liberer le widget.
let turnstileRender = null;
// Un nom de modele par reponse produite, dans l'ordre du fil, et `null` quand
// le Space n'a rien signe (une erreur, par exemple). Chaque echange ajoute
// exactement une entree : c'est ce qui permet de retrouver la bulle de chaque
// etiquette apres une reconstruction du composant.
let answerModels = [];
let currentAnswerModel = null;
// Change a chaque « Nouvelle conversation » : une reponse commencee avant
// l'effacement ne doit pas venir ajouter son etiquette apres coup.
let conversationId = 0;
let modelTagsFrame = null;

const hasSuggestions = computed(() => props.variant === 'page');
const copyLabel = computed(() => COPY_STATES[copyState.value].label);
const copyIcon = computed(() => COPY_STATES[copyState.value].icon);

// Le panneau d'accueil est habille par styles.js, comme le reste du composant.
// Seul le clic reste ici : lui seul a besoin de l'element deep-chat pour poser
// la question a sa place.
const introPanelStyles = (isDark) => {
  const styles = buildIntroPanelStyles(isDark);

  return {
    ...styles,
    'chat-intro-suggestion': {
      ...styles['chat-intro-suggestion'],
      events: {
        click: (event) => {
          // Le libelle seul : la fleche decorative ne doit pas partir dans la
          // question envoyee au modele.
          const label = event.currentTarget.querySelector('.chat-intro-suggestion-text');
          const text = label?.textContent?.trim();
          if (text) chatElement.value?.submitUserMessage({ text });
        },
      },
    },
  };
};

// Le curseur clignotant s'appuie sur cette classe : elle marque la periode ou
// une reponse est en train de s'ecrire.
const setStreamingClass = (isActive) => {
  isStreaming.value = isActive;
  chatElement.value?.classList.toggle('streaming', isActive);
};

const handleChatRequest = createChatHandler({
  getTurnstileToken: () => turnstileToken.value,
  onError: (kind) => trackMatomoEvent('chatbot', 'error', kind),
  onModel: (model) => {
    currentAnswerModel = model;
  },
});

// Pose l'etiquette du modele sous les reponses qui en portent une.
//
// Les etiquettes sont alignees par la FIN du fil : la derniere reponse produite
// correspond a la derniere bulle. Compter depuis le debut supposerait de savoir
// si le message d'accueil occupe une bulle, ce qui change d'une variante a
// l'autre. La pose est sans effet si l'etiquette est deja la, ce qui permet de
// rappeler cette fonction sans precaution.
const applyModelTags = () => {
  const shadow = chatElement.value?.shadowRoot;
  if (!shadow) return;

  // La bulle d'attente partage la classe des reponses : elle est ecartee, sans
  // quoi l'etiquette se poserait sous les trois points.
  const bubbles = shadow.querySelectorAll(
    '.ai-message-text:not(.deep-chat-loading-message-bubble)',
  );
  const offset = bubbles.length - answerModels.length;

  answerModels.forEach((model, index) => {
    const bubble = bubbles[offset + index];
    if (!model || !bubble || bubble.querySelector(`.${MODEL_TAG_CLASS}`)) return;
    bubble.appendChild(createModelTagElement(model));
  });
};

// deep-chat finit d'ecrire la bulle dans la foulee de la derniere reponse : on
// attend l'image suivante pour poser l'etiquette dans un DOM stabilise.
const scheduleModelTags = () => {
  if (modelTagsFrame !== null) return;
  modelTagsFrame = globalThis.requestAnimationFrame(() => {
    modelTagsFrame = null;
    applyModelTags();
  });
};

const configureChat = (previousMessages = []) => {
  const element = chatElement.value;
  if (!element) return;

  const isDark = resolvedTheme.value === DARK;

  // `style` est la propriete CSS standard de l'element, pas une propriete de
  // deep-chat : elle se remplit champ par champ. Le reste se pose directement
  // sur l'element, comme attendu par un composant web.
  const { style, ...chatProperties } = buildChatStyles({ isDark, variant: props.variant });
  Object.assign(element.style, style);
  Object.assign(element, chatProperties);

  element.htmlClassUtilities = hasSuggestions.value ? introPanelStyles(isDark) : {};
  element.errorMessages = { displayServiceErrorMessages: false };

  // Le widget n'a pas la place d'un panneau d'accueil : l'accueil y est un
  // simple message. Sur la page, le panneau porte deja le bonjour.
  if (!hasSuggestions.value) element.introMessage = { text: props.initialMessage };

  if (previousMessages.length > 0) element.history = previousMessages;

  element.onComponentRender = (renderedElement) => {
    restoreAccessibility(renderedElement);
    // Un changement de theme reconstruit le composant : les etiquettes des
    // reponses deja affichees sont reposees sur le fil restaure.
    scheduleModelTags();
  };

  element.connect = {
    stream: { partialRender: true },
    handler: async (body, signals) => {
      if (!hasTrackedFirstMessage) {
        hasTrackedFirstMessage = trackMatomoEvent('chatbot', 'first_message', props.variant);
      }
      const startedIn = conversationId;
      currentAnswerModel = null;
      setStreamingClass(true);
      // Le bouton d'arret de deep-chat et le bouton "Nouvelle conversation"
      // passent par le meme chemin : sans cela, effacer la conversation pendant
      // qu'une reponse s'ecrit la laisserait reapparaitre ligne par ligne.
      stopActiveAnswer = () => signals.stopClicked.listener?.();
      try {
        await handleChatRequest(body, signals);
      } finally {
        stopActiveAnswer = null;
        setStreamingClass(false);
        hasAnswer.value = lastAiText() !== '';
        // Une entree par echange, meme sans modele : c'est cet alignement d'une
        // reponse par bulle qui tient le reste.
        if (startedIn === conversationId) {
          answerModels.push(currentAnswerModel);
          scheduleModelTags();
        }
        currentAnswerModel = null;
        if (themeChangeIsPending) void applyThemeChange();
      }
    },
  };
};

// deep-chat ne pose presque aucun attribut d'accessibilite : pas de zone de
// journal pour les messages, et un champ de saisie qui est un simple div
// editable. Sans ce rattrapage, un lecteur d'ecran n'annoncerait ni les
// reponses qui arrivent, ni le role du champ — ce que faisait l'ancienne
// interface. Les identifiants vises sont ceux du CSS interne de deep-chat ;
// s'ils changeaient, l'interface resterait fonctionnelle, simplement sans ce
// rattrapage.
const restoreAccessibility = (element) => {
  const shadow = element?.shadowRoot;
  if (!shadow) return;

  const messages = shadow.querySelector('#messages');
  if (messages) {
    messages.setAttribute('role', 'log');
    messages.setAttribute('aria-live', 'polite');
    messages.setAttribute('aria-relevant', 'additions');
    messages.setAttribute('aria-label', 'Conversation avec le chatbot');
  }

  const input = shadow.querySelector('#text-input');
  if (input) {
    input.setAttribute('role', 'textbox');
    input.setAttribute('aria-label', 'Votre message');
    input.setAttribute('aria-multiline', 'false');
  }
};

const lastAiText = () => {
  const messages = chatElement.value?.getMessages?.() ?? [];
  const lastAiMessage = [...messages].reverse().find((message) => message.role === 'ai');
  return lastAiMessage?.text?.trim() ?? '';
};

// Changer de theme reconstruit le composant : on remet les messages en place
// pour que la conversation survive a la bascule.
const applyThemeChange = async () => {
  themeChangeIsPending = false;
  const previousMessages = chatElement.value?.getMessages?.() ?? [];
  chatKey.value += 1;
  await nextTick();
  configureChat(previousMessages);
};

watch(resolvedTheme, () => {
  // Reconstruire pendant qu'une reponse s'ecrit la ferait disparaitre : on
  // attend la fin du flux.
  if (isStreaming) themeChangeIsPending = true;
  else void applyThemeChange();
});

const showCopyFeedback = (state, announcement) => {
  copyState.value = state;
  statusMessage.value = announcement;
  globalThis.clearTimeout(copyFeedbackTimer);
  copyFeedbackTimer = globalThis.setTimeout(() => {
    copyState.value = 'idle';
    statusMessage.value = '';
  }, COPY_FEEDBACK_MS);
};

const copyLastAnswer = async () => {
  const text = lastAiText();
  if (!text) return;

  // L'API presse-papiers echoue hors HTTPS, ou si le navigateur la refuse :
  // l'echec doit se voir, pas disparaitre dans la console.
  try {
    await navigator.clipboard.writeText(text);
    showCopyFeedback('done', 'Réponse copiée dans le presse-papiers.');
  } catch (error) {
    console.warn('Copie impossible:', error);
    showCopyFeedback('failed', 'La copie a échoué.');
  }
};

const startNewConversation = () => {
  stopActiveAnswer?.();
  conversationId += 1;
  answerModels = [];
  chatElement.value?.clearMessages?.();
  hasAnswer.value = false;
  statusMessage.value = 'Conversation effacée.';
  chatElement.value?.focusInput?.();
};

onMounted(() => {
  configureChat();
  // La promesse est conservee plutot que son resultat : le widget flottant peut
  // etre referme avant que Cloudflare ait fini de monter son cadre, et il faut
  // tout de meme pouvoir le liberer.
  turnstileRender = renderTurnstile(turnstileContainer, turnstileToken, {
    appearance: 'interaction-only',
  });
});

onBeforeUnmount(async () => {
  globalThis.clearTimeout(copyFeedbackTimer);
  if (modelTagsFrame !== null) globalThis.cancelAnimationFrame(modelTagsFrame);
  stopActiveAnswer?.();
  removeTurnstile(await turnstileRender);
});
</script>

<style scoped>
/* Boutons de la barre basse : l'etiquette technique du site (fonte a chasse
   fixe, capitales espacees) transformee en controle cliquable. */
.chat-action {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  /* 40px de haut : une cible confortable au doigt, meme si le texte est petit. */
  min-height: 40px;
  padding: 0 0.7rem;
  border: 1px solid var(--color-coffee-bean-100);
  border-radius: 8px;
  background-color: transparent;
  font-family: var(--font-code);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--color-coffee-bean-600);
  /* Jamais `all` : la couleur de fond et les ombres n'ont pas a etre animees
     a chaque changement d'etat. */
  transition-property: transform, border-color, color, box-shadow;
  transition-duration: 250ms;
  transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}

.chat-action:hover:not(:disabled) {
  border-color: var(--color-regal-navy-300);
  color: var(--color-regal-navy-700);
  box-shadow: 0 2px 8px rgb(18 6 2 / 0.08);
  transform: translateY(-1.5px);
}

/* Enfoncement : le bouton repond sous le doigt sans sauter. */
.chat-action:active:not(:disabled) {
  transform: translateY(0) scale(0.97);
  transition-duration: 100ms;
}

.chat-action:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.chat-action-icon {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
}

/* Respiration de l'indicateur d'activite. Le pendant, cote Vue, de la regle
   posee dans le shadow DOM par styles.js : les deux partagent la duree et la
   courbe pour battre ensemble. */
.breath-dot {
  animation: breathe 1.5s cubic-bezier(0.22, 1, 0.36, 1) infinite;
}

.breath-dot:nth-child(2) {
  animation-delay: 0.18s;
}

.breath-dot:nth-child(3) {
  animation-delay: 0.36s;
}

@keyframes breathe {
  0%,
  100% {
    opacity: 0.22;
  }
  50% {
    opacity: 1;
  }
}

/* Le homard salue au chargement, une seule fois : une boucle permanente dans
   un en-tete fixe deviendrait vite fatigante. */
.chat-avatar {
  animation: chat-avatar-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}

@keyframes chat-avatar-in {
  from {
    opacity: 0;
    transform: scale(0.8) rotate(-12deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

:global(.dark) .chat-action {
  border-color: var(--color-coffee-bean-700);
  color: var(--color-soft-blush-300);
}

:global(.dark) .chat-action:hover:not(:disabled) {
  border-color: var(--color-regal-navy-600);
  color: var(--color-regal-navy-300);
  box-shadow: 0 2px 8px rgb(18 6 2 / 0.35);
}

@media (prefers-reduced-motion: reduce) {
  .chat-action,
  .chat-avatar,
  .breath-dot {
    transition: none;
    animation: none;
  }

  .breath-dot {
    opacity: 0.7;
  }

  .chat-action:hover:not(:disabled),
  .chat-action:active:not(:disabled) {
    transform: none;
  }
}
</style>
