<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';

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
      :modules="[Pagination]"
      :pagination="{ clickable: true }"
      class="mySwiper"
    >
      <SwiperSlide v-for="(client, idx) in clients" :key="idx">
        <div class="flex flex-col items-center">
          <img
            :alt="client.alt"
            :src="client.image"
            :title="client.name"
            class="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-3xl dark:filter dark:brightness-90 transition-all"
          />
          <div class="p-4 text-center">
            <p class="mt-1 text-md font-bold text-neutral-900 dark:text-dark-primary">
              {{ client.name }}
            </p>
            <h2 class="text-sm text-neutral-700 dark:text-dark-secondary mt-1">
              {{ client.role }}
            </h2>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>
  </div>
</template>