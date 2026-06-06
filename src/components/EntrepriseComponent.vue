<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import ResponsiveImage from './ResponsiveImage.vue';

const entreprise = [
  {
    alt: 'Logo Capgemini',
    image: '/assets/assets_index/capgemini.webp',
    name: 'Capgemini',
    role: 'Ambassadeur',
  },
  {
    alt: 'Logo R2D automation',
    image: '/assets/assets_index/R2D automation.webp',
    name: 'R2D Automation',
    role: 'Développeur IA/Client RAGUIA',
  },
  {
    alt: 'Logo Sport&Green',
    image: '/assets/assets_index/sportandgreen.webp',
    name: 'Sport&Green',
    role: 'Développeur web / Consultant SEO',
  },
  {
    alt: 'Logo from scratch',
    image: '/assets/assets_index/from_scratch.webp',
    name: 'From_Scratch',
    role: 'Développeur web',
  },
];
</script>

<template>
  <!-- ═══ entreprise Section ═══ -->
  <section>
    <h2
      class="text-xl sm:text-2xl font-heading font-bold text-regal-navy-700 dark:text-regal-navy-300 mb-4 text-center"
    >
      Entreprises
    </h2>
    <Swiper
      :modules="[Pagination]"
      :pagination="{ clickable: true }"
      :space-between="16"
      :slides-per-view="1.2"
      :breakpoints="{
        640: { slidesPerView: 2.2, spaceBetween: 20 },
        1024: { slidesPerView: 3, spaceBetween: 24 },
      }"
      class="pb-12"
    >
      <SwiperSlide v-for="client in entreprise" :key="client.name" class="h-auto py-2">
        <div class="bento-cell p-6 flex flex-col items-center text-center h-full justify-between">
          <div class="flex flex-col items-center">
            <ResponsiveImage
              :alt="client.alt"
              :src="client.image"
              :title="client.name"
              class="w-24 h-24 md:w-32 md:h-32 object-contain mb-4"
              loading="lazy"
            />
            <p class="font-heading font-bold text-coffee-bean-950 dark:text-soft-blush-50">
              {{ client.name }}
            </p>
          </div>
          <span
            class="inline-block mt-2 text-xs font-code text-soft-blush-50 bg-spicy-paprika-500 px-2 py-0.5"
          >
            {{ client.role }}
          </span>
        </div>
      </SwiperSlide>
    </Swiper>
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
