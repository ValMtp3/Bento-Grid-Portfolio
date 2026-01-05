<template>
  <router-link
    v-if="$route.name !== 'home'"
    to="/"
    class="fixed top-4 left-4 z-40 text-center text-white h-10 w-10 bg-neutral-900/50 hover:bg-neutral-900/90 dark:bg-neutral-100/10 dark:hover:bg-neutral-100/50 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
    aria-label="Retour à l'accueil"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      ></path>
    </svg>
  </router-link>
</template>

<script>
export default {
  name: 'HomeButton',
};
</script>
