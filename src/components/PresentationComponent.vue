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
            src="/assets/assets_index/Valentin_Fiess.webp"
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
          <p
            class="mb-1 font-code text-[10px] font-semibold uppercase tracking-[0.18em] text-spicy-paprika-600 dark:text-spicy-paprika-400"
          >
            $ profil data / IA
          </p>
          <h1
            class="text-2xl sm:text-3xl font-bold font-heading text-coffee-bean-950 dark:text-soft-blush-50 mb-1"
          >
            Valentin Fiess
          </h1>
          <h2
            class="text-lg sm:text-xl font-heading text-regal-navy-600 dark:text-regal-navy-400 font-semibold mb-3"
          >
            Développeur Data & IA
          </h2>
          <p
            class="text-coffee-bean-700 dark:text-soft-blush-200 max-w-md text-base sm:text-lg leading-relaxed"
          >
            Je développe des solutions d'intelligence artificielle, de RAG et de Data qui
            transforment des besoins métier en outils concrets, fiables et faciles à utiliser.
          </p>
        </div>
      </div>
      <div class="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <span
          class="border-l-2 border-regal-navy-400 bg-regal-navy-50/60 px-2 py-1.5 text-center font-code text-[10px] uppercase tracking-wide text-regal-navy-700 dark:border-regal-navy-500 dark:bg-regal-navy-950/30 dark:text-regal-navy-200"
        >
          IA / MLOps
        </span>
        <span
          class="border-l-2 border-spicy-paprika-400 bg-spicy-paprika-50/80 px-2 py-1.5 text-center font-code text-[10px] uppercase tracking-wide text-spicy-paprika-700 dark:border-spicy-paprika-500 dark:bg-spicy-paprika-950/40 dark:text-spicy-paprika-200"
        >
          Data
        </span>
        <span
          class="border-l-2 border-spicy-paprika-400 bg-spicy-paprika-50/80 px-2 py-1.5 text-center font-code text-[10px] uppercase tracking-wide text-spicy-paprika-700 dark:border-spicy-paprika-500 dark:bg-spicy-paprika-950/40 dark:text-spicy-paprika-200"
        >
          Python
        </span>
        <span
          class="border-l-2 border-spicy-paprika-400 bg-spicy-paprika-50/80 px-2 py-1.5 text-center font-code text-[10px] uppercase tracking-wide text-spicy-paprika-700 dark:border-spicy-paprika-500 dark:bg-spicy-paprika-950/40 dark:text-spicy-paprika-200"
        >
          RAG
        </span>
      </div>
    </div>
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <a
        href="/assets/assets_index/CV_Valentin_Fiess.pdf"
        download="CV_Valentin_Fiess.pdf"
        class="inline-flex items-center justify-center bg-spicy-paprika-500 px-6 py-2.5 font-code text-sm text-soft-blush-50 shadow-sm shadow-spicy-paprika-500/25 transition-colors hover:bg-spicy-paprika-600"
      >
        Télécharger mon CV
      </a>
      <a
        href="/assets/assets_index/CV_Valentin_Fiess.pdf"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center justify-center border border-regal-navy-300 px-6 py-2.5 font-code text-sm text-regal-navy-700 transition-colors hover:border-regal-navy-500 hover:bg-regal-navy-50 dark:border-regal-navy-700 dark:text-regal-navy-200 dark:hover:bg-regal-navy-950/40"
      >
        Voir mon CV
      </a>
    </div>
  </div>
</template>
