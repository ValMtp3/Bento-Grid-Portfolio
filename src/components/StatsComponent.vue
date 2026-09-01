<script setup>
import { ref } from 'vue';

const githubChartContainer = ref(null);

const scrollGithubChartToRecent = () => {
  requestAnimationFrame(() => {
    const container = githubChartContainer.value;

    if (!container) return;

    const maxScroll = container.scrollWidth - container.clientWidth;

    if (maxScroll > 0) {
      container.scrollLeft = maxScroll;
    }
  });
};
</script>

<template>
  <!-- Carte activite GitHub -->
  <div class="md:col-span-2 bento-cell p-5 sm:p-6 flex flex-col justify-between overflow-hidden">
    <div class="flex items-start justify-between gap-3 mb-4">
      <div>
        <h3
          class="font-heading font-bold text-base sm:text-lg text-coffee-bean-950 dark:text-soft-blush-50"
        >
          Historique GitHub
        </h3>
      </div>
      <a
        href="https://github.com/ValMtp3"
        target="_blank"
        rel="noopener noreferrer"
        class="font-code text-xs text-spicy-paprika-600 dark:text-spicy-paprika-400 hover:text-spicy-paprika-700 dark:hover:text-spicy-paprika-300 transition-colors"
      >
        @ValMtp3
      </a>
    </div>
    <a
      ref="githubChartContainer"
      href="https://github.com/ValMtp3"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Voir l'historique de contributions GitHub de Valentin Fiess"
      class="block overflow-x-auto rounded-md border border-coffee-bean-100 dark:border-soft-blush-50/10 bg-soft-blush-100/60 dark:bg-coffee-bean-950/40 p-2.5 hover:border-spicy-paprika-300 dark:hover:border-spicy-paprika-500 transition-colors"
    >
      <img
        src="https://raw.githubusercontent.com/ValMtp3/Bento-Grid-Portfolio/main/public/assets/assets_index/github-contributions.svg"
        alt="Historique global des contributions GitHub de Valentin Fiess"
        width="720"
        height="86"
        loading="eager"
        decoding="async"
        fetchpriority="high"
        @load="scrollGithubChartToRecent"
        class="h-auto w-[720px] max-w-none opacity-90 sm:w-full"
      />
    </a>
    <div class="mt-3 flex flex-wrap gap-2">
      <span class="tag tag-navy">commits publics</span>
      <span class="tag tag-paprika">projets data / IA / web</span>
    </div>
  </div>
</template>
