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
        class="w-12 h-12 lg:w-20 lg:h-20 xl:w-40 xl:h-40 rounded-3xl " >
    <div class="p-4 text-center" >
      <p class="mt-1 md:text-md font-bold xl:text-xl text-neutral-900 flex justify-center text-start" >{{ name }}</p >
      <p class="md:text-sm xl:text-base mt-1 text-neutral-700 flex justify-center text-start" >{{ role }}</p >
    </div >
  </div >
</template >