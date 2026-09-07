<script setup>
import { computed, ref } from 'vue';
import { Icon } from '@iconify/vue';
import ResponsiveImage from './ResponsiveImage.vue';
import LobsterParade from './LobsterParade.vue';
import { trackMatomoEvent } from '@/matomo';

// Cinq clics sur la pastille lachent la file de homards. Le compteur se remet a
// zero a la fin du passage, l'oeuf de Paques est donc rejouable.
const LOBSTER_THRESHOLD = 5;
const lobsterClicks = ref(0);
const paradeActive = ref(false);

const lobsterHint = computed(() =>
  lobsterClicks.value === 0
    ? 'Salut, je suis Homard ! 🦞'
    : `Encore ${LOBSTER_THRESHOLD - lobsterClicks.value}...`,
);

const onLobsterClick = () => {
  if (paradeActive.value) return;
  lobsterClicks.value += 1;
  if (lobsterClicks.value < LOBSTER_THRESHOLD) return;
  paradeActive.value = true;
  trackMatomoEvent('easter_egg', 'lobster_parade', 'home');
};

const onParadeFinished = () => {
  paradeActive.value = false;
  lobsterClicks.value = 0;
};

// Rapatries depuis l'ancienne cellule Contact : leur place est ici, a cote du
// CV. La carte s'etirant sur deux rangees, son contenu ne la remplissait pas.
const socialLinks = [
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

// Les SVG sont appliques en masque pour rester monochromes et suivre la couleur
// du texte, comme le veut la direction artistique.
const maskStyle = (icon) => ({
  maskImage: `url(${icon})`,
  maskPosition: 'center',
  maskRepeat: 'no-repeat',
  maskSize: 'contain',
  WebkitMaskImage: `url(${icon})`,
  WebkitMaskPosition: 'center',
  WebkitMaskRepeat: 'no-repeat',
  WebkitMaskSize: 'contain',
});
</script>

<template>
  <!-- Profile Cell -->
  <div class="md:col-span-2 lg:row-span-2 bento-cell p-6 flex flex-col gap-6">
    <div>
      <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div class="relative shrink-0 select-none">
          <ResponsiveImage
            alt="Photo de Valentin Fiess"
            class="object-cover shadow-lg h-40 w-40 sm:h-48 sm:w-48 rounded-xl"
            src="/assets/assets_index/Valentin_Fiess.webp"
            fetchpriority="high"
            loading="eager"
            decoding="sync"
            sizes="(max-width: 639px) 160px, 192px"
          />
          <button
            type="button"
            class="absolute -bottom-2 -right-2 bg-white dark:bg-coffee-bean-900 border-2 border-spicy-paprika-500 rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-lg rotate-12 hover:rotate-0 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
            :title="lobsterHint"
            aria-label="Homard, la mascotte du site"
            @click="onLobsterClick"
          >
            🦞
          </button>
        </div>
        <div class="text-center sm:text-left">
          <p
            class="mb-1 font-code text-[10px] font-semibold uppercase tracking-[0.18em] text-spicy-paprika-600 dark:text-spicy-paprika-400"
          >
            $ profil data / IA
          </p>
          <h1
            class="text-2xl sm:text-3xl font-bold font-heading text-coffee-bean-950 dark:text-soft-blush-50 mb-1"
          >
            Valentin Fiess
          </h1>
          <h2
            class="text-lg sm:text-xl font-heading text-regal-navy-600 dark:text-regal-navy-400 font-semibold mb-3"
          >
            Ingénieur IA & Data
          </h2>
          <p
            class="text-coffee-bean-700 dark:text-soft-blush-200 max-w-md text-base sm:text-lg leading-relaxed"
          >
            Je développe des solutions d'intelligence artificielle, de RAG et de Data qui
            transforment des besoins métier en outils concrets, fiables et faciles à utiliser.
          </p>
        </div>
      </div>
      <div class="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <span class="tag tag-navy py-1.5 text-center">IA / MLOps</span>
        <span class="tag tag-paprika py-1.5 text-center">Data</span>
        <span class="tag tag-paprika py-1.5 text-center">Python</span>
        <span class="tag tag-paprika py-1.5 text-center">RAG</span>
      </div>
    </div>
    <!-- Bloc d'actions ancre en bas : la carte s'etire sur deux rangees, ce
         groupe absorbe la hauteur restante au lieu de la laisser en trou. -->
    <div class="mt-auto flex flex-col gap-4">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <a
          href="/assets/assets_index/CV_Valentin_Fiess.pdf"
          download="CV_Valentin_Fiess.pdf"
          @click="trackMatomoEvent('portfolio_cta', 'download_cv', 'hero')"
          class="inline-flex items-center justify-center bg-spicy-paprika-500 px-6 py-2.5 font-code text-sm text-soft-blush-50 shadow-sm shadow-spicy-paprika-500/25 transition-colors hover:bg-spicy-paprika-600"
        >
          Télécharger mon CV
        </a>
        <a
          href="/assets/assets_index/CV_Valentin_Fiess.pdf"
          target="_blank"
          rel="noopener noreferrer"
          @click="trackMatomoEvent('portfolio_cta', 'view_cv', 'hero')"
          class="inline-flex items-center justify-center border border-regal-navy-300 px-6 py-2.5 font-code text-sm text-regal-navy-700 transition-colors hover:border-regal-navy-500 hover:bg-regal-navy-50 dark:border-regal-navy-700 dark:text-regal-navy-200 dark:hover:bg-regal-navy-950/40"
        >
          Voir mon CV
        </a>
      </div>

      <div
        class="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-coffee-bean-200/60 pt-4 dark:border-soft-blush-50/10"
      >
        <span
          class="font-code text-[10px] uppercase tracking-[0.14em] text-regal-navy-600 dark:text-regal-navy-400"
        >
          ~ ailleurs
        </span>
        <a
          v-for="link in socialLinks"
          :key="link.name"
          :href="link.href"
          :target="link.href.startsWith('mailto:') ? undefined : '_blank'"
          rel="noopener noreferrer"
          @click="trackMatomoEvent('portfolio_contact', `${link.name.toLowerCase()}_click`, 'hero')"
          class="group inline-flex items-center gap-2 font-code text-sm text-coffee-bean-700 transition-colors hover:text-spicy-paprika-600 dark:text-soft-blush-300 dark:hover:text-spicy-paprika-400"
        >
          <span
            aria-hidden="true"
            class="h-5 w-5 shrink-0 bg-current"
            :style="maskStyle(link.icon)"
          ></span>
          {{ link.name }}
        </a>

        <!-- Lien interne, donc router-link : le formulaire est plus bas sur la
             meme page, une navigation complete serait inutile. L'icone vient
             d'Iconify faute de SVG local, mais elle est monochrome et suit
             currentColor comme les trois autres. -->
        <router-link
          to="/#contact"
          @click="trackMatomoEvent('portfolio_contact', 'form_click', 'hero')"
          class="group inline-flex items-center gap-2 font-code text-sm text-coffee-bean-700 transition-colors hover:text-spicy-paprika-600 dark:text-soft-blush-300 dark:hover:text-spicy-paprika-400"
        >
          <Icon
            icon="mdi:message-text-outline"
            class="h-5 w-5 shrink-0"
            aria-hidden="true"
          />
          Formulaire
        </router-link>
      </div>
    </div>

    <LobsterParade :active="paradeActive" @finished="onParadeFinished" />
  </div>
</template>
