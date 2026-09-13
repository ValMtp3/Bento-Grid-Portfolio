<script setup>
// Les balises meta de la page sont appliquees par App.vue depuis router/index.js.
// Le contenu vit dans src/data/agent-content.js, partage avec le jumeau
// Markdown /privacy.md servi aux agents : une seule source, deux formats.
import DocArticle from '@/components/include/DocArticle.vue';
</script>

<template>
  <DocArticle slug="privacy" />
</template>
