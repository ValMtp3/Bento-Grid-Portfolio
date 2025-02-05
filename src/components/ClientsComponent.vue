<script setup >
import {Swiper, SwiperSlide} from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/pagination';
import {Pagination} from 'swiper/modules';

defineProps({
  alt: {type: String, required: true},
  image: {type: String, required: true},
  name: {type: String, required: true},
  role: {type: String, required: true}
});
</script >

<template >
  <div class="w-full max-w-screen-lg mx-auto overflow-hidden" >
    <Swiper
        :breakpoints="{
    320: { slidesPerView: 1, spaceBetween: 10 },
    641: { slidesPerView: 2, spaceBetween: 20 },
    1025: { slidesPerView: 3, spaceBetween: 30 }
  }"
        :loop="true"
        :modules="[Pagination]"
        :pagination="{ clickable: true }"
        class="mySwiper"
    >
      <SwiperSlide v-for="i in 3" :key="i" >
        <div class="flex flex-col items-center" >
          <img
              :alt="alt"
              :src="image"
              :title="name"
              class="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-3xl"
          />
          <div class="p-4 text-center" >
            <p class="mt-1 text-md font-bold text-neutral-900" >{{ name }}</p >
            <h2 class="text-sm text-neutral-700 mt-1" >{{ role }}</h2 >
          </div >
        </div >
      </SwiperSlide >
    </Swiper >
  </div >
</template >