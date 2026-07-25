<script setup>
// Bloc « titre + carte » des pages documentaires (stack, mentions legales,
// politique de confidentialite), ou ce motif etait recopie une trentaine de fois.
defineProps({
  title: { type: String, required: true },
  // La page mentions legales pose ses cartes sur soft-blush plutot que sur blanc.
  tone: { type: String, default: 'white', validator: (value) => ['white', 'blush'].includes(value) },
});
</script>

<template>
  <section class="mb-10">
    <h2 class="text-2xl font-semibold mb-2 dark:text-soft-blush-50">{{ title }}</h2>
    <div
      class="dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 p-4 shadow rounded-xl"
      :class="tone === 'blush' ? 'bg-soft-blush-50' : 'bg-white'"
    >
      <slot />
    </div>
  </section>
</template>
