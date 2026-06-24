<script setup>
import { Icon } from '@iconify/vue';

const links = [
  {
    name: 'CV',
    href: '/assets/assets_index/CV_Valentin_Fiess.pdf',
    icon: 'tabler:file-cv',
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/valentin-fiess/',
    icon: 'tabler:brand-linkedin',
  },
  {
    name: 'GitHub',
    href: 'https://www.github.com/ValMtp3',
    icon: 'tabler:brand-github',
  },
  {
    name: 'Mail',
    href: 'mailto:fetes01pseudo@icloud.com',
    icon: 'tabler:mail',
  },
];
</script>

<template>
  <!-- Links Cell -->
  <div class="bento-cell p-6 h-full flex items-center justify-center">
    <div class="grid grid-cols-4 gap-3 w-full max-w-md place-items-center">
      <a
        v-for="link in links"
        :key="link.name"
        :href="link.href"
        :title="link.name"
        target="_blank"
        class="flex flex-col items-center justify-center gap-2 w-full min-w-0 hover:scale-110 transition-all duration-300 p-2 group text-coffee-bean-600 dark:text-soft-blush-400 hover:text-coffee-bean-500 dark:hover:text-soft-blush-300"
      >
        <Icon :icon="link.icon" class="w-10 h-10 sm:w-12 sm:h-12 transition-colors duration-300" />
        <span class="text-xs font-code text-coffee-bean-700 dark:text-soft-blush-300">{{
          link.name
        }}</span>
      </a>
    </div>
  </div>
</template>
