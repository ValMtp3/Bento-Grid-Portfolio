<script setup>
defineProps({
  index: { type: String, required: true },
  label: { type: String, required: true },
  title: { type: String, required: true },
  level: { type: Number, default: 2, validator: (value) => [1, 2, 3].includes(value) },
});
</script>

<template>
  <header
    class="mb-5 border-b border-coffee-bean-200/70 pb-3 dark:border-soft-blush-50/10 sm:mb-6"
  >
    <p
      class="mb-1 font-code text-[10px] font-semibold uppercase tracking-[0.2em] text-spicy-paprika-600 dark:text-spicy-paprika-400"
    >
      {{ index }} / {{ label }}
    </p>
    <component
      :is="`h${level}`"
      class="font-heading text-xl font-bold text-regal-navy-700 dark:text-regal-navy-300 sm:text-2xl"
    >
      {{ title }}
    </component>
  </header>
</template>
