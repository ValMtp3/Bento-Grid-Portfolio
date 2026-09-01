<script setup>
import ResponsiveImage from './ResponsiveImage.vue';
import { trackMatomoEvent } from '@/matomo';
</script>

<template>
  <!-- Carte profil -->
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
            sizes="(max-width: 639px) 160px, 192px"
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
            Je construis des assistants RAG et des pipelines de données, du prototype à la mise
            en production. Aujourd'hui chez Shaarp, sur une application SaaS IA pour des équipes
            commerciales.
          </p>
        </div>
      </div>
      <div class="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <span class="tag tag-navy py-1.5 text-center">IA / MLOps</span>
        <span class="tag tag-paprika py-1.5 text-center">Data</span>
        <span class="tag tag-paprika py-1.5 text-center">Python</span>
        <span class="tag tag-paprika py-1.5 text-center">RAG</span>
      </div>
    </div>
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <a
        href="/assets/assets_index/CV_Valentin_Fiess.pdf"
        download="CV_Valentin_Fiess.pdf"
        @click="trackMatomoEvent('portfolio_cta', 'download_cv', 'hero')"
        class="inline-flex items-center justify-center bg-spicy-paprika-500 px-6 py-2.5 font-code text-sm text-soft-blush-50 shadow-sm shadow-spicy-paprika-500/25 transition-colors hover:bg-spicy-paprika-600"
      >
        Télécharger mon CV
      </a>
      <a
        href="/assets/assets_index/CV_Valentin_Fiess.pdf"
        target="_blank"
        rel="noopener noreferrer"
        @click="trackMatomoEvent('portfolio_cta', 'view_cv', 'hero')"
        class="inline-flex items-center justify-center border border-regal-navy-300 px-6 py-2.5 font-code text-sm text-regal-navy-700 transition-colors hover:border-regal-navy-500 hover:bg-regal-navy-50 dark:border-regal-navy-700 dark:text-regal-navy-200 dark:hover:bg-regal-navy-950/40"
      >
        Voir mon CV
      </a>
    </div>
  </div>
</template>
