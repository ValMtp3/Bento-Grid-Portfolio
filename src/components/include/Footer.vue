<template>
  <div class="bg-[#FBFDFF] dark:bg-gray-900 transition-colors duration-300">
    <footer
      class="bg-[#FBFDFF] dark:bg-gray-900 font-[AnonymousPro] transition-colors duration-300"
    >
      <button
        id="back-to-top-btn"
        :class="{ hidden: !isScrollVisible }"
        class="fixed z-50 bottom-24 right-4 p-4 rounded-full shadow-lg hover:shadow-xl bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white transition-all duration-300 hover:scale-110 active:scale-95"
        title="Retour en haut"
        @click="scrollToTop"
      >
        <svg
          class="w-6 h-6"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 4l8 8h-6v8h-4v-8H4l8-8z" />
        </svg>
      </button>
      <div class="container mx-auto p-10">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <div class="col-span-1">
            <p class="text-3xl text-neutral-900 dark:text-white font-bold">Liens utiles</p>
            <ul class="mt-5 grid grid-cols-3 gap-4">
              <li class="text-lg text-neutral-900 dark:text-white font-light">
                <router-link class="hover:underline" to="/" @click="scrollToTop"
                  >Accueil
                </router-link>
              </li>
              <li class="text-lg text-neutral-900 dark:text-white font-light">
                <router-link class="hover:underline" to="/stack" @click="scrollToTop"
                  >Stack
                </router-link>
              </li>
              <li class="text-lg text-neutral-900 dark:text-white font-light">
                <router-link class="hover:underline" to="/projets" @click="scrollToTop"
                  >Projets
                </router-link>
              </li>
              <li class="text-lg text-neutral-900 dark:text-white font-light">
                <router-link class="hover:underline" to="/chatbot" @click="scrollToTop"
                  >Chatbot IA
                </router-link>
              </li>
              <li class="text-lg text-neutral-900 dark:text-white font-light">
                <router-link class="hover:underline" to="/legal" @click="scrollToTop"
                  >Mentions légales
                </router-link>
              </li>
              <li class="text-lg text-neutral-900 dark:text-white font-light">
                <router-link class="hover:underline" to="/policy" @click="scrollToTop"
                  >Politique confidentialité
                </router-link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <p class="text-md text-center text-neutral-900 dark:text-white font-light text-2xl m-3 pb-6">
        Développé en VueJS par Valentin Fiess ❤️
      </p>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

const isScrollVisible = ref(false);

const handleScroll = () => {
  isScrollVisible.value = window.scrollY > 200;
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>
