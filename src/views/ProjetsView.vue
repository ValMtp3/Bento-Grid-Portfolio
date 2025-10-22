<script setup>
import { ref } from 'vue';
import { projets } from '@/data/projets.js';
import ResponsiveImage from '@/components/ResponsiveImage.vue';
import { useMeta } from 'vue-meta';

// Meta tags pour la page Projets
useMeta({
  title: 'Projets | Valentin Fiess - Développeur Web & IA',
  meta: [
    {
      name: 'description',
      content:
        'Découvrez tous mes projets en développement web, intelligence artificielle et data science. Portfolio complet de Valentin Fiess, développeur à Montpellier.',
    },
    {
      name: 'keywords',
      content:
        'projets développement web, projets IA, portfolio projets, Valentin Fiess, Vue.js, Python, machine learning, projets étudiants',
    },
    { property: 'og:title', content: 'Projets | Valentin Fiess - Développeur Web & IA' },
    {
      property: 'og:description',
      content:
        'Découvrez tous mes projets en développement web, intelligence artificielle et data science.',
    },
    { property: 'og:image', content: '/assets/assets_index/WildLens.webp' },
    { property: 'og:url', content: 'https://www.valentin-fiess.fr/projets' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Projets | Valentin Fiess - Développeur Web & IA' },
    {
      name: 'twitter:description',
      content: 'Découvrez tous mes projets en développement web et IA.',
    },
    { name: 'twitter:image', content: '/assets/assets_index/WildLens.webp' },
    { name: 'author', content: 'Valentin Fiess' },
    { name: 'robots', content: 'index, follow' },
    { name: 'language', content: 'fr-FR' },
  ],
});

const projetsAffiches = ref(projets);
</script>

<template>
  <div
    class="mx-auto grid grid-cols-1 md:grid-cols-2 p-8 md:p-16 lg:p-24 gap-8 md:gap-16 lg:gap-24 dark:bg-dark-bg"
  >
    <div
      v-for="proj in projetsAffiches"
      :key="proj.name"
      class="p-4 bg-white dark:bg-dark-card rounded-lg shadow-md"
    >
      <ResponsiveImage
        :alt="proj.alt"
        :src="proj.image"
        class="mx-auto mb-4 md:mb-6 lg:mb-10 rounded-xl w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40"
        loading="lazy"
      />
      <p class="text-primary-500 text-xs md:text-sm font-light text-center dark:text-blue-300">
        {{ proj.team }} •
        <time>{{ proj.date }}</time>
      </p>
      <div class="p-4 text-center px-6 md:px-8 lg:px-10">
        <p class="mt-1 text-base md:text-lg lg:text-xl text-neutral-900 dark:text-white">
          {{ proj.descriptionlongue }}
        </p>
        <a :href="proj.src" target="_blank">
          <button
            class="ml-auto transform hover:scale-110 motion-reduce:transform-none font-light rounded-xl p-2 m-2 md:m-4 lg:m-5 underline text-primary-500 dark:text-blue-300"
          >
            {{ proj.name }}
          </button>
        </a>
      </div>
    </div>
  </div>
</template>
