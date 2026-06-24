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
  {
    alt: 'Logo EPSI Montpellier',
    image: '/assets/assets_index/epsi.svg',
    name: 'EPSI Montpellier',
    role: 'Licence Développeur Data/IA',
  },
];
</script>

<template>
  <!-- ═══ entreprise Section ═══ -->
  <section id="entreprises">
    <h2
      class="text-xl sm:text-2xl font-heading font-bold text-regal-navy-700 dark:text-regal-navy-300 mb-4 text-center"
    >
      Entreprises
    </h2>
    <Swiper
      :modules="[Pagination]"
      :pagination="{ clickable: true }"
      :space-between="12"
      :slides-per-view="1.35"
      :breakpoints="{
        640: { slidesPerView: 2.6, spaceBetween: 14 },
        1024: { slidesPerView: 4, spaceBetween: 16 },
      }"
      class="entreprise-swiper pb-2"
    >
      <SwiperSlide v-for="client in entreprise" :key="client.name" class="h-auto py-2">
        <div class="bento-cell p-4 flex flex-col items-center text-center h-full justify-between">
          <div class="flex flex-col items-center">
            <ResponsiveImage
              :alt="client.alt"
              :src="client.image"
              :title="client.name"
              class="w-20 h-16 md:w-24 md:h-20 object-contain mb-3"
              loading="lazy"
            />
            <p class="font-heading font-bold text-sm text-coffee-bean-950 dark:text-soft-blush-50">
              {{ client.name }}
            </p>
          </div>
          <span
            class="inline-block mt-2 text-[11px] font-code text-soft-blush-50 bg-spicy-paprika-500 px-2 py-0.5"
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
:deep(.swiper-pagination) {
  position: static;
  margin-top: 10px;
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
