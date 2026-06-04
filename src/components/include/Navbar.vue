<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const navLinks = [
  { name: 'Expérience', to: '/#experience' },
  { name: 'Formation', to: '/#formation' },
  { name: 'Maitrise', to: '/#competences' },
  { name: 'Projets', to: '/projets' },
  { name: 'Chatbot', to: '/chatbot' },
];
</script>

<template>
  <header
    class="sticky top-0 z-50 w-full bg-soft-blush-50/85 backdrop-blur-md border-b border-coffee-bean-100/40 dark:bg-coffee-bean-950/85 dark:border-coffee-bean-900/60 transition-colors duration-300"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 sm:h-20">
        <!-- Logo -->
        <router-link
          to="/"
          class="font-heading font-bold text-xl sm:text-2xl text-coffee-bean-950 dark:text-soft-blush-50 hover:text-spicy-paprika-500 dark:hover:text-spicy-paprika-400 transition-colors"
          @click="closeMenu"
        >
          VALENTIN FIESS 🦞
        </router-link>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-6 lg:space-x-8">
          <router-link
            v-for="link in navLinks"
            :key="link.name"
            :to="link.to"
            class="text-sm font-heading font-medium text-coffee-bean-700 dark:text-soft-blush-200 hover:text-spicy-paprika-500 dark:hover:text-spicy-paprika-400 transition-colors relative py-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-spicy-paprika-500 dark:after:bg-spicy-paprika-400 after:transition-all after:duration-300 hover:after:w-full"
            :class="{
              'text-spicy-paprika-500 dark:text-spicy-paprika-400':
                route.path === link.to.split('#')[0] &&
                (link.to.includes('#')
                  ? route.hash === link.to.substring(link.to.indexOf('#'))
                  : true),
            }"
          >
            {{ link.name }}
          </router-link>
        </nav>

        <!-- Right Side Button -->
        <div class="hidden md:block">
          <router-link
            to="/#contact"
            class="font-code bg-spicy-paprika-500 hover:bg-spicy-paprika-600 text-soft-blush-50 px-5 py-2 sm:px-6 sm:py-2.5 shadow-md shadow-spicy-paprika-500/20 hover:shadow-spicy-paprika-500/30 transition-all duration-300 rounded-lg text-sm"
          >
            CONTACT
          </router-link>
        </div>

        <!-- Mobile Menu Button -->
        <div class="md:hidden flex items-center">
          <button
            @click="toggleMenu"
            class="text-coffee-bean-950 dark:text-soft-blush-50 p-2 hover:text-spicy-paprika-500 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                v-if="!isMenuOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation Drawer -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div
        v-if="isMenuOpen"
        class="md:hidden border-t border-coffee-bean-100/40 dark:border-coffee-bean-900/60 bg-soft-blush-50 dark:bg-coffee-bean-950 shadow-inner px-4 pt-2 pb-6 space-y-3"
      >
        <router-link
          v-for="link in navLinks"
          :key="link.name"
          :to="link.to"
          @click="closeMenu"
          class="block px-3 py-2.5 rounded-lg text-base font-heading font-medium text-coffee-bean-800 dark:text-soft-blush-200 hover:bg-soft-blush-100 dark:hover:bg-coffee-bean-900 hover:text-spicy-paprika-500 dark:hover:text-spicy-paprika-400 transition-all"
        >
          {{ link.name }}
        </router-link>
        <router-link
          to="/#contact"
          @click="closeMenu"
          class="block text-center font-code bg-spicy-paprika-500 hover:bg-spicy-paprika-600 text-soft-blush-50 px-4 py-3 shadow-md shadow-spicy-paprika-500/20 transition-all rounded-lg text-base mx-3"
        >
          CONTACT
        </router-link>
      </div>
    </transition>
  </header>
</template>
