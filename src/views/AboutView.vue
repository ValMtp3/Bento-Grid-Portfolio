<script setup>
// Les balises meta de la page sont appliquees par App.vue depuis router/index.js.
// Le contenu vit dans src/data/agent-content.js, partage avec le jumeau
// Markdown /about.md servi aux agents : une seule source, deux formats.
import DocArticle from '@/components/include/DocArticle.vue';
import ResponsiveImage from '@/components/ResponsiveImage.vue';
</script>

<template>
  <main class="mx-auto max-w-3xl px-4 pt-8 sm:px-6 sm:pt-10">
    <!-- Photo en sticker : cercle, contour blanc, legere rotation, taille moderee. -->
    <div class="mb-2 flex justify-center">
      <ResponsiveImage
        src="/assets/assets_index/AboutPhoto.png"
        alt="Photo de Valentin Fiess"
        class="h-24 w-24 -rotate-3 rounded-full border-4 border-white object-cover object-top shadow-lg shadow-coffee-bean-950/15 sm:h-28 sm:w-28"
        sizes="(max-width: 639px) 96px, 112px"
        loading="eager"
        fetchpriority="high"
      />
    </div>
    <DocArticle slug="about" />
  </main>
</template>
