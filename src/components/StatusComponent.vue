<script setup>
const details = [
  { label: 'Depuis', value: 'Juillet 2026' },
  { label: 'Contrat', value: 'CDI' },
  { label: 'Focus', value: 'LLM · MLOps · Data' },
];
</script>

<template>
  <!-- Status Cell -->
  <div class="md:col-span-2 bento-cell p-6 flex flex-col justify-between gap-4">
    <div>
      <p
        class="mb-2 font-code text-[10px] font-semibold uppercase tracking-[0.18em] text-regal-navy-600 dark:text-regal-navy-400"
      >
        $ En poste
      </p>
      <div class="flex items-center gap-3">
        <!-- Meme silhouette carree que l'indicateur du widget chatbot. -->
        <span class="relative flex h-2.5 w-2.5 shrink-0">
          <span
            class="animate-ping absolute inline-flex h-full w-full bg-regal-navy-400 opacity-60"
          ></span>
          <span
            class="relative inline-flex h-2.5 w-2.5 bg-regal-navy-500 dark:bg-regal-navy-400"
          ></span>
        </span>
        <span
          class="font-heading font-bold text-lg leading-tight text-coffee-bean-950 dark:text-soft-blush-50"
        >
          Ingénieur IA/Data
        </span>
      </div>
      <p class="mt-1.5 text-sm text-coffee-bean-600 dark:text-soft-blush-300">
        Shaarp — Montpellier
      </p>
    </div>

    <dl
      class="divide-y divide-coffee-bean-200/60 border-t border-coffee-bean-200/60 dark:divide-soft-blush-50/10 dark:border-soft-blush-50/10"
    >
      <div v-for="item in details" :key="item.label" class="flex items-baseline gap-3 py-1.5">
        <dt
          class="w-20 shrink-0 font-code text-[10px] uppercase tracking-[0.14em] text-regal-navy-600 dark:text-regal-navy-400"
        >
          {{ item.label }}
        </dt>
        <dd class="font-code text-xs text-coffee-bean-700 dark:text-soft-blush-200">
          {{ item.value }}
        </dd>
      </div>
    </dl>
  </div>
</template>
