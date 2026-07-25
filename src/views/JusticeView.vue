<script setup>
// Titre et robots noindex sont appliques par App.vue depuis router/index.js.
const images = Object.values(
  import.meta.glob('@/assets/justice/*.{jpg,jpeg,png,webp,gif,svg}', {
    eager: true,
    import: 'default',
  }),
);
</script>

<template>
  <div class="bg-white text-gray-900 min-h-screen p-8">
    <h1 class="text-xl font-semibold mb-12 text-center">Pièces justificatives</h1>
    <div v-if="images.length === 0" class="text-center text-gray-500 mt-20">
      Aucune pièce déposée pour le moment.
    </div>
    <div v-else class="space-y-12 max-w-4xl mx-auto">
      <img
        v-for="(src, index) in images"
        :key="index"
        :src="src"
        :alt="`Pièce n°${index + 1}`"
        class="w-full h-auto border border-gray-200"
        loading="lazy"
      />
    </div>
  </div>
</template>
