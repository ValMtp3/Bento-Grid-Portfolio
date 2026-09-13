<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { completeCommand, runCommand } from '@/easter-eggs/commands.js';
import { trackMatomoEvent } from '@/matomo';

const router = useRouter();

const isOpen = ref(false);
const collapsed = ref(false);
const maximized = ref(false);
const command = ref('');
const lines = ref([]);
const lastStatus = ref(0);
const output = ref(null);
const input = ref(null);
const history = ref([]);
const historyIndex = ref(-1);
let lastFocused = null;
let bootTimers = [];

const BOOT = [
  { text: 'homard shell 2.1 (arm64-darwin) — valentin-fiess.fr', tone: 'dim' },
  { text: '[ ok ] vue 3 · vite · tailwind', tone: 'ok' },
  { text: '[ ok ] rag · llm · mlops', tone: 'ok' },
  { text: '[ ok ] homard daemon', tone: 'ok' },
  { text: '' },
  { text: "'help' liste les commandes · tab complete · echap ferme", tone: 'dim' },
  { text: '' },
];

// Le chemin de la page courante sert de repertoire courant : le prompt suit la
// navigation, comme un vrai shell suit les cd.
const cwd = computed(() => {
  const path = router.currentRoute.value.path;
  return path === '/' ? '~' : `~${path}`;
});

const scrollToBottom = () => {
  nextTick(() => {
    if (output.value) output.value.scrollTop = output.value.scrollHeight;
  });
};

const focusInput = () => nextTick(() => input.value?.focus());

const push = (line) => {
  lines.value.push(typeof line === 'string' ? { kind: 'out', text: line } : { kind: 'out', ...line });
};

const clearBootTimers = () => {
  bootTimers.forEach((id) => window.clearTimeout(id));
  bootTimers = [];
};

// Le demarrage s'ecrit ligne a ligne : c'est ce qui fait la difference entre un
// bloc de texte et un terminal qui demarre. Rejoue a chaque ouverture, comme un
// nouveau shell.
const playBoot = () => {
  clearBootTimers();
  lines.value = [];
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    BOOT.forEach(push);
    return;
  }
  BOOT.forEach((line, index) => {
    bootTimers.push(
      window.setTimeout(() => {
        push(line);
        scrollToBottom();
      }, index * 130),
    );
  });
};

const open = () => {
  if (isOpen.value) return;
  lastFocused = document.activeElement;
  isOpen.value = true;
  collapsed.value = false;
  lastStatus.value = 0;
  playBoot();
  trackMatomoEvent('easter_egg', 'terminal_open', router.currentRoute.value.path);
  focusInput();
};

const close = () => {
  isOpen.value = false;
  clearBootTimers();
  lastFocused?.focus?.();
};

const toggleCollapse = () => {
  collapsed.value = !collapsed.value;
  if (!collapsed.value) focusInput();
};

const toggleMaximize = () => {
  maximized.value = !maximized.value;
  focusInput();
};

// Les commandes decrivent leur effet ; le composant est le seul a savoir comment
// naviguer, telecharger ou fermer.
const applyEffect = (effect) => {
  if (effect.effect === 'clear') {
    // `clear` relance le shell : ecran vide puis sequence de demarrage.
    playBoot();
    return;
  }
  if (effect.effect === 'close') {
    close();
    return;
  }
  if (effect.effect === 'navigate') {
    if (!effect.keepOpen) close();
    router.push({ path: effect.path, hash: effect.hash });
    return;
  }
  if (effect.effect === 'external') {
    window.open(effect.href, '_blank', 'noopener,noreferrer');
    return;
  }
  if (effect.effect === 'download') {
    const link = document.createElement('a');
    link.href = effect.href;
    link.download = '';
    link.click();
  }
};

const echoPrompt = (text) => {
  lines.value.push({ kind: 'in', prompt: cwd.value, text, status: lastStatus.value });
};

const submit = () => {
  const raw = command.value.trim();
  command.value = '';
  if (!raw) {
    echoPrompt('');
    scrollToBottom();
    return;
  }

  echoPrompt(raw);
  history.value.push(raw);
  historyIndex.value = -1;
  trackMatomoEvent('easter_egg', 'terminal_command', raw.split(/\s+/)[0].toLowerCase());

  const { lines: results, status } = runCommand(raw, {
    path: router.currentRoute.value.path,
    history: history.value,
  });

  let failed = status !== 0;
  for (const result of results) {
    if (typeof result === 'string') push(result);
    else if (result.effect) applyEffect(result);
    else {
      if (result.tone === 'error') failed = true;
      push(result);
    }
  }
  lastStatus.value = failed ? 1 : 0;
  scrollToBottom();
};

