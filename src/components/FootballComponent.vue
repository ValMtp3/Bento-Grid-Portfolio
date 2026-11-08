<script setup>
import { computed, onMounted, ref } from 'vue';
import { formatMatchDate, formatRelative, loadPulse } from '@/data/pulse';

const pulse = ref(null);
const loaded = ref(false);

const om = computed(() => pulse.value?.om ?? null);
const last = computed(() => om.value?.last ?? null);
const next = computed(() => om.value?.next ?? null);
const standing = computed(() => om.value?.standing ?? null);

// Coupes suivies en plus de la Ligue 1, en statique (l'animation terminal vit
// sur le nom du hero, pas ici) : absentes tant que la competition n'a pas
// commence pour l'OM (ex. Coupe de France avant les 32es de janvier).
const cupFrance = computed(() => om.value?.cups?.france ?? null);
const cupEurope = computed(() => om.value?.cups?.europe ?? null);

// Meme grammaire que la pastille de resultat : elimine reste neutre (coffee),
// en lice en navy, victoire en vert.
const cupClass = (run) => {
  if (run?.state === 'eliminated') return 'text-coffee-bean-500 dark:text-soft-blush-400';
  if (run?.state === 'winner') return 'text-emerald-600 dark:text-emerald-400';
  return 'text-regal-navy-600 dark:text-regal-navy-400';
};

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
    <!-- Mobile : le classement passe sous le titre, sinon le nom du club est
         ecrase dans une colonne etroite et se coupe sur trois lignes. -->
    <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
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

      <div class="sm:shrink-0 sm:text-right">
        <p
          v-if="standing"
          class="flex items-baseline gap-2 font-code text-[10px] text-coffee-bean-600 sm:flex-col sm:items-end sm:gap-0 dark:text-soft-blush-300"
        >
          <span class="font-heading text-lg font-bold text-coffee-bean-950 dark:text-soft-blush-50">
            {{ standing.position }}<sup>e</sup>
          </span>
          <span>{{ standing.points }} pts · {{ standing.played }} j</span>
        </p>
        <p v-if="cupFrance" class="mt-1 font-code text-[10px]" :class="cupClass(cupFrance)">
          CDF · {{ cupFrance.text }}
        </p>
        <p v-if="cupEurope" class="mt-0.5 font-code text-[10px]" :class="cupClass(cupEurope)">
          {{ cupEurope.competition }} · {{ cupEurope.text }}
        </p>
      </div>
    </div>

    <!-- Dernier resultat -->
    <!-- flex-1 + justify-center : quand la grille etire la cellule, le surplus
         de hauteur se repartit autour du score au lieu de former un trou. -->
    <div
      v-if="last"
      class="flex flex-1 flex-col justify-center border-t border-coffee-bean-200/60 py-4 dark:border-soft-blush-50/10"
    >
      <div class="mb-2 flex items-center gap-2">
        <span v-if="outcome" class="tag" :class="outcome.classes">{{ outcome.label }}</span>
        <span class="font-code text-[10px] text-coffee-bean-600 dark:text-soft-blush-400">
          {{ lastAge }}
        </span>
      </div>
      <p class="flex items-center gap-2 font-code text-base text-coffee-bean-800 sm:gap-4 sm:text-xl dark:text-soft-blush-200">
        <span
          class="h-7 w-7 shrink-0 rounded team-chip sm:h-9 sm:w-9"
          :style="chipStyle(last.home)"
          aria-hidden="true"
        />
        <span class="font-semibold">{{ last.home.tla }}</span>
        <span
          class="font-heading text-3xl font-bold leading-none sm:text-5xl text-coffee-bean-950 dark:text-soft-blush-50"
        >
          {{ last.score.home }} – {{ last.score.away }}
        </span>
        <span class="font-semibold">{{ last.away.tla }}</span>
        <span
          class="h-7 w-7 shrink-0 rounded team-chip sm:h-9 sm:w-9"
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
          class="h-2.5 w-2.5 shrink-0 rounded-[3px] team-chip"
          :style="chipStyle(next.home)"
          aria-hidden="true"
        />
        {{ next.home.tla }}
        <span class="text-coffee-bean-400 dark:text-soft-blush-400">–</span>
        {{ next.away.tla }}
        <span
          class="h-2.5 w-2.5 shrink-0 rounded-[3px] team-chip"
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
