<script setup>
import { computed, onMounted, ref } from 'vue';
import { formatMatchDate, formatRelative, loadPulse } from '@/data/pulse';

const pulse = ref(null);
const loaded = ref(false);

const om = computed(() => pulse.value?.om ?? null);
const last = computed(() => om.value?.last ?? null);
const next = computed(() => om.value?.next ?? null);
const standing = computed(() => om.value?.standing ?? null);

const lastAge = computed(() => formatRelative(last.value?.date));
const nextDate = computed(() => formatMatchDate(next.value?.date));

// Une defaite s'affiche comme une victoire : c'est tout l'interet d'annoncer
// qu'on supporte un club. Le vert reste reserve au statut positif, la defaite
// n'est pas dramatisee en rouge mais simplement neutre.
const OUTCOMES = {
  win: {
    label: 'Victoire 🎉',
    classes:
      'border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300',
  },
  draw: {
    label: 'Match nul',
    classes: 'tag-navy',
  },
  loss: {
    label: 'Défaite',
    classes:
      'border-coffee-bean-300 bg-coffee-bean-100/70 text-coffee-bean-700 dark:border-soft-blush-50/20 dark:bg-soft-blush-50/5 dark:text-soft-blush-300',
  },
};

const outcome = computed(() => OUTCOMES[last.value?.outcome] ?? null);

// Pastille bicolore aux couleurs du club, extraites de son ecusson par le
// script de collecte. Coupe en diagonale plutot qu'en rond : la grille bento
// reste rectiligne, les angles sont adoucis mais jamais organiques.
const chipStyle = (team) => {
  const [primary = '#123b7d', secondary = '#e65a28'] = team?.colors ?? [];
  return { backgroundImage: `linear-gradient(135deg, ${primary} 0 50%, ${secondary} 50% 100%)` };
};

onMounted(() => {
  loadPulse().then((data) => {
    pulse.value = data;
    loaded.value = true;
  });
});
</script>

<template>
  <!-- OM cell -->
  <div class="md:col-span-2 bento-cell p-5 sm:p-6 flex flex-col gap-4">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p
          class="mb-1 font-code text-[10px] font-semibold uppercase tracking-[0.18em] text-spicy-paprika-600 dark:text-spicy-paprika-400"
        >
          $ hors du code
        </p>
        <h3
          class="font-heading font-bold text-base sm:text-lg text-coffee-bean-950 dark:text-soft-blush-50"
        >
          Olympique de Marseille
        </h3>
      </div>

      <p
        v-if="standing"
        class="shrink-0 text-right font-code text-[10px] text-coffee-bean-600 dark:text-soft-blush-300"
      >
        <span class="font-heading text-lg font-bold text-coffee-bean-950 dark:text-soft-blush-50">
          {{ standing.position }}<sup>e</sup>
        </span>
        <br />
        {{ standing.points }} pts · {{ standing.played }} j
      </p>
    </div>

    <!-- Dernier resultat -->
    <div v-if="last" class="border-t border-coffee-bean-200/60 pt-4 dark:border-soft-blush-50/10">
      <div class="mb-2 flex items-center gap-2">
        <span v-if="outcome" class="tag" :class="outcome.classes">{{ outcome.label }}</span>
        <span class="font-code text-[10px] text-coffee-bean-600 dark:text-soft-blush-400">
          {{ lastAge }}
        </span>
      </div>
      <p class="flex items-center gap-2.5 font-code text-base text-coffee-bean-800 dark:text-soft-blush-200">
        <span
          class="h-6 w-6 shrink-0 rounded ring-1 ring-coffee-bean-950/15 dark:ring-soft-blush-50/25"
          :style="chipStyle(last.home)"
          aria-hidden="true"
        />
        <span class="font-semibold">{{ last.home.tla }}</span>
        <span
          class="font-heading text-3xl font-bold leading-none text-coffee-bean-950 dark:text-soft-blush-50"
        >
          {{ last.score.home }} – {{ last.score.away }}
        </span>
        <span class="font-semibold">{{ last.away.tla }}</span>
        <span
          class="h-6 w-6 shrink-0 rounded ring-1 ring-coffee-bean-950/15 dark:ring-soft-blush-50/25"
          :style="chipStyle(last.away)"
          aria-hidden="true"
        />
      </p>
      <p class="mt-1.5 font-code text-[11px] text-coffee-bean-600 dark:text-soft-blush-400">
        {{ last.home.name }} – {{ last.away.name }}
        <template v-if="last.competition"> · {{ last.competition }}</template>
      </p>
    </div>

    <!-- Prochain match -->
    <div
      v-if="next"
      class="mt-auto border-t border-coffee-bean-200/60 pt-4 dark:border-soft-blush-50/10"
    >
      <p
        class="mb-1 font-code text-[10px] uppercase tracking-[0.14em] text-regal-navy-600 dark:text-regal-navy-400"
      >
        ~ prochain match
      </p>
      <p
        class="flex flex-wrap items-center gap-1.5 font-code text-[11px] text-coffee-bean-700 dark:text-soft-blush-300"
      >
        <span
          class="h-2.5 w-2.5 shrink-0 rounded-[3px] ring-1 ring-coffee-bean-950/15 dark:ring-soft-blush-50/25"
          :style="chipStyle(next.home)"
          aria-hidden="true"
        />
        {{ next.home.tla }}
        <span class="text-coffee-bean-400 dark:text-soft-blush-400">–</span>
        {{ next.away.tla }}
        <span
          class="h-2.5 w-2.5 shrink-0 rounded-[3px] ring-1 ring-coffee-bean-950/15 dark:ring-soft-blush-50/25"
          :style="chipStyle(next.away)"
          aria-hidden="true"
        />
        <span class="ml-1 text-coffee-bean-600 dark:text-soft-blush-400">{{ nextDate }}</span>
      </p>
    </div>

    <!-- Entre mi-mai et aout, l'API ne renvoie plus rien : la cellule doit le
         dire au lieu d'afficher un resultat de printemps. -->
    <p
      v-else-if="loaded"
      class="mt-auto border-t border-coffee-bean-200/60 pt-4 font-code text-xs text-coffee-bean-600 dark:border-soft-blush-50/10 dark:text-soft-blush-300"
    >
      Trêve — pas de match programmé pour l'instant.
    </p>

    <p
      v-if="!loaded && !last"
      class="font-code text-xs text-coffee-bean-500 dark:text-soft-blush-400"
    >
      Chargement…
    </p>
  </div>
</template>
