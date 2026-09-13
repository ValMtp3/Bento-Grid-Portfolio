<script setup>
import {
  getProjectAnalyticsAction,
  getProjectLinkLabel,
  projetsArchives,
  projetsFeatured,
} from '@/data/projets.js';
import ProjectCard from '@/components/ProjectCard.vue';
import SectionHeading from '@/components/SectionHeading.vue';
import { trackMatomoEvent } from '@/matomo';
</script>

<template>
  <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
    <SectionHeading :level="1" index="05" label="Portfolio" title="Projets réalisés" />

    <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
      <ProjectCard
        v-for="(proj, index) in projetsFeatured"
        :key="proj.name"
        :project="proj"
        :badge="index === 0 ? '~ projet principal' : ''"
      />
    </div>

    <!-- Les projets anciens restent consultables sans occuper la meme surface
         que les projets recents : un recruteur voit huit projets, pas vingt. -->
    <details class="group mt-10">
      <summary
        class="cursor-pointer list-none font-code text-sm uppercase tracking-[0.16em] text-coffee-bean-600 transition-colors hover:text-spicy-paprika-600 dark:text-soft-blush-300 dark:hover:text-spicy-paprika-400"
      >
        <span class="text-spicy-paprika-500">+</span>
        Archives — {{ projetsArchives.length }} projets antérieurs
        <span class="inline-block transition-transform group-open:rotate-90">›</span>
      </summary>

      <ul class="mt-6 flex flex-col gap-3">
        <li
          v-for="proj in projetsArchives"
          :key="proj.name"
          class="bento-cell flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="min-w-0">
            <h2 class="font-heading font-bold text-coffee-bean-950 dark:text-soft-blush-50">
              {{ proj.name }}
            </h2>
            <p class="text-sm text-coffee-bean-600 dark:text-soft-blush-300">
              {{ proj.description }}
            </p>
          </div>
          <div class="flex shrink-0 flex-wrap items-center gap-2">
            <span
              v-for="techno in proj.technos.slice(0, 3)"
              :key="`${proj.name}-${techno}`"
              class="tag tag-navy py-0.5"
            >
              {{ techno }}
            </span>
            <time class="font-code text-xs text-coffee-bean-500 dark:text-soft-blush-400">
              {{ proj.date }}
            </time>
            <a
              v-if="proj.src"
              :href="proj.src"
              target="_blank"
              rel="noopener noreferrer"
              @click="
                trackMatomoEvent('portfolio_project', getProjectAnalyticsAction(proj), proj.name)
              "
              class="font-code text-xs font-semibold text-spicy-paprika-600 hover:underline dark:text-spicy-paprika-400"
            >
              {{ getProjectLinkLabel(proj) }} →
            </a>
          </div>
        </li>
      </ul>
    </details>
  </main>
</template>
