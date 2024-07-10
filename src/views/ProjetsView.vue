<script setup>
import { ref } from 'vue';
import { projets } from '@/data/projets.js';

const projetsAffiches = ref(projets);
</script>

<template>
  <div class="mx-auto grid grid-cols-1 md:grid-cols-2 p-8 md:p-16 lg:p-24 gap-8 md:gap-16 lg:gap-24">
    <div v-for="proj in projetsAffiches" :key="proj.name" class="p-4">
      <img
          :alt="proj.alt" :src="proj.image"
          class="mx-auto mb-4 md:mb-6 lg:mb-10 rounded-xl w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40" >
      <p class="text-primary-500 text-xs md:text-sm font-light text-center">
        {{ proj.team }} •
        <time>{{ proj.date }}</time>
      </p>
      <div class="p-4 text-center px-6 md:px-8 lg:px-10">
        <p class="mt-1 text-base md:text-lg lg:text-xl text-neutral-900">{{ proj.descriptionlongue }}</p>
        <a :href="proj.src" target="_blank">
          <button
              class="ml-auto transform hover:scale-110 motion-reduce:transform-none
              font-light rounded-xl p-2 m-2 md:m-4 lg:m-5 underline">
            {{ proj.name }}
          </button>
        </a>
      </div>
    </div>
  </div>
</template>
