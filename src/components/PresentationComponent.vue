<script setup>
import ResponsiveImage from './ResponsiveImage.vue';
</script>

<template>
  <!-- Profile Cell -->
  <div class="md:col-span-2 lg:row-span-2 bento-cell p-6 flex flex-col gap-6">
    <div>
      <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div class="relative shrink-0 select-none">
          <ResponsiveImage
            alt="Photo de Valentin Fiess"
            class="object-cover shadow-lg h-40 w-40 sm:h-48 sm:w-48 rounded-xl"
            src="/assets/assets_index/Profile.png"
            fetchpriority="high"
            loading="eager"
            decoding="sync"
          />
          <div
            class="absolute -bottom-2 -right-2 bg-white dark:bg-coffee-bean-900 border-2 border-spicy-paprika-500 rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-lg rotate-12 hover:rotate-0 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
            title="Salut, je suis Homard ! 🦞"
          >
            🦞
          </div>
        </div>
        <div class="text-center sm:text-left">
          <h1
            class="text-2xl sm:text-3xl font-bold font-heading text-coffee-bean-950 dark:text-soft-blush-50 mb-2"
          >
            Valentin Fiess
          </h1>
          <h2
            class="text-lg sm:text-xl font-heading text-regal-navy-600 dark:text-regal-navy-400 font-semibold mb-3"
          >
            Développeur Web & IA
          </h2>
          <p
            class="text-coffee-bean-700 dark:text-soft-blush-200 max-w-md text-base sm:text-lg leading-relaxed"
          >
            J'ai 24 ans, diplômé d'une Licence Développeur Data/IA à l'EPSI Montpellier. Je suis
            actuellement à la recherche d'un emploi dans la Data ou l'Intelligence Artificielle.
          </p>
        </div>
      </div>
      <div class="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <span
          class="font-code text-xs text-center px-2 py-2 border border-regal-navy-200 bg-regal-navy-50/80 text-regal-navy-700 dark:border-regal-navy-800 dark:bg-regal-navy-950/40 dark:text-regal-navy-200"
        >
          IA / MLOps
        </span>
        <span
          class="font-code text-xs text-center px-2 py-2 border border-coffee-bean-100 bg-soft-blush-100/70 text-coffee-bean-700 dark:border-soft-blush-50/10 dark:bg-coffee-bean-950/30 dark:text-soft-blush-200"
        >
          Data
        </span>
        <span
          class="font-code text-xs text-center px-2 py-2 border border-coffee-bean-100 bg-soft-blush-100/70 text-coffee-bean-700 dark:border-soft-blush-50/10 dark:bg-coffee-bean-950/30 dark:text-soft-blush-200"
        >
          Python
        </span>
        <span
          class="font-code text-xs text-center px-2 py-2 border border-coffee-bean-100 bg-soft-blush-100/70 text-coffee-bean-700 dark:border-soft-blush-50/10 dark:bg-coffee-bean-950/30 dark:text-soft-blush-200"
        >
          RAG
        </span>
      </div>
    </div>
    <a
      href="/assets/assets_index/CV_Valentin_Fiess.pdf"
      download="CV_Valentin_Fiess.pdf"
      class="inline-flex items-center gap-2 bg-spicy-paprika-500 hover:bg-spicy-paprika-600 text-soft-blush-50 px-6 py-2.5 shadow-sm shadow-spicy-paprika-500/25 transition-all duration-300 font-code self-center sm:self-start"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3"
        />
      </svg>
      Télécharger mon CV
    </a>
  </div>
</template>
