<template>
  <div class="bg-soft-blush-50">
    <footer class="bg-soft-blush-50 font-body">
      <button
        id="back-to-top-btn"
        class="hidden fixed z-50 bottom-10 right-10 p-4 border-0 w-14 h-14 rounded-full shadow-md bg-regal-navy-400 hover:bg-regal-navy-500 text-soft-blush-50 text-lg font-code font-semibold transition-colors duration-300"
        title="Retour en haut"
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
            <p class="text-3xl text-regal-navy-700 font-bold font-heading">Liens utiles</p>
            <ul class="mt-5 grid grid-cols-3 gap-4">
              <li class="text-lg text-coffee-bean-950 font-light">
                <router-link
                  class="hover:text-regal-navy-500 hover:underline transition-colors"
                  to="/"
                  @click.native="scrollToTop"
                  >Acceuil</router-link
                >
              </li>
              <li class="text-lg text-coffee-bean-950 font-light">
                <router-link
                  class="hover:text-regal-navy-500 hover:underline transition-colors"
                  to="/stack"
                  @click.native="scrollToTop"
                  >Stack</router-link
                >
              </li>
              <li class="text-lg text-coffee-bean-950 font-light">
                <router-link
                  class="hover:text-regal-navy-500 hover:underline transition-colors"
                  to="/projets"
                  @click.native="scrollToTop"
                  >Projets</router-link
                >
              </li>
              <li class="text-lg text-coffee-bean-950 font-light">
                <router-link
                  class="hover:text-regal-navy-500 hover:underline transition-colors"
                  to="/legal"
                  @click.native="scrollToTop"
                  >Mention légales
                </router-link>
              </li>
              <li class="text-lg text-coffee-bean-950 font-light">
                <router-link
                  class="hover:text-regal-navy-500 hover:underline transition-colors"
                  to="/policy"
                  @click.native="scrollToTop"
                  >Politique confidentialité
                </router-link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  </div>
  <p class="text-md text-center text-coffee-bean-950 font-light text-2xl m-3">
    Développé en VueJS par Valentin Fiess ❤️
  </p>
</template>
<script lang="ts" setup>
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
</script>
