<script setup>
// Defile une file de homards en bas de la fenetre. Declenchee au cinquieme clic
// sur la pastille de l'accueil, elle se nettoie seule a la fin du passage.
import { computed, watch } from 'vue';

const props = defineProps({
  active: { type: Boolean, default: false },
});
const emit = defineEmits(['finished']);

const COUNT = 9;
const DURATION = 7000;

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Chaque homard part avec son propre retard et sa propre taille : une file
// parfaitement reguliere aurait l'air d'un bandeau, pas d'une bestiole.
const lobsters = computed(() =>
  Array.from({ length: COUNT }, (_, index) => ({
    id: index,
    delay: `${index * 320}ms`,
    duration: `${4200 + (index % 4) * 700}ms`,
    size: `${1.5 + ((index * 7) % 5) * 0.35}rem`,
    bottom: `${4 + ((index * 3) % 5) * 9}px`,
  })),
);

watch(
  () => props.active,
  (active) => {
    if (!active) return;
    window.setTimeout(() => emit('finished'), reducedMotion() ? 2500 : DURATION);
  },
);
</script>

<template>
  <div v-if="active" class="lobster-parade" aria-hidden="true">
    <span
      v-for="lobster in lobsters"
      :key="lobster.id"
      class="lobster"
      :style="{
        animationDelay: lobster.delay,
        animationDuration: lobster.duration,
        fontSize: lobster.size,
        bottom: lobster.bottom,
      }"
      >🦞</span
    >
  </div>
</template>

<style scoped>
.lobster-parade {
  position: fixed;
  inset: auto 0 0 0;
  height: 6rem;
  overflow: hidden;
  pointer-events: none;
  z-index: 55;
}

.lobster {
  position: absolute;
  left: -10vw;
  line-height: 1;
  animation-name: lobster-walk;
  animation-timing-function: linear;
  animation-fill-mode: both;
}

@keyframes lobster-walk {
  from {
    transform: translateX(0) rotate(-8deg);
  }
  50% {
    transform: translateX(60vw) rotate(8deg);
  }
  to {
    transform: translateX(125vw) rotate(-8deg);
  }
}

/* Sans animation, les homards se contentent de s'aligner en bas de l'ecran. */
@media (prefers-reduced-motion: reduce) {
  .lobster {
    position: static;
    display: inline-block;
    margin: 0 0.35rem;
    animation: none;
  }
  .lobster-parade {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 1rem;
  }
}
</style>
