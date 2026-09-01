<script setup>
import { trackMatomoEvent } from '@/matomo';

const links = [
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
  {
    name: 'Mail',
    href: 'mailto:fetes01pseudo@icloud.com',
    icon: '/assets/assets_index/mail.svg',
  },
];
</script>

<template>
  <!-- Carte liens de contact -->
  <div class="bento-cell p-6 h-full flex items-center justify-center">
    <div class="grid grid-cols-3 gap-3 w-full max-w-md place-items-center">
      <a
        v-for="link in links"
        :key="link.name"
        :href="link.href"
        :title="link.name"
        target="_blank"
        rel="noopener noreferrer"
        @click="trackMatomoEvent('portfolio_contact', `${link.name.toLowerCase()}_click`, 'home')"
        class="flex flex-col items-center justify-center gap-2 w-full min-w-0 hover:scale-110 transition-all duration-300 p-2 group text-coffee-bean-600 dark:text-soft-blush-400 hover:text-coffee-bean-500 dark:hover:text-soft-blush-300"
      >
        <span
          aria-hidden="true"
          class="h-10 w-10 bg-current transition-colors duration-300 sm:h-12 sm:w-12"
          :style="{
            maskImage: `url(${link.icon})`,
            maskPosition: 'center',
            maskRepeat: 'no-repeat',
            maskSize: 'contain',
            WebkitMaskImage: `url(${link.icon})`,
            WebkitMaskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskSize: 'contain',
          }"
        ></span>
        <span class="text-xs font-code text-coffee-bean-700 dark:text-soft-blush-300">{{
          link.name
        }}</span>
      </a>
    </div>
  </div>
</template>
