<script setup>
import ResponsiveImage from './ResponsiveImage.vue';
import { getProjectAnalyticsAction, getProjectLinkLabel } from '@/data/projets.js';
import { trackMatomoEvent } from '@/matomo';

defineProps({
  project: { type: Object, required: true },
  badge: { type: String, default: '' },
});
</script>

<template>
  <article class="bento-cell flex h-full flex-col p-5 sm:p-6">
    <p
      v-if="badge"
      class="mb-3 font-code text-[10px] font-semibold uppercase tracking-[0.16em] text-spicy-paprika-600 dark:text-spicy-paprika-400"
    >
      {{ badge }}
    </p>
    <ResponsiveImage
      :alt="project.alt"
      :src="project.image"
      class="mb-5 h-48 w-full rounded-md border border-coffee-bean-100 bg-white object-contain sm:h-56 dark:border-coffee-bean-800"
      loading="lazy"
      sizes="(max-width: 639px) calc(100vw - 72px), (max-width: 767px) calc(100vw - 96px), (max-width: 1279px) calc(50vw - 82px), 550px"
    />
    <div class="mb-3 flex flex-wrap gap-2">
      <span class="tag tag-paprika">{{ project.team }}</span>
      <time class="tag tag-navy">{{ project.date }}</time>
    </div>
    <h2
      class="mb-2 font-heading text-xl font-bold text-coffee-bean-950 sm:text-2xl dark:text-soft-blush-50"
    >
      {{ project.name }}
    </h2>
    <p class="text-base leading-relaxed text-coffee-bean-700 dark:text-soft-blush-200">
      {{ project.descriptionlongue }}
    </p>
    <div v-if="project.technos?.length" class="mt-5 flex flex-wrap gap-2">
      <span
        v-for="techno in project.technos"
        :key="`${project.name}-${techno}`"
        class="border-l-2 border-regal-navy-400 bg-regal-navy-50/50 px-2 py-1 font-code text-[10px] uppercase tracking-wide text-regal-navy-700 dark:border-regal-navy-500 dark:bg-regal-navy-950/20 dark:text-regal-navy-300"
      >
        {{ techno }}
      </span>
    </div>
    <div class="mt-6 flex flex-wrap gap-3">
      <a
        v-if="project.src"
        :href="project.src"
        target="_blank"
        rel="noopener noreferrer"
        @click="
          trackMatomoEvent('portfolio_project', getProjectAnalyticsAction(project), project.name)
        "
        class="inline-flex bg-spicy-paprika-500 px-5 py-2.5 font-code text-sm font-medium text-soft-blush-50 shadow-md shadow-spicy-paprika-500/30 transition-all duration-300 hover:bg-spicy-paprika-600 hover:shadow-lg"
      >
        {{ getProjectLinkLabel(project) }}
      </a>
      <router-link
        v-if="project.caseStudy"
        :to="project.caseStudy"
        @click="trackMatomoEvent('portfolio_project', 'open_case_study', project.name)"
        class="inline-flex border border-regal-navy-300 px-5 py-2.5 font-code text-sm font-medium text-regal-navy-700 transition-colors hover:border-regal-navy-500 hover:bg-regal-navy-50 dark:border-regal-navy-700 dark:text-regal-navy-200 dark:hover:bg-regal-navy-950/40"
      >
        Lire l'étude de cas
      </router-link>
    </div>
  </article>
</template>
