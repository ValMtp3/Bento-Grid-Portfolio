<script setup>
// Protege l'adresse email des harvesters, sur un site 100 % statique.
//
// Trois niveaux, porque un seul ne suffit pas :
//   1. Le HTML servi ne contient jamais l'email (voir obfuscateEmails dans
//      src/markdown.js pour le contenu pre-rendu).
//   2. Le DOM ne contient jamais le mailto : le href n'est pas pose, le lien
//      est reconstruit au clic via window.location. Un bot qui execute le JS
//      et lit les attributs ne trouve rien.
//   3. Le bundle JS ne contient pas l'email en clair : la prop `value` est
//      l'adresse encodee en base64, decodee ici. Un scan regex des assets ne
//      trouve que du base64.
//
// Limite honnete : un bot qui execute vraiment le JavaScript peut tout lire
// en memoire. Contre ce niveau-la, la seule parade est de ne plus publier
// l'email du tout (formulaire de contact uniquement).
//
// Le bouton « Copier » sert les visiteurs sans application mail (Gmail dans le
// navigateur) : l'adresse n'entre dans le presse-papiers qu'au clic.
import { onUnmounted, ref } from 'vue';

// Les attributs du parent (class, ...) vont sur le lien, pas sur le <span>
// englobant qui sert seulement a poser le bouton a cote du lien.
defineOptions({ inheritAttrs: false });

const props = defineProps({
  value: {
    type: String,
    required: true,
  },
});

const FEEDBACK_DURATION_MS = 2000;

// Un etat de copie = ce que voit le visiteur (label) + ce qu'entend le lecteur
// d'ecran (announcement).
const COPY_FEEDBACK = {
  idle: { label: 'Copier', announcement: '' },
  copied: { label: 'Copié', announcement: 'Adresse email copiée dans le presse-papiers' },
  failed: {
    label: 'Copie impossible',
    announcement: 'La copie a échoué, utilisez le lien pour écrire par email',
  },
};

const email = atob(props.value);
const [user, domain] = email.split('@');
const dot = domain.lastIndexOf('.');
const domainName = domain.slice(0, dot);
const topLevelDomain = domain.slice(dot + 1);
const display = `${user} [at] ${domainName} [point] ${topLevelDomain}`;
// Lu par les lecteurs d'ecran a la place de « [at] » / « [point] ».
const spokenEmail = `Envoyer un email : ${user} arobase ${domainName} point ${topLevelDomain}`;

const copyStatus = ref('idle'); // 'idle' | 'copied' | 'failed'
let resetTimerId = null;

const openMailClient = () => {
  window.location.href = `mailto:${email}`;
};

const showStatus = (status) => {
  copyStatus.value = status;
  clearTimeout(resetTimerId);
  resetTimerId = setTimeout(() => {
    copyStatus.value = 'idle';
  }, FEEDBACK_DURATION_MS);
};

const copyEmail = async () => {
  try {
    await navigator.clipboard.writeText(email);
    showStatus('copied');
  } catch {
    // Contexte non securise ou permission refusee : on le dit au visiteur
    // plutot que de laisser un bouton muet.
    showStatus('failed');
  }
};

onUnmounted(() => clearTimeout(resetTimerId));
</script>

<template>
  <span>
    <!-- Pas de href : sans lui le <a> n'est ni focusable ni active au clavier,
         d'ou role="link", tabindex et le keydown. -->
    <a
      role="link"
      tabindex="0"
      class="cursor-pointer hover:underline transition-colors"
      :aria-label="spokenEmail"
      v-bind="$attrs"
      @click.prevent="openMailClient"
      @keydown.enter.prevent="openMailClient"
    >
      <slot>{{ display }}</slot>
    </a>
    <button
      type="button"
      class="ml-2 cursor-pointer rounded border border-current px-1.5 text-xs align-middle opacity-80 hover:opacity-100 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2"
      @click="copyEmail"
    >
      {{ COPY_FEEDBACK[copyStatus].label }}
    </button>
    <!-- Zone vocale : annonce le resultat de la copie sans deplacer le focus. -->
    <span class="sr-only" role="status" aria-live="polite">{{ COPY_FEEDBACK[copyStatus].announcement }}</span>
  </span>
</template>
