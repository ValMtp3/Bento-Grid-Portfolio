<script setup>
import { projets } from '@/data/projets.js';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/pagination';
import { Keyboard, Pagination } from 'swiper/modules';
import ResponsiveImage from './ResponsiveImage.vue';
import SectionHeading from './SectionHeading.vue';

const featuredProjets = projets.slice(0, 6);

const getProjectLinkLabel = (project) => {
  if (project.linkLabel) return project.linkLabel;
  if (project.src.includes('github.com')) return 'Voir le dépôt';
  if (project.src.includes('huggingface.co')) return 'Tester la démo';
  return 'Découvrir le projet';
};
</script>

<template>
  <!-- ═══ Projects Section ═══ -->
  <section>
    <SectionHeading index="05" label="Portfolio" title="Projets" />
    <Swiper
      :modules="[Keyboard, Pagination]"
      :keyboard="{ enabled: true, onlyInViewport: true }"
      :pagination="{ clickable: true }"
      :space-between="16"
      :slides-per-view="1.1"
      :breakpoints="{
        640: { slidesPerView: 2.2, spaceBetween: 20 },
        1024: { slidesPerView: 3, spaceBetween: 24 },
      }"
      class="pb-12"
    >
      <SwiperSlide
        v-for="(project, index) in featuredProjets"
        :key="project.name"
        class="h-auto py-2"
      >
        <a
          :href="project.src"
          target="_blank"
          rel="noopener noreferrer"
          class="group bento-cell p-4 flex flex-col hover:scale-[1.02] hover:border-spicy-paprika-300 dark:hover:border-spicy-paprika-600 h-full justify-between"
        >
          <div>
            <p
              v-if="index === 0"
              class="mb-3 font-code text-[10px] uppercase tracking-[0.16em] text-spicy-paprika-600 dark:text-spicy-paprika-400"
            >
              ~ featured project
            </p>
            <ResponsiveImage
              :alt="project.alt"
              :src="project.image"
              class="mb-3 h-40 w-full rounded-md border border-coffee-bean-100 bg-white object-contain dark:border-coffee-bean-800"
              loading="lazy"
              sizes="(max-width: 639px) calc(91vw - 29px), (max-width: 1023px) calc(45vw - 22px), (max-width: 1279px) calc(33vw - 21px), 400px"
            />
            <h3
              class="font-heading font-bold text-coffee-bean-950 dark:text-soft-blush-50 mb-1 group-hover:text-spicy-paprika-500 dark:group-hover:text-spicy-paprika-400 transition-colors"
            >
              {{ project.name }}
            </h3>
            <p class="mb-3 text-sm text-coffee-bean-600 dark:text-soft-blush-300 line-clamp-3">
              {{ project.description }}
            </p>
          </div>
          <div>
            <div class="flex flex-wrap gap-1.5 mt-auto">
              <span
                v-for="techno in project.technos.slice(0, 3)"
                :key="techno"
                class="border-l-2 border-regal-navy-400 bg-regal-navy-50/60 px-2 py-0.5 font-code text-[10px] uppercase tracking-wide text-regal-navy-700 dark:border-regal-navy-500 dark:bg-regal-navy-950/30 dark:text-regal-navy-200"
              >
                {{ techno }}
              </span>
            </div>
            <p class="text-xs font-code text-coffee-bean-500 dark:text-soft-blush-400 mt-2">
              {{ project.date }}
            </p>
            <p
              class="mt-3 font-code text-[10px] font-semibold uppercase tracking-wide text-spicy-paprika-600 dark:text-spicy-paprika-400"
            >
              {{ getProjectLinkLabel(project) }} →
            </p>
          </div>
        </a>
      </SwiperSlide>
    </Swiper>
    <div class="flex justify-center mt-2">
      <router-link
        to="/projets"
        class="font-code bg-spicy-paprika-500 hover:bg-spicy-paprika-600 text-soft-blush-50 px-6 py-2.5 shadow-md shadow-spicy-paprika-500/30 transition-all duration-300"
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
