<script setup>
import {
  getProjectAnalyticsAction,
  getProjectLinkLabel,
  projets,
} from '@/data/projets.js';
import ResponsiveImage from '@/components/ResponsiveImage.vue';
import SectionHeading from '@/components/SectionHeading.vue';
import { trackMatomoEvent } from '@/matomo';
</script>

<template>
  <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
    <SectionHeading :level="1" index="05" label="Portfolio" title="Projets réalisés" />
    <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
      <article
        v-for="proj in projets"
        :key="proj.name"
        class="bento-cell flex h-full flex-col p-5 sm:p-6"
      >
        <ResponsiveImage
          :alt="proj.alt"
          :src="proj.image"
          class="mb-5 h-48 w-full rounded-md border border-coffee-bean-100 bg-white object-contain sm:h-56 dark:border-coffee-bean-800"
          loading="lazy"
          sizes="(max-width: 639px) calc(100vw - 72px), (max-width: 767px) calc(100vw - 96px), (max-width: 1279px) calc(50vw - 82px), 550px"
        />
        <div class="mb-3 flex flex-wrap gap-2">
          <span class="tag tag-paprika">
            {{ proj.team }}
          </span>
          <time class="tag tag-navy">
            {{ proj.date }}
          </time>
        </div>
        <h2 class="mb-2 font-heading text-xl font-bold text-coffee-bean-950 dark:text-soft-blush-50 sm:text-2xl">
          {{ proj.name }}
        </h2>
        <p class="text-base leading-relaxed text-coffee-bean-700 dark:text-soft-blush-200">
          {{ proj.descriptionlongue }}
        </p>
        <div v-if="proj.technos?.length" class="mt-5 flex flex-wrap gap-2">
          <span
            v-for="techno in proj.technos"
            :key="`${proj.name}-${techno}`"
            class="border-l-2 border-regal-navy-400 bg-regal-navy-50/50 px-2 py-1 font-code text-[10px] uppercase tracking-wide text-regal-navy-700 dark:border-regal-navy-500 dark:bg-regal-navy-950/20 dark:text-regal-navy-300"
          >
            {{ techno }}
          </span>
        </div>
        <a
          :href="proj.src"
          target="_blank"
          rel="noopener noreferrer"
          @click="trackMatomoEvent('portfolio_project', getProjectAnalyticsAction(proj), proj.name)"
          class="mt-6 inline-flex self-start bg-spicy-paprika-500 px-5 py-2.5 font-code text-sm font-medium text-soft-blush-50 shadow-md shadow-spicy-paprika-500/30 transition-all duration-300 hover:bg-spicy-paprika-600 hover:shadow-lg"
        >
          {{ getProjectLinkLabel(proj) }}
        </a>
      </article>
    </div>
  </main>
</template>
