<script setup>
import { projets } from '@/data/projets.js';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import ResponsiveImage from './ResponsiveImage.vue';

const featuredProjets = projets.slice(0, 6);
</script>

<template>
  <!-- ═══ Projects Section ═══ -->
  <section>
    <h2
      class="text-xl sm:text-2xl font-heading font-bold text-spicy-paprika-600 dark:text-spicy-paprika-400 mb-4 text-center"
    >
      Projets
    </h2>
    <Swiper
      :modules="[Pagination]"
      :pagination="{ clickable: true }"
      :space-between="16"
      :slides-per-view="1.1"
      :breakpoints="{
        640: { slidesPerView: 2.2, spaceBetween: 20 },
        1024: { slidesPerView: 3, spaceBetween: 24 }
      }"
      class="pb-12"
    >
      <SwiperSlide
        v-for="project in featuredProjets"
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
            <ResponsiveImage
              :alt="project.alt"
              :src="project.image"
              class="w-full h-40 object-contain bg-white mb-3"
              loading="lazy"
            />
            <h3
              class="font-heading font-bold text-coffee-bean-950 dark:text-soft-blush-50 mb-1 group-hover:text-spicy-paprika-500 dark:group-hover:text-spicy-paprika-400 transition-colors"
            >
              {{ project.name }}
            </h3>
            <p class="text-sm text-coffee-bean-600 dark:text-soft-blush-300 mb-2 line-clamp-2">
              {{ project.description }}
            </p>
          </div>
          <div>
            <div class="flex flex-wrap gap-1.5 mt-auto">
              <span
                v-for="techno in project.technos.slice(0, 3)"
                :key="techno"
                class="font-code text-xs px-2 py-0.5 bg-regal-navy-100 dark:bg-regal-navy-800 text-regal-navy-700 dark:text-regal-navy-200"
              >
                {{ techno }}
              </span>
            </div>
            <p class="text-xs font-code text-coffee-bean-500 dark:text-soft-blush-400 mt-2">
              {{ project.date }}
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
