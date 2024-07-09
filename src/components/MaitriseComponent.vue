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

<template >
  <div >
    <img
        :alt="alt" :src="image"
        :title="title"
        class="w-32 h-32" >
    <div class="p-4 text-center" >
      <p class="mt-1 text-xl text-neutral-900 flex justify-center text-start" >{{ title }}</p >
    </div >
  </div >
</template >