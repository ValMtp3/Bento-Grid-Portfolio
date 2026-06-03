<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';

defineProps({
  clients: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <div class="w-full max-w-screen-lg mx-auto overflow-hidden">
    <Swiper
      :breakpoints="{
        320: { slidesPerView: 1, spaceBetween: 10 },
        641: { slidesPerView: 2, spaceBetween: 20 },
        1025: { slidesPerView: 3, spaceBetween: 30 },
      }"
      :loop="true"
      :modules="[Navigation]"
      :navigation="{ nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }"
      class="mySwiper"
    >
      <SwiperSlide v-for="(client, idx) in clients" :key="idx">
        <div class="flex flex-col items-center">
          <img
            :alt="client.alt"
            :src="client.image"
            :title="client.name"
            class="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-3xl"
          />
          <div class="p-4 text-center">
            <p class="mt-1 text-md font-bold font-code text-regal-navy-700">{{ client.name }}</p>
            <span
              class="inline-block mt-1 text-xs font-heading text-soft-blush-50 bg-spicy-paprika-500 px-2 py-0.5 rounded-full"
              >{{ client.role }}</span
            >
          </div>
        </div>
      </SwiperSlide>
      <div class="swiper-button-next"></div>
      <div class="swiper-button-prev"></div>
    </Swiper>
  </div>
</template>

<style>
.swiper-button-next,
.swiper-button-prev {
  color: #123b7d;
}
</style>
