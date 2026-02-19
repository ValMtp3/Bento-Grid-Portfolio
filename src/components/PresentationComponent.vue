<script setup>
import ResponsiveImage from './ResponsiveImage.vue';
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 font-[AnonymousPro] p-1 rounded-3xl w-full max-w-none shadow-md dark:shadow-gray-900 transition-all duration-300"
  >
    <div class="flex flex-col items-center xl:flex-row xlm:justify-between m-10">
      <div class="mb-6 sm:mb-0">
        <ResponsiveImage
          alt="Photo de Valentin Fiess, développeur Data et IA à Montpellier"
          class="rounded-3xl object-cover shadow-xl shadow-black/40 dark:shadow-black/70 h-72 w-72 dark:border dark:border-gray-600"
          src="/assets/assets_index/Profile.webp"
          loading="eager"
          fetchpriority="high"
        />
      </div>
      <div class="text-center">
        <h1
          class="text-xl sm:text-3xl font-regular mx-20 mb-6 font-bold text-black dark:text-white"
        >
          Valentin Fiess
        </h1>
        <h2 class="text-base sm:text-lg underline mx-20 mb-6 text-black dark:text-blue-400">
          Développeur Data & IA à Montpellier
        </h2>
        <p class="max-w-md px-10 text-black dark:text-gray-300">
          J'ai 23 ans, diplômé d'une Licence Développeur Data/IA à l'EPSI Montpellier. Je suis
          actuellement à la recherche d'un emploi dans la Data ou l'Intelligence Artificielle.
        </p>
      </div>
    </div>
  </div>
</template>
