<script setup>
import { computed } from 'vue';

import ResponsiveImage from './ResponsiveImage.vue';

// Date de prise de poste. L'anciennete en decoule et se met a jour seule :
// un chiffre ecrit en dur vieillirait en silence.
const STARTED_AT = new Date('2026-07-01T00:00:00Z');

const MONTHS_PER_YEAR = 12;

const monthsSince = (from, now = new Date()) =>
  Math.max(
    (now.getFullYear() - from.getFullYear()) * MONTHS_PER_YEAR +
      (now.getMonth() - from.getMonth()),
    0,
  );

// "3 mois", "1 an", "2 ans et 4 mois".
const formatSeniority = (months) => {
  if (months < 1) return 'ce mois-ci';
  if (months < MONTHS_PER_YEAR) return `${months} mois`;

  const years = Math.floor(months / MONTHS_PER_YEAR);
  const rest = months % MONTHS_PER_YEAR;
  const yearsLabel = `${years} an${years > 1 ? 's' : ''}`;

  return rest === 0 ? yearsLabel : `${yearsLabel} et ${rest} mois`;
};

const seniority = computed(() => formatSeniority(monthsSince(STARTED_AT)));

const details = computed(() => [
  { label: 'Depuis', value: `Juillet 2026 · ${seniority.value}` },
  { label: 'Contrat', value: 'CDI' },
  { label: 'Focus', value: 'LLM · MLOps · Data' },
]);
</script>

<template>
  <!-- Status Cell -->
  <!-- La hauteur de cette carte est imposee par la carte Presentation, qui
       occupe deux rangees a sa gauche. Le contenu est centre pour que l'espace
       restant se repartisse de part et d'autre. -->
  <div
    class="brand-logo-card md:col-span-2 bento-cell p-5 sm:p-6 flex flex-col justify-center gap-5"
  >
    <div class="flex items-start justify-between gap-4">
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
            class="font-heading font-bold text-lg leading-tight text-balance text-coffee-bean-950 dark:text-soft-blush-50"
          >
            Ingénieur IA/Data
          </span>
        </div>
        <p class="mt-1.5 text-sm text-coffee-bean-600 dark:text-soft-blush-300">
          Shaarp — Montpellier
        </p>
      </div>

      <!-- Logo de l'employeur : il ancre la carte visuellement et rend le poste
           immediatement credible. Desature au repos comme tous les logos
           exterieurs, il reprend ses couleurs au survol de la carte. -->
      <ResponsiveImage
        src="/assets/assets_index/SHAARP_logo.webp"
        alt="Logo Shaarp"
        class="brand-logo h-10 w-auto shrink-0 object-contain sm:h-12"
        loading="lazy"
      />
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
