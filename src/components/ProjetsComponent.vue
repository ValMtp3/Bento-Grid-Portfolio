<script setup>
import {
  getProjectAnalyticsAction,
  getProjectLinkLabel,
  projetsFeatured,
} from '@/data/projets.js';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/pagination';
import { Keyboard, Pagination } from 'swiper/modules';
import ResponsiveImage from './ResponsiveImage.vue';
import SectionHeading from './SectionHeading.vue';
import { trackMatomoEvent } from '@/matomo';

// Six premieres cartes du carrousel : projetsFeatured est trie du plus recent
// au plus ancien (voir src/data/projets.js).
const featuredProjets = projetsFeatured.slice(0, 6);
</script>

<template>
  <!-- ══════ Projects Section ══════ -->
  <section>
    <SectionHeading index="05" label="Portfolio" title="Projets" />
    <!-- slidesPerView entier a chaque breakpoint : aucune carte n'est partiellement
         visible au bord droit, donc rien n'est coupe (ni au survol). -->
    <Swiper
      :modules="[Keyboard, Pagination]"
      :keyboard="{ enabled: true, onlyInViewport: true }"
      :pagination="{ clickable: true }"
      :space-between="16"
      :slides-per-view="1"
      :breakpoints="{
        640: { slidesPerView: 2, spaceBetween: 20 },
        1024: { slidesPerView: 3, spaceBetween: 24 },
      }"
      class="pb-12"
    >
      <SwiperSlide
        v-for="(project, index) in featuredProjets"
        :key="project.name"
        class="h-auto py-2"
      >
        <article
          class="group bento-cell flex h-full flex-col justify-between p-4 transition-all duration-300 hover:-translate-y-1 hover:border-spicy-paprika-300 dark:hover:border-spicy-paprika-600"
        >
          <div>
            <p
              v-if="index === 0"
              class="mb-3 font-code text-[10px] uppercase tracking-[0.16em] text-spicy-paprika-600 dark:text-spicy-paprika-400"
            >
              ~ featured project
            </p>
            <a
              v-if="project.src"
              :href="project.src"
              target="_blank"
              rel="noopener noreferrer"
              @click="
                trackMatomoEvent('portfolio_project', getProjectAnalyticsAction(project), project.name)
              "
              class="block"
            >
              <ResponsiveImage
                :alt="project.alt"
                :src="project.image"
                class="mb-3 h-40 w-full rounded-md border border-coffee-bean-100 bg-white object-contain transition-opacity group-hover:opacity-90 dark:border-coffee-bean-800"
                loading="lazy"
                sizes="(max-width: 639px) calc(100vw - 64px), (max-width: 1023px) calc(50vw - 44px), (max-width: 1279px) calc(33vw - 40px), 400px"
              />
              <h3
                class="mb-1 font-heading font-bold text-coffee-bean-950 transition-colors group-hover:text-spicy-paprika-500 dark:text-soft-blush-50 dark:group-hover:text-spicy-paprika-400"
              >
                {{ project.name }}
              </h3>
            </a>
            <h3
              v-else
              class="mb-1 font-heading font-bold text-coffee-bean-950 dark:text-soft-blush-50"
            >
              {{ project.name }}
            </h3>
            <p class="mb-3 text-sm text-coffee-bean-600 line-clamp-3 dark:text-soft-blush-300">
              {{ project.description }}
            </p>
          </div>
          <div>
            <div class="mt-auto flex flex-wrap gap-1.5">
              <span
                v-for="techno in project.technos.slice(0, 3)"
                :key="techno"
                class="tag tag-navy py-0.5"
              >
                {{ techno }}
              </span>
            </div>
            <p class="mt-2 text-xs font-code text-coffee-bean-500 dark:text-soft-blush-400">
              {{ project.date }}
            </p>
            <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
              <a
                v-if="project.src"
                :href="project.src"
                target="_blank"
                rel="noopener noreferrer"
                @click="
                  trackMatomoEvent(
                    'portfolio_project',
                    getProjectAnalyticsAction(project),
                    project.name,
                  )
                "
                class="font-code text-[10px] font-semibold uppercase tracking-wide text-spicy-paprika-600 hover:underline dark:text-spicy-paprika-400"
              >
                {{ getProjectLinkLabel(project) }} →
              </a>
              <router-link
                v-if="project.caseStudy"
                :to="project.caseStudy"
                @click="trackMatomoEvent('portfolio_project', 'open_case_study', project.name)"
                class="inline-flex border border-regal-navy-300 px-3 py-1.5 font-code text-[10px] font-semibold uppercase tracking-wide text-regal-navy-700 transition-colors hover:border-regal-navy-500 hover:bg-regal-navy-50 dark:border-regal-navy-700 dark:text-regal-navy-200 dark:hover:bg-regal-navy-950/40"
              >
                Lire l’étude de cas
              </router-link>
            </div>
          </div>
        </article>
      </SwiperSlide>
    </Swiper>
    <div class="mt-2 flex justify-center">
      <router-link
        to="/projets"
        class="bg-spicy-paprika-700 px-6 py-2.5 font-code text-soft-blush-50 shadow-md shadow-spicy-paprika-500/30 transition-all duration-300 hover:bg-spicy-paprika-800 dark:bg-spicy-paprika-500 dark:text-coffee-bean-950 dark:hover:bg-spicy-paprika-400"
      >
        Voir tous les projets
      </router-link>
    </div>
  </section>
</template>

<style scoped>
:deep(.swiper-slide) {
  height: auto;
}
:deep(.swiper-pagination-bullet) {
  background-color: var(--color-coffee-bean-300, #db6b3e);
  opacity: 0.4;
  transition: all 0.3s ease;
}
:deep(.swiper-pagination-bullet-active) {
  background-color: var(--color-spicy-paprika-500, #e4501b) !important;
  opacity: 1;
  width: 20px;
  border-radius: 4px;
}
</style>