const complete = () => {
  const { value, candidates } = completeCommand(command.value);
  command.value = value;
  if (candidates.length > 1) {
    echoPrompt(command.value);
    push({ parts: candidates.map((entry) => ({ text: `${entry}  `, tone: 'cmd' })) });
    scrollToBottom();
  }
};

const recallHistory = (delta) => {
  if (!history.value.length) return;
  const next =
    historyIndex.value === -1
      ? history.value.length - 1
      : Math.min(history.value.length - 1, Math.max(0, historyIndex.value + delta));
  historyIndex.value = next;
  command.value = history.value[next];
};

// Raccourcis internes au champ : ctrl+l efface, ctrl+c abandonne la ligne.
const onInputKeydown = (event) => {
  if (!(event.ctrlKey || event.metaKey)) return;
  const key = event.key.toLowerCase();
  if (key === 'l') {
    event.preventDefault();
    playBoot();
    return;
  }
  if (key === 'c') {
    event.preventDefault();
    echoPrompt(`${command.value}^C`);
    command.value = '';
    lastStatus.value = 130;
    scrollToBottom();
  }
};

// Le raccourci global ne doit pas se declencher pendant que l'utilisateur remplit
// le formulaire de contact ou parle au chatbot.
const isTyping = (target) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

const onKeydown = (event) => {
  if (isOpen.value && event.key === 'Escape') {
    event.preventDefault();
    close();
    return;
  }
  if (isTyping(event.target)) return;
  const isPalette = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
  if (isPalette || event.key === '~') {
    event.preventDefault();
    if (isOpen.value) close();
    else open();
  }
};

onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
  clearBootTimers();
});
</script>

<template>
  <div
    v-if="isOpen"
    class="terminal-backdrop"
    role="dialog"
    aria-modal="true"
    aria-label="Terminal du site"
    @click.self="close"
  >
    <div class="terminal-shell" :class="{ maximized }" @click="focusInput">
      <!-- Barre de titre : les trois pastilles reprennent la palette du site
           plutot que le rouge/jaune/vert de macOS, et font ce qu'elles annoncent. -->
      <div class="terminal-bar">
        <span class="terminal-dots">
          <button
            type="button"
            class="dot dot-close"
            title="Fermer"
            aria-label="Fermer le terminal"
            @click.stop="close"
          ></button>
          <button
            type="button"
            class="dot dot-collapse"
            :title="collapsed ? 'Deplier' : 'Replier'"
            :aria-label="collapsed ? 'Deplier le terminal' : 'Replier le terminal'"
            :aria-pressed="collapsed"
            @click.stop="toggleCollapse"
          ></button>
          <button
            type="button"
            class="dot dot-max"
            :title="maximized ? 'Reduire la fenetre' : 'Agrandir la fenetre'"
            :aria-label="maximized ? 'Reduire la fenetre' : 'Agrandir la fenetre'"
            :aria-pressed="maximized"
            @click.stop="toggleMaximize"
          ></button>
        </span>
        <span class="terminal-title">visiteur@valentin-fiess — homard — {{ cwd }}</span>
        <button type="button" class="terminal-close" @click.stop="close">esc</button>
      </div>

      <template v-if="!collapsed">
        <div ref="output" class="terminal-output">
          <p v-for="(line, index) in lines" :key="index" class="terminal-line" :class="line.tone">
            <template v-if="line.kind === 'in'">
              <span class="terminal-user">visiteur@valentin-fiess</span
              ><span class="terminal-path">:{{ line.prompt }}</span
              ><span class="terminal-sigil" :class="{ failed: line.status }">$ </span
              >{{ line.text }}
            </template>
            <template v-else-if="line.parts">
              <span v-for="(part, i) in line.parts" :key="i" :class="part.tone">{{ part.text }}</span>
            </template>
            <template v-else>{{ line.text }}</template>
          </p>
        </div>

        <form class="terminal-input-row" @submit.prevent="submit">
          <label class="terminal-user" for="terminal-input">
            visiteur@valentin-fiess<span class="terminal-path">:{{ cwd }}</span
            ><span class="terminal-sigil" :class="{ failed: lastStatus }">$</span>
          </label>
          <span class="terminal-field">
            <input
              id="terminal-input"
              ref="input"
              v-model="command"
              type="text"
              maxlength="60"
              autocomplete="off"
              autocapitalize="off"
              autocorrect="off"
              spellcheck="false"
              @keydown="onInputKeydown"
              @keydown.tab.prevent="complete"
              @keydown.up.prevent="recallHistory(-1)"
              @keydown.down.prevent="recallHistory(1)"
            />
            <span v-if="!command" class="terminal-caret" aria-hidden="true">▋</span>
          </span>
        </form>
      </template>
    </div>
  </div>
