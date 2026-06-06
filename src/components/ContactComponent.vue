<script setup>
const links = [
  {
    name: 'CV',
    href: '/assets/assets_index/CV_Valentin_Fiess.pdf',
    icon: '/assets/assets_index/CV.svg',
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/valentin-fiess/',
    icon: '/assets/assets_index/Linkedin.svg',
  },
  {
    name: 'GitHub',
    href: 'https://www.github.com/ValMtp3',
    icon: '/assets/assets_index/Github.svg',
  },
  { name: 'Mail', href: 'mailto:fetes01pseudo@icloud.com', icon: '/assets/assets_index/mail.svg' },
];
</script>

<template>
  <!-- Links Cell -->
  <div class="bento-cell p-6">
    <div class="flex items-center justify-around">
      <a
        v-for="link in links"
        :key="link.name"
        :href="link.href"
        :title="link.name"
        target="_blank"
        class="flex flex-col items-center gap-2 hover:scale-110 transition-all duration-300 p-2"
      >
        <img :alt="link.name" class="w-12 h-12 sm:w-14 sm:h-14 dark:brightness-0 dark:invert" :src="link.icon" />
        <span class="text-xs font-code text-coffee-bean-700 dark:text-soft-blush-300">{{
          link.name
        }}</span>
      </a>
    </div>
  </div>
</template>
