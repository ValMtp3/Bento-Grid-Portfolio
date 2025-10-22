<template>
  <button
    :title="isDark ? 'Activer le mode clair' : 'Activer le mode sombre'"
    aria-label="Changer de thème"
    class="text-center text-white h-8 w-8 bg-neutral-900/50 hover:bg-neutral-900/90 dark:bg-neutral-100/10 dark:hover:bg-neutral-100/50 rounded-xl flex items-center justify-center"
    @click="toggleDarkMode"
  >
    <svg
      v-if="isDark"
      class="w-5 h-5"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
    <svg
      v-else
      class="w-5 h-5"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  </button>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme.js';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

const themeStore = useThemeStore();
const { theme } = storeToRefs(themeStore);
const isDark = computed(() => theme.value === 'dark');
const toggleDarkMode = () => {
  console.log('Toggle clicked, current theme:', themeStore.theme);
  themeStore.setTheme(themeStore.theme === 'dark' ? 'light' : 'dark');
  console.log('New theme:', themeStore.theme);
};
</script>
