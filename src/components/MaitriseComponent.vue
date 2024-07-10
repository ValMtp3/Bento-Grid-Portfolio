<script setup >
defineProps({
  image: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  }
})
</script >

<template>
  <div class="flex flex-col xl:flex-col items-center justify-center">
    <img :alt="alt" :src="image" :title="title" class="w-10 h-10 lg:w-16 lg:h-16 xl:w-32 xl:h-32">
    <div class="p-4 text-center">
      <p class="mt-1 text-xl text-neutral-900">{{ title }}</p>
    </div>
  </div>
</template>