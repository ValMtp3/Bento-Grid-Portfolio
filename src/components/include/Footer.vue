<template>
  <div class="bg-[#FBFDFF] dark:bg-gray-900 transition-colors duration-300">
    <footer
      class="bg-[#FBFDFF] dark:bg-gray-900 font-[AnonymousPro] transition-colors duration-300"
    >
      <button
        id="back-to-top-btn"
        class="hidden fixed z-50 bottom-10 right-10 p-4 border-0 w-14 h-14 rounded-full shadow-md bg-blue-400 hover:bg-blue-500 text-white text-lg font-semibold transition-colors duration-300"
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
                  >Acceuil
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
                  >Mention légales
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
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
</script>
