<script setup>
import { computed } from 'vue';
import SectionHeading from '@/components/SectionHeading.vue';
import { projets } from '@/data/projets.js';
import { trackMatomoEvent } from '@/matomo';

// Les articles du blog sont les projets qui ont une etude de cas : la carte
// projet et l'article partagent la meme source, l'ordre du tableau projets
// (du plus recent au plus ancien) fait l'ordre de lecture.
const articles = computed(() => projets.filter((projet) => projet.caseStudy));
</script>

<template>
  <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
    <SectionHeading :level="1" index="07" label="Blog" title="Écrits & études de cas" />

    <p class="mb-8 max-w-2xl text-base leading-relaxed text-coffee-bean-700 dark:text-soft-blush-200">
      Chaque projet qui le mérite a son étude de cas : l'architecture, les arbitrages et le
      point dur. De nouveaux articles paraissent au fil des réalisations.
    </p>

    <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
      <article
        v-for="article in articles"
        :key="article.name"
        class="bento-cell flex h-full flex-col p-5 sm:p-6"
      >
        <div class="mb-3 flex flex-wrap gap-2">
          <span class="tag tag-paprika">Étude de cas</span>
          <time class="tag tag-navy">{{ article.date }}</time>
        </div>
        <h2
          class="mb-2 font-heading text-xl font-bold text-coffee-bean-950 sm:text-2xl dark:text-soft-blush-50"
        >
          <router-link
            :to="article.caseStudy"
            @click="trackMatomoEvent('blog', 'open_article', article.name)"
            class="transition-colors hover:text-spicy-paprika-600 dark:hover:text-spicy-paprika-400"
          >
            {{ article.name }}
          </router-link>
        </h2>
        <p class="text-base leading-relaxed text-coffee-bean-700 dark:text-soft-blush-200">
          {{ article.description }}
        </p>
        <div v-if="article.technos?.length" class="mt-5 flex flex-wrap gap-2">
          <span
            v-for="techno in article.technos.slice(0, 4)"
            :key="`${article.name}-${techno}`"
            class="tag tag-navy py-0.5"
          >
            {{ techno }}
          </span>
        </div>
        <router-link
          :to="article.caseStudy"
          @click="trackMatomoEvent('blog', 'open_article', article.name)"
          class="mt-6 inline-flex w-fit font-code text-sm font-semibold text-spicy-paprika-600 hover:underline dark:text-spicy-paprika-400"
        >
          Lire l'article →
        </router-link>
      </article>
    </div>
  </main>
</template>
