<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import { Autoplay } from 'swiper/modules';
import ResponsiveImage from './ResponsiveImage.vue';
import SectionHeading from './SectionHeading.vue';

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

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
</script>

<template>
  <!-- ═══ entreprise Section ═══ -->
  <section>
    <SectionHeading index="01" label="Réseau" title="Entreprises" />
    <Swiper
      :modules="[Autoplay]"
      :loop="true"
      :speed="5000"
      :autoplay="prefersReducedMotion ? false : {
        delay: 0,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }"
      :space-between="12"
      :slides-per-view="1.35"
      :breakpoints="{
        640: { slidesPerView: 2.6, spaceBetween: 14 },
        1024: { slidesPerView: 4, spaceBetween: 16 },
      }"
      class="entreprise-swiper"
    >
      <SwiperSlide v-for="client in entreprise" :key="client.name" class="h-auto py-2">
        <div class="bento-cell p-3 flex flex-col items-center text-center h-full justify-between">
          <div class="flex flex-col items-center">
            <ResponsiveImage
              :alt="client.alt"
              :src="client.image"
              :title="client.name"
              class="w-16 h-12 md:w-20 md:h-16 object-contain mb-2"
              loading="lazy"
              sizes="(max-width: 767px) 64px, 80px"
            />
            <p class="font-heading font-bold text-sm text-coffee-bean-950 dark:text-soft-blush-50">
              {{ client.name }}
            </p>
          </div>
          <span
            class="mt-1.5 inline-block border-l-2 border-spicy-paprika-400 bg-spicy-paprika-50/80 px-2 py-0.5 font-code text-[10px] uppercase tracking-wide text-spicy-paprika-700 dark:border-spicy-paprika-500 dark:bg-spicy-paprika-950/40 dark:text-spicy-paprika-200"
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
:deep(.swiper-wrapper) {
  transition-timing-function: linear;
}
</style>
