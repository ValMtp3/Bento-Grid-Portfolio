<script setup>
import { ref } from 'vue';
import { projets } from '@/data/projets.js';

const projetsAffiches = ref(projets);
</script>

<template>
  <div
    class="mx-auto grid grid-cols-1 md:grid-cols-2 p-8 md:p-16 lg:p-24 gap-8 md:gap-16 lg:gap-24 dark:text-soft-blush-200"
  >
    <div
      v-for="proj in projetsAffiches"
      :key="proj.name"
      class="p-4 bg-soft-blush-50 dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 rounded-xl shadow-lg shadow-coffee-bean-950/10 dark:shadow-black/20"
    >
      <img
        :alt="proj.alt"
        :src="proj.image"
        class="mx-auto mb-4 md:mb-6 lg:mb-10 rounded-xl w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40"
        loading="lazy"
      />
      <p class="flex justify-center gap-2 mb-2">
        <span
          class="bg-spicy-paprika-100 dark:bg-spicy-paprika-900/40 text-spicy-paprika-700 dark:text-spicy-paprika-300 text-xs md:text-sm font-code px-2 py-1 rounded-full"
          >{{ proj.team }}</span
        >
        <time
          class="bg-regal-navy-100 dark:bg-regal-navy-900/50 text-regal-navy-700 dark:text-regal-navy-300 text-xs md:text-sm font-code px-2 py-1 rounded-full"
          >{{ proj.date }}</time
        >
      </p>
      <div class="p-4 text-center px-6 md:px-8 lg:px-10">
        <h2
          class="mb-3 text-xl md:text-2xl font-semibold text-coffee-bean-950 dark:text-soft-blush-50"
        >
          {{ proj.name }}
        </h2>
        <p class="mt-1 text-base md:text-lg lg:text-xl text-coffee-bean-950 dark:text-soft-blush-200">
          {{ proj.descriptionlongue }}
        </p>
        <div v-if="proj.technos?.length" class="mt-5 flex flex-wrap justify-center gap-2">
          <span
            v-for="techno in proj.technos"
            :key="`${proj.name}-${techno}`"
            class="rounded-full bg-regal-navy-100 dark:bg-regal-navy-900/50 px-3 py-1 text-xs md:text-sm text-regal-navy-700 dark:text-regal-navy-300 font-code"
          >
            {{ techno }}
          </span>
        </div>
        <a :href="proj.src" target="_blank" rel="noopener noreferrer">
          <button
            class="ml-auto hover:scale-110 motion-reduce:transform-none font-code font-medium rounded-xl px-4 py-2 m-2 md:m-4 lg:m-5 bg-regal-navy-500 hover:bg-regal-navy-600 text-soft-blush-50 shadow-md shadow-regal-navy-500/30 transition-all duration-300"
          >
            {{ proj.linkLabel || proj.name }}
          </button>
        </a>
      </div>
    </div>
  </div>
</template>
