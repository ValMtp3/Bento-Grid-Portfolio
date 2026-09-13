<script setup>
import { segmentColor } from '@/data/finance';

defineProps({
  // Intitule de la barre. Sans lui, un degrade colore ne veut rien dire.
  caption: { type: String, required: true },
  // Liste deja triee par part decroissante, produite par le collecteur.
  parts: { type: Array, required: true },
  // Decalage d'entree, pour que les barres d'une meme carte se deploient
  // l'une apres l'autre plutot que toutes ensemble.
  delay: { type: Number, default: 0 },
});
</script>

<template>
  <div v-if="parts.length">
    <p
      class="mb-2 font-code text-[10px] uppercase tracking-[0.14em] text-regal-navy-600 dark:text-regal-navy-400"
    >
      {{ caption }}
    </p>
    <!-- La legende juste en dessous porte deja l'information en texte : la
         barre ferait doublon a la synthese vocale. -->
    <div
      class="bar-grow flex h-2 w-full overflow-hidden rounded-full"
      :style="{ '--bar-delay': `${delay}ms` }"
      aria-hidden="true"
    >
      <span
        v-for="(part, index) in parts"
        :key="part.label"
        :style="{ width: `${part.share}%`, backgroundColor: segmentColor(index) }"
        class="h-full"
      />
    </div>
    <div class="mt-2 flex flex-wrap gap-x-3 gap-y-1">
      <span
        v-for="(part, index) in parts"
        :key="part.label"
        class="stat-reveal flex items-center gap-1.5 text-xs text-coffee-bean-700 dark:text-soft-blush-300"
        :style="{ '--stat-delay': `${delay + 120 + index * 60}ms` }"
      >
        <!-- L'anneau garde la pastille visible sur les deux fonds de carte. -->
        <span
          :style="{ backgroundColor: segmentColor(index) }"
          class="h-2 w-2 rounded-full ring-1 ring-coffee-bean-950/15 dark:ring-soft-blush-50/25"
          aria-hidden="true"
        />
        {{ part.label }}
        <!-- tabular-nums : les chiffres gardent la meme largeur, la legende ne
             tressaute pas quand une part passe de 9 a 10 %. -->
        <span class="font-code font-semibold tabular-nums">{{ part.share }} %</span>
      </span>
    </div>
  </div>
</template>
