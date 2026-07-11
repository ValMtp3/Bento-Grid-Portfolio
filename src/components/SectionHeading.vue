<script setup>
defineProps({
  index: { type: String, required: true },
  label: { type: String, required: true },
  title: { type: String, required: true },
});
</script>

<template>
  <header class="mb-5 text-center sm:mb-6">
    <p
      class="mb-1 font-code text-[10px] font-semibold uppercase tracking-[0.2em] text-spicy-paprika-600 dark:text-spicy-paprika-400"
    >
      {{ index }} / {{ label }}
    </p>
    <h2
      class="font-heading text-xl font-bold text-regal-navy-700 dark:text-regal-navy-300 sm:text-2xl"
    >
      {{ title }}
    </h2>
  </header>
</template>
