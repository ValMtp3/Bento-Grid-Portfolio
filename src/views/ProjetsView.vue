<script setup >
import {ref} from 'vue';
import {projets} from '@/data/projets.js';

const projetsAffiches = ref(projets);
</script >

<template >
  <div class="mx-auto grid grid-cols-2 p-32 gap-24" >
    <div v-for="proj in projetsAffiches" :key="proj.name" >
      <img
          :alt=proj.alt :src=proj.image
          class="ext-center mx-auto mb-10 rounded-xl w-32 h-32" >
      <p class="text-primary-500 text-sm font-light text-center" >{{ proj.team }} •
        <time >{{ proj.date }}</time >
      </p >
      <div class="p-4 text-center px-10" >
        <p class="mt-1 text-xl text-neutral-900" >{{ proj.descriptionlongue }}</p >
        <a :href=proj.src target="_blank" >
          <button
              class="ml-auto transform hover:scale-110 motion-reduce:transform-none
            font-light rounded-xl
             p-2  m-5 underline" >{{ proj.name }}
          </button >
        </a >
      </div >
    </div >
  </div >
</template >