</template>

<style scoped>
.terminal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 1rem;
  padding-top: 8vh;
  background: rgba(18, 6, 2, 0.78);
  backdrop-filter: blur(4px);
}

.terminal-shell {
  position: relative;
  display: flex;
  width: 100%;
  max-width: 48rem;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #35130c;
  border-radius: 0.5rem;
  background: #0a0402;
  box-shadow:
    0 0 0 1px rgba(230, 90, 40, 0.15),
    0 24px 60px rgba(0, 0, 0, 0.6);
  /* Repli explicite sur une monospace systeme : si Intel One Mono n'est pas
     encore chargee, un repli proportionnel casserait l'alignement du dessin. */
  font-family: var(--font-code), ui-monospace, SFMono-Regular, Menlo, monospace;
  font-variant-ligatures: none;
  letter-spacing: 0;
  font-size: 0.8125rem;
  line-height: 1.5;
  transition: max-width 0.2s ease;
}
.terminal-shell.maximized {
  max-width: 72rem;
}

/* Balayage CRT : assez faible pour ne jamais gener la lecture, assez present
   pour que l'ecran ne ressemble pas a une simple boite noire. */
.terminal-shell::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    to bottom,
    rgba(255, 241, 234, 0.035) 0 1px,
    transparent 1px 3px
  );
}

.terminal-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid #35130c;
  background: #120602;
  padding: 0.5rem 0.75rem;
}

.terminal-dots {
  display: flex;
  gap: 0.375rem;
}
.dot {
  display: block;
  width: 0.6875rem;
  height: 0.6875rem;
  border-radius: 9999px;
  opacity: 0.75;
  transition:
    opacity 0.15s,
    transform 0.15s;
}
.dot:hover {
  opacity: 1;
  transform: scale(1.15);
}
.dot-close {
  background: #e65a28;
}
.dot-collapse {
  background: #cf8769;
}
.dot-max {
  background: #4c82df;
}

.terminal-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  color: #a95a3d;
}

.terminal-close {
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  color: #ea805d;
  transition: color 0.2s;
}
.terminal-close:hover {
  color: #f9cdbd;
}

.terminal-output {
  max-height: 46vh;
  overflow: auto;
  padding: 0.75rem 1rem;
  color: #f9cdbd;
  text-shadow: 0 0 8px rgba(249, 205, 189, 0.18);
  /* 1.2 exactement : c'est le rapport pour lequel le homard a ete calcule
     (cellule de 0,6 em sur 1,2 em). Toute autre valeur l'etire. */
  line-height: 1.2;
}
.maximized .terminal-output {
  max-height: 64vh;
}

/* `pre` plutot que `pre-wrap` : le dessin du homard et les colonnes de `help`
   gardent leur alignement, la fenetre defile lateralement si besoin. */
.terminal-line {
  white-space: pre;
  min-height: 1.2em;
}
.terminal-line.dim,
.terminal-line .dim {
  color: #a95a3d;
}
.terminal-line.ok {
  color: #7aa7ef;
}
.terminal-line.error,
.terminal-line .error {
  color: #f1885b;
}
.terminal-line .cmd {
  color: #ea805d;
}
.terminal-line .path,
.terminal-path {
  color: #7aa7ef;
}

.terminal-user {
  color: #e65a28;
  font-weight: 600;
}
.terminal-sigil {
  color: #a95a3d;
}
.terminal-sigil.failed {
  color: #f1885b;
}

.terminal-input-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-top: 1px solid #35130c;
  padding: 0.625rem 1rem;
}

.terminal-field {
  position: relative;
  display: flex;
  flex: 1;
  align-items: center;
}

.terminal-field input {
  width: 100%;
  border: 0;
  background: transparent;
  color: #fff1ea;
  caret-color: #e65a28;
  caret-shape: block;
  outline: none;
  font: inherit;
  text-shadow: 0 0 8px rgba(230, 90, 40, 0.25);
}

/* Curseur affiche uniquement quand le champ est vide : aucun risque qu'il se
   desaligne du texte saisi. */
.terminal-caret {
  position: absolute;
  left: 0;
  color: #e65a28;
  animation: terminal-blink 1.1s steps(1, end) infinite;
}

@keyframes terminal-blink {
  0%,
  49% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .terminal-caret {
    animation: none;
  }
}
</style>
