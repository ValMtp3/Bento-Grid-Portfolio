<script setup>
import { computed } from 'vue';
import { cycleThemePreference, DARK, LIGHT, SYSTEM, themePreference } from '@/theme.js';

// Le libelle annonce l'etat courant puis l'action a venir : un lecteur d'ecran
// ne voit pas l'icone, il lui faut les deux informations dans le texte.
const LABELS = {
  [LIGHT]: 'Thème clair actif. Activer le thème sombre.',
  [DARK]: 'Thème sombre actif. Suivre le thème du système.',
  [SYSTEM]: 'Thème du système actif. Activer le thème clair.',
};

const label = computed(() => LABELS[themePreference.value]);
</script>

<template>
  <button
    type="button"
    class="flex min-h-11 min-w-11 items-center justify-center p-2 text-coffee-bean-700 transition-colors hover:text-spicy-paprika-500 dark:text-soft-blush-200 dark:hover:text-spicy-paprika-400"
    :aria-label="label"
    :title="label"
    @click="cycleThemePreference"
  >
    <!-- Trois traces au meme format que l'icone du menu : trait seul, couleur
         heritee du texte, 24 unites de cote. -->
    <svg
      class="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <!-- Clair : un soleil. -->
      <g v-if="themePreference === LIGHT">
        <circle cx="12" cy="12" r="4" />
        <path
          d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        />
      </g>

      <!-- Sombre : un croissant de lune. -->
      <path v-else-if="themePreference === DARK" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />

      <!-- Systeme : un ecran, pour dire que la decision revient a l'appareil. -->
      <g v-else>
        <rect x="2" y="4" width="20" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </g>
    </svg>
  </button>
</template>
