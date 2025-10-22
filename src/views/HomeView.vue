<script setup>
import ClientsComponent from '@/components/ClientsComponent.vue';
import ContactComponent from '@/components/ContactComponent.vue';
import ContactFormsComponent from '@/components/ContactFormsComponent.vue';
import FormationComponent from '@/components/FormationComponent.vue';
import MaitriseComponent from '@/components/MaitriseComponent.vue';
import PresentationComponent from '@/components/PresentationComponent.vue';
import ProjetsComponent from '@/components/ProjetsComponent.vue';
import { projets } from '@/data/projets.js';
import { computed, ref } from 'vue';
import { useMeta } from 'vue-meta';

// Meta tags spécifiques à la page d'accueil
useMeta({
  title: 'Valentin Fiess | Portfolio Développeur Web & IA',
  meta: [
    {
      name: 'description',
      content:
        'Portfolio de Valentin Fiess, développeur web et IA basé à Montpellier. Découvrez mes projets, compétences et expériences professionnelles en développement web et intelligence artificielle.',
    },
    {
      name: 'keywords',
      content:
        'développeur web, développeur IA, portfolio, Valentin Fiess, Montpellier, EPSI, Vue.js, PHP, Python, JavaScript, machine learning',
    },
    { property: 'og:title', content: 'Valentin Fiess | Portfolio Développeur Web & IA' },
    {
      property: 'og:description',
      content:
        'Portfolio de Valentin Fiess, développeur web et IA basé à Montpellier. Découvrez mes projets, compétences et expériences professionnelles en développement web et intelligence artificielle.',
    },
    { property: 'og:image', content: '/assets/assets_index/Profile.webp' },
    { property: 'og:url', content: 'https://www.valentin-fiess.fr' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Valentin Fiess | Portfolio Développeur Web & IA' },
    {
      name: 'twitter:description',
      content: 'Portfolio de Valentin Fiess, développeur web et IA basé à Montpellier.',
    },
    { name: 'twitter:image', content: '/assets/assets_index/Profile.webp' },
    { name: 'author', content: 'Valentin Fiess' },
    { name: 'robots', content: 'index, follow' },
    { name: 'language', content: 'fr-FR' },
  ],
});

const languages = [
  { alt: 'Logo HTML5', image: '/assets/assets_index/HTML-removebg.webp', title: 'HTML' },
  {
    alt: 'Logo Tailwind',
    image: '/assets/assets_index/Tailwind-removebg.webp',
    title: 'Tailwind CSS',
  },
  { alt: 'Logo VueJS', image: '/assets/assets_index/VueJS.webp', title: 'VueJS' },
  { alt: 'Logo MySQL', image: '/assets/assets_index/MySQL-removebg.webp', title: 'MySQL' },
  { alt: 'Logo Python', image: '/assets/assets_index/Python-removebg.webp', title: 'Python' },
  {
    alt: 'Logo Pandas',
    image: '/assets/assets_index/pandas.webp',
    title: 'Pandas',
  },
  {
    alt: 'Logo Scikit-learn',
    image: '/assets/assets_index/scikitlearn.webp',
    title: 'Scikit-learn',
  },
  {
    alt: 'Logo TensorFlow',
    image: '/assets/assets_index/tensorflow.webp',
    title: 'TensorFlow',
  },
  {
    alt: 'Logo PyTorch',
    image: '/assets/assets_index/pytorch.webp',
    title: 'PyTorch',
  },
  {
    alt: 'Logo Transformers',
    image: '/assets/assets_index/transformers.webp',
    title: 'Transformers',
  },
  { alt: 'Logo Symfony', image: '/assets/assets_index/Symfony.webp', title: 'PHP Symfony' },
];

const showMoreLanguages = ref(false);
const firstLanguages = languages.slice(0, 8);
const moreLanguages = languages.slice(8);

const openModal = () => {
  showMoreLanguages.value = true;
};
const closeModal = () => {
  showMoreLanguages.value = false;
};

const clients = [
  {
    alt: 'Logo Sport&Green',
    image: '/assets/assets_index/sportandgreen.webp',
    name: 'Sport&Green',
    role: 'Développeur web / Consultant SEO',
  },
  {
    alt: 'Logo from scratch',
    image: '/assets/assets_index/from_scratch.webp',
    name: 'From_Scratch',
    role: 'Développeur web',
  },
  {
    alt: 'Logo R2D automation',
    image: '/assets/assets_index/R2D automation.webp',
    name: 'R2D Automation',
    role: 'Développeur IA',
  },
];

const showMoreProjets = ref(false);
const firstProjets = projets.slice(0, 2);
const moreProjets = projets.slice(2);

// Slider pour les projets dans la modale
const sliderModalIndex = ref(0);
const projetsParSlideModal = 1;
const totalSlidesModal = computed(() => Math.ceil(moreProjets.length / projetsParSlideModal));
const currentModalProjet = computed(() => {
  const start = sliderModalIndex.value * projetsParSlideModal;
  return moreProjets.slice(start, start + projetsParSlideModal);
});
const nextModalSlide = () => {
  if (sliderModalIndex.value < totalSlidesModal.value - 1) sliderModalIndex.value++;
};
const prevModalSlide = () => {
  if (sliderModalIndex.value > 0) sliderModalIndex.value--;
};
</script>

<template>
  <div class="px-2 pt-3 pb-2 sm:px-6 md:px-8">
    <div class="grid grid-cols-1 gap-2 sm:gap-4 lg:grid-cols-2 lg:gap-6">
      <PresentationComponent />
      <ContactComponent />
    </div>
  </div>
  <div class="px-2 py-2 sm:px-6 sm:py-4 md:px-8">
    <FormationComponent />
  </div>
  <div class="px-2 py-2 sm:px-6 sm:py-4 md:px-8">
    <div class="grid grid-cols-1 gap-2 sm:gap-4 lg:grid-cols-2 lg:gap-6">
      <div
        class="bg-white dark:bg-gray-800 font-[AnonymousPro] p-3 sm:p-4 rounded-3xl w-full max-w-none transition-colors duration-300"
      >
        <span
          class="flex justify-center mb-3 text-base text-center underline sm:mb-4 sm:text-xl text-neutral-900 dark:text-white"
          >Maitrise</span
        >
        <div>
          <div
            class="grid items-center grid-cols-2 gap-3 mb-3 sm:gap-4 sm:mb-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6 justify-items-center"
          >
            <MaitriseComponent v-for="lang in firstLanguages" :key="lang.title" v-bind="lang" />
          </div>
          <div v-if="moreLanguages.length" class="flex justify-center">
            <button
              class="px-4 py-1.5 sm:px-6 sm:py-2 text-sm sm:text-base font-semibold transition-all duration-150 bg-blue-100 border shadow-sm rounded-xl dark:bg-blue-900/70 text-neutral-900 dark:text-white border-neutral-200 dark:border-gray-600 hover:bg-teal-100 dark:hover:bg-teal-800/70"
              @click="openModal"
            >
              Voir plus
            </button>
          </div>
        </div>

        <transition name="fade">
          <div
            v-if="showMoreLanguages"
            class="fixed inset-0 z-50 flex items-center justify-center"
            @click.self="closeModal"
          >
            <div class="absolute inset-0 bg-black/70 backdrop-blur-[8px]"></div>
            <div
              class="relative flex flex-col items-center w-full max-w-xl p-4 border shadow-2xl sm:p-6 md:p-8 bg-white/90 dark:bg-gray-800/90 rounded-3xl border-neutral-200 dark:border-gray-600"
              style="backdrop-filter: blur(18px)"
            >
              <button
                class="absolute flex items-center justify-center w-10 h-10 text-3xl font-bold transition border rounded-full shadow-lg top-4 right-4 text-neutral-500 hover:text-neutral-900 dark:hover:text-white bg-white/70 dark:bg-gray-800/70 border-neutral-200 dark:border-gray-600"
                aria-label="Fermer"
                @click="closeModal"
              >
                ×
              </button>
              <div
                class="mb-4 text-xl font-bold tracking-wide text-center text-neutral-900 dark:text-white"
              >
                Autres compétences
              </div>
              <div
                class="grid items-center grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 md:gap-8 justify-items-center"
              >
                <MaitriseComponent v-for="lang in moreLanguages" :key="lang.title" v-bind="lang" />
              </div>
            </div>
          </div>
        </transition>
      </div>

      <div
        class="bg-white dark:bg-gray-800 font-[AnonymousPro] p-3 sm:p-4 rounded-3xl w-full max-w-none transition-colors duration-300"
      >
        <span
          class="flex justify-center mb-3 text-base text-center underline sm:mb-4 sm:text-xl text-neutral-900 dark:text-white"
          >Projets</span
        >
        <div>
          <div
            class="grid items-center grid-cols-1 gap-3 mb-3 sm:gap-4 sm:mb-4 sm:grid-cols-2 md:gap-6 justify-items-center"
          >
            <ProjetsComponent v-for="pro in firstProjets" :key="pro.name" v-bind="pro" />
          </div>
          <div v-if="moreProjets.length" class="flex justify-center">
            <button
              class="px-4 py-1.5 sm:px-6 sm:py-2 text-sm sm:text-base font-semibold transition-all duration-150 bg-blue-100 border shadow-sm rounded-xl dark:bg-blue-900/70 text-neutral-900 dark:text-white border-neutral-200 dark:border-gray-600 hover:bg-teal-100 dark:hover:bg-teal-800/70"
              @click="showMoreProjets = !showMoreProjets"
            >
              Voir plus
            </button>
          </div>
        </div>

        <transition name="fade">
          <div
            v-if="showMoreProjets"
            class="fixed inset-0 z-50 flex items-center justify-center"
            @click.self="showMoreProjets = false"
          >
            <div class="absolute inset-0 bg-black/70 backdrop-blur-[8px]"></div>
            <div
              class="relative flex flex-col items-center w-full max-w-3xl p-4 border shadow-2xl sm:p-6 md:p-8 bg-white/90 dark:bg-gray-800/90 rounded-3xl border-neutral-200 dark:border-gray-600"
              style="backdrop-filter: blur(18px)"
            >
              <button
                class="absolute flex items-center justify-center w-10 h-10 text-3xl font-bold transition border rounded-full shadow-lg top-4 right-4 text-neutral-500 hover:text-neutral-900 dark:hover:text-white bg-white/70 dark:bg-gray-800/70 border-neutral-200 dark:border-gray-600"
                aria-label="Fermer"
                @click="showMoreProjets = false"
              >
                ×
              </button>
              <div
                class="mb-4 text-xl font-bold tracking-wide text-center text-neutral-900 dark:text-white"
              >
                Autres projets
              </div>
              <div class="flex items-center justify-center w-full gap-4 mb-4">
                <button
                  class="p-2 text-2xl bg-gray-200 rounded-full dark:bg-gray-700 disabled:opacity-40"
                  :disabled="sliderModalIndex === 0"
                  @click="prevModalSlide"
                >
                  &#8592;
                </button>
                <div class="flex justify-center w-full">
                  <ProjetsComponent
                    v-for="pro in currentModalProjet"
                    :key="pro.name"
                    v-bind="pro"
                  />
                </div>
                <button
                  class="p-2 text-2xl bg-gray-200 rounded-full dark:bg-gray-700 disabled:opacity-40"
                  :disabled="sliderModalIndex >= totalSlidesModal - 1"
                  @click="nextModalSlide"
                >
                  &#8594;
                </button>
              </div>
              <div class="mb-2 text-sm text-neutral-700 dark:text-gray-300">
                {{ sliderModalIndex + 1 }} / {{ totalSlidesModal }}
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
  <div class="px-2 py-2 sm:px-6 sm:py-4 md:px-8">
    <div
      class="bg-white dark:bg-gray-800 font-[AnonymousPro] p-3 sm:p-4 rounded-3xl w-full max-w-none transition-colors duration-300"
    >
      <span
        class="flex justify-center mb-3 text-base text-center underline sm:mb-4 sm:text-xl text-neutral-900 dark:text-white"
        >Entreprises avec lesquelles j'ai travaillé</span
      >
      <div class="flex items-center justify-around">
        <ClientsComponent :clients="clients" />
      </div>
    </div>
  </div>
  <div class="px-2 py-2 sm:px-6 sm:py-4 md:px-8">
    <div
      class="bg-white dark:bg-gray-800 font-[AnonymousPro] p-3 sm:p-4 rounded-3xl w-full max-w-none transition-colors duration-300"
    >
      <ContactFormsComponent />
    </div>
  </div>
</template>
