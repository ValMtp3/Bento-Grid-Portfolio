<script setup>
// Rend une entree de src/data/agent-content.js comme page documentaire.
//
// Pourquoi passer par le contenu Markdown plutot que d'ecrire le HTML dans
// chaque vue : /about, /contact et /privacy existent en deux formats, la page
// HTML et son jumeau /about.md servi aux agents. Ecrits deux fois, les deux
// versions divergent au premier correctif. Ici, une seule source alimente les
// deux.
import { computed } from 'vue';

import { agentContent } from '@/data/agent-content.js';
import { renderMarkdown } from '@/markdown.js';

const props = defineProps({
  // Slug de src/data/seo.js, qui sert aussi de cle dans agentContent.
  slug: { type: String, required: true },
});

const entry = computed(() => agentContent[props.slug]);

// Le HTML est genere par renderMarkdown, qui echappe la source avant de poser
// la moindre balise : rien d'arbitraire ne peut atteindre v-html.
const body = computed(() => renderMarkdown(entry.value?.body ?? ''));
</script>

<template>
  <div class="text-coffee-bean-800 dark:text-soft-blush-200">
    <div class="container mx-auto p-6 max-w-3xl">
      <h1 class="text-3xl font-bold font-heading mb-8 text-center dark:text-soft-blush-50">
        {{ entry?.heading }}
      </h1>

      <article
        class="doc-article dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 bg-soft-blush-50 p-6 shadow rounded-xl"
        v-html="body"
      />
    </div>
  </div>
</template>

<style scoped>
/* Le rendu Markdown sort sans classes : la mise en forme vit ici, une seule
   fois, plutot que dans le convertisseur. */
.doc-article :deep(h2) {
  font-size: 1.375rem;
  font-weight: 600;
  margin: 1.75rem 0 0.75rem;
}

.doc-article :deep(h2:first-child) {
  margin-top: 0;
}

.doc-article :deep(h3) {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 1.25rem 0 0.5rem;
}

.doc-article :deep(p) {
  margin-bottom: 0.875rem;
  line-height: 1.7;
}

.doc-article :deep(ul) {
  list-style: disc;
  padding-left: 1.25rem;
  margin-bottom: 0.875rem;
}

.doc-article :deep(ol) {
  list-style: decimal;
  padding-left: 1.5rem;
  margin-bottom: 0.875rem;
}

.doc-article :deep(li) {
  margin-bottom: 0.375rem;
  line-height: 1.65;
}

.doc-article :deep(a) {
  color: var(--color-regal-navy-500, #3b5b8c);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.doc-article :deep(code) {
  font-family: var(--font-code, monospace);
  font-size: 0.9em;
  padding: 0.1em 0.35em;
  border-radius: 0.25rem;
  background: rgb(0 0 0 / 6%);
}

/* Le projet n'active pas la variante `dark` par une classe : Tailwind v4 la
   derive de prefers-color-scheme. Ce bloc doit suivre la meme regle, sinon le
   fond du code reste sombre sur sombre. */
@media (prefers-color-scheme: dark) {
  .doc-article :deep(code) {
    background: rgb(255 255 255 / 10%);
  }

  .doc-article :deep(a) {
    color: var(--color-regal-navy-300, #7aa7ef);
  }
}
</style>
