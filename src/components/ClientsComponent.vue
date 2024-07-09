<script setup >
defineProps(
    {
      alt: {
        type: String,
        required: true
      },
      image: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      role: {
        type: String,
        required: true
      },
    }
)
</script >

<template >
  <div class="flex flex-col items-center" >
    <img
        :alt="alt" :src="image"
        :title="name"
        class="w-40 h-40 rounded-3xl " >
    <div class="p-4 text-center" >
      <p class="mt-1 text-xl text-neutral-900 flex justify-center text-start" >{{ name }}</p >
      <p class="text-base mt-1 text-neutral-700 flex justify-center text-start" >{{ role }}</p >
    </div >
  </div >
</template >