<script setup>
defineProps({
  image: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  team: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  src: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  }
});
</script>

<template>
  <div class="mx-auto max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl overflow-hidden rounded-xl bg-transparent">
    <img
        :alt="alt"
        :src="image"
        class="text-center mx-auto mb-4 sm:mb-6 md:mb-8 lg:mb-10 xl:mb-12 rounded-xl w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56"
    >
    <div class="p-4 text-center">
      <p class="mt-1 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-neutral-900">{{ description }}</p>
      <a :href="src" target="_blank">
        <button
            class="ml-auto transform hover:scale-110 motion-reduce:transform-none font-light rounded-xl p-2 m-2 sm:m-3 md:m-4 lg:m-5 xl:m-6 underline"
        >
          {{ name }}
        </button>
      </a>
    </div>
  </div>
</template>
