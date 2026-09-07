<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { loadPulse } from '@/data/pulse';

// w185 couvre le cas le plus large (environ 130 px d'affichage sur grand
// ecran) sans telecharger la pleine resolution.
const POSTER_BASE = 'https://image.tmdb.org/t/p/w185';

// Plancher d'une vignette : en dessous, la bande defile au lieu de reduire.
const MIN_POSTER = 64;

const SERIES_COUNT = 5;
const FILMS_COUNT = 3;

const pulse = ref(null);
const loaded = ref(false);

const series = computed(() => pulse.value?.favoris?.series ?? []);
const films = computed(() => pulse.value?.favoris?.films ?? []);
const hasFavoris = computed(() => series.value.length > 0 || films.value.length > 0);

// Une seule liste a plat : toutes les vignettes sont soeurs dans la meme
// grille, ce qui garantit des colonnes identiques. Avec deux blocs flex
// separes, chacun avait sa propre base de repartition — les films se
// redimensionnaient sans les series.
const posters = computed(() => [
  ...series.value.map((entry, index) => ({ ...entry, type: 'tv', rank: index + 1 })),
  ...films.value.map((entry, index) => ({ ...entry, type: 'movie', rank: index + 1 })),
]);

// La colonne "auto" du milieu porte le filet ; toutes les autres sont en 1fr,
// donc elles remplissent la carte et restent egales entre elles.
const gridStyle = computed(() => ({
  gridTemplateColumns:
    `repeat(${SERIES_COUNT}, minmax(${MIN_POSTER}px, 1fr))` +
    ` auto repeat(${FILMS_COUNT}, minmax(${MIN_POSTER}px, 1fr))`,
}));

const seriesLabelColumn = { gridColumn: `1 / ${SERIES_COUNT + 1}` };
const dividerColumn = { gridColumn: `${SERIES_COUNT + 1}` };
const filmsLabelColumn = { gridColumn: `${SERIES_COUNT + 2} / -1` };

// Le fondu ne doit apparaitre que du cote ou il reste des affiches a atteindre.
const scroller = ref(null);
const atStart = ref(true);
const atEnd = ref(true);

const measure = () => {
  const element = scroller.value;
  if (!element) return;

  const max = element.scrollWidth - element.clientWidth;
  atStart.value = element.scrollLeft <= 1;
  atEnd.value = max <= 1 || element.scrollLeft >= max - 1;
};

const fadeStyle = computed(() => ({
  '--slider-fade-start': atStart.value ? '0px' : undefined,
  '--slider-fade-end': atEnd.value ? '0px' : undefined,
}));

onMounted(() => {
  window.addEventListener('resize', measure);
  loadPulse().then(async (data) => {
    pulse.value = data;
    loaded.value = true;
    await nextTick();
    measure();
  });
});

onBeforeUnmount(() => window.removeEventListener('resize', measure));
</script>

<template>
  <!-- Hors de la grille bento du haut : cette cellule ferme la page sans
       concurrencer le profil, les competences et les projets. -->
  <div class="bento-cell px-5 py-4 sm:px-6 sm:py-5">
    <p
      class="mb-3 font-code text-[10px] font-semibold uppercase tracking-[0.18em] text-spicy-paprika-600 dark:text-spicy-paprika-400"
    >
      $ mes préférés — séries &amp; films
    </p>

    <div
      ref="scroller"
      class="slider-fade grid gap-x-2.5 gap-y-2 overflow-x-auto pb-1 sm:gap-x-3"
      :style="{ ...gridStyle, ...fadeStyle }"
      @scroll.passive="measure"
    >
      <p
        :style="seriesLabelColumn"
        class="row-start-1 font-code text-[10px] uppercase tracking-[0.14em] text-regal-navy-600 dark:text-regal-navy-400"
      >
        ~ séries
      </p>
      <p
        :style="filmsLabelColumn"
        class="row-start-1 font-code text-[10px] uppercase tracking-[0.14em] text-regal-navy-600 dark:text-regal-navy-400"
      >
        ~ films
      </p>

      <!-- Filet separateur : sa colonne "auto" est la seule qui ne grandit pas,
           il garde donc la meme finesse a toutes les tailles. -->
      <span
        :style="dividerColumn"
        class="row-span-2 row-start-1 w-px justify-self-center bg-coffee-bean-200/60 dark:bg-soft-blush-50/10"
        aria-hidden="true"
      />

      <!-- Squelettes pendant le chargement seulement : meme grille, meme ratio,
           donc aucun decalage a l'arrivee des affiches. Le placement automatique
           saute la colonne du filet, deja occupee. La condition porte sur
           `loaded` et non sur le nombre d'affiches : une source en panne laissait
           sinon huit rectangles gris pulser a cote du message d'indisponibilite. -->
      <template v-if="!loaded">
        <div v-for="slot in SERIES_COUNT + FILMS_COUNT" :key="`skeleton-${slot}`" class="row-start-2">
          <span
            class="block aspect-[2/3] w-full rounded-md bg-coffee-bean-100 dark:bg-soft-blush-50/[0.06]"
            aria-hidden="true"
          />
          <span class="mt-1.5 block h-[15px]" aria-hidden="true" />
        </div>
      </template>

      <a
        v-for="entry in posters"
        :key="`${entry.type}-${entry.id}`"
        :href="`https://www.themoviedb.org/${entry.type}/${entry.id}`"
        target="_blank"
        rel="noopener noreferrer"
        class="poster-card group row-start-2 block min-w-0"
      >
        <span class="relative block">
          <img
            :src="`${POSTER_BASE}${entry.poster}`"
            :alt="`Affiche de ${entry.title}`"
            width="185"
            height="278"
            loading="lazy"
            decoding="async"
            class="poster-art aspect-[2/3] w-full rounded-md object-cover shadow-sm ring-1 ring-coffee-bean-950/10 group-hover:-translate-y-0.5 dark:ring-soft-blush-50/15"
          />
          <!-- Le rang est pose dans l'angle et non en debord : la bande
               defilante rognerait tout ce qui sort du cadre. -->
          <span
            class="absolute left-0 top-0 flex h-4 w-4 items-center justify-center rounded-br rounded-tl-md bg-spicy-paprika-500 font-code text-[9px] font-bold text-soft-blush-50"
            aria-hidden="true"
          >
            {{ entry.rank }}
          </span>
        </span>
        <span
          :title="entry.title"
          class="mt-1.5 block truncate font-code text-[10px] text-coffee-bean-700 group-hover:text-spicy-paprika-700 dark:text-soft-blush-300 dark:group-hover:text-spicy-paprika-300"
        >
          {{ entry.title }}
        </span>
      </a>
    </div>

    <p
      v-if="loaded && !hasFavoris"
      class="mt-2 font-code text-xs text-coffee-bean-600 dark:text-soft-blush-300"
    >
      Favoris momentanément indisponibles.
    </p>
  </div>
</template>
