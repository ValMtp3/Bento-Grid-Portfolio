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
          alt="photo Valentin Fiess"
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
          Développeur Web/IA
        </h2>
        <h3 class="max-w-md px-10 text-black dark:text-gray-300">
          J'ai 23 ans et je suis un développeur débutant à Montpellier et etudiant a l'EPSI, je
          m'intéresse aux nouvelles technologies, notamment celle du web et de l'IA.
        </h3>
      </div>
    </div>
  </div>
</template>
