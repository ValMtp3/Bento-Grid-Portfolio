<script setup>
const navLinks = [
  { to: '/', label: 'Accueil' },
  { to: '/stack', label: 'Stack' },
  { to: '/projets', label: 'Projets' },
  { to: '/chatbot', label: 'Chatbot' },
];

const legalLinks = [
  { to: '/legal', label: 'Mentions légales' },
  { to: '/policy', label: 'Politique de confidentialité' },
];

const socialLinks = [
  { href: 'https://www.linkedin.com/in/valentin-fiess/', label: 'LinkedIn' },
  { href: 'https://www.github.com/ValMtp3', label: 'GitHub' },
];

const currentYear = new Date().getFullYear();

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
</script>

<template>
  <footer
    class="border-t border-coffee-bean-200/60 bg-soft-blush-100 font-body transition-colors duration-300 dark:border-soft-blush-50/10 dark:bg-coffee-bean-950"
  >
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Identite -->
        <div class="lg:col-span-2">
          <p
            class="mb-2 font-code text-[10px] font-semibold uppercase tracking-[0.2em] text-spicy-paprika-600 dark:text-spicy-paprika-400"
          >
            $ valentin fiess
          </p>
          <p
            class="font-heading text-2xl font-bold text-coffee-bean-950 dark:text-soft-blush-50"
          >
            Développeur Data &amp; IA
            <span class="select-none" aria-hidden="true">🦞</span>
          </p>
          <p class="mt-3 max-w-sm text-sm leading-relaxed text-coffee-bean-700 dark:text-soft-blush-300">
            Des solutions d'intelligence artificielle, de RAG et de Data qui transforment des
            besoins métier en outils concrets.
          </p>
          <router-link
            class="mt-5 inline-flex items-center bg-spicy-paprika-500 px-5 py-2.5 font-code text-sm text-soft-blush-50 transition-colors hover:bg-spicy-paprika-600"
            to="/#contact"
          >
            Me contacter →
          </router-link>
        </div>

        <!-- Navigation -->
        <nav aria-label="Navigation du pied de page">
          <p
            class="mb-4 font-code text-[10px] font-semibold uppercase tracking-[0.2em] text-regal-navy-600 dark:text-regal-navy-400"
          >
            Navigation
          </p>
          <ul class="space-y-2.5">
            <li v-for="link in navLinks" :key="link.to">
              <router-link
                class="text-sm text-coffee-bean-800 transition-colors hover:text-spicy-paprika-600 dark:text-soft-blush-200 dark:hover:text-spicy-paprika-400"
                :to="link.to"
                @click="scrollToTop"
              >
                {{ link.label }}
              </router-link>
            </li>
          </ul>
        </nav>

        <!-- Ailleurs / legal -->
        <div>
          <p
            class="mb-4 font-code text-[10px] font-semibold uppercase tracking-[0.2em] text-regal-navy-600 dark:text-regal-navy-400"
          >
            Ailleurs
          </p>
          <ul class="space-y-2.5">
            <li v-for="link in socialLinks" :key="link.href">
              <a
                class="text-sm text-coffee-bean-800 transition-colors hover:text-spicy-paprika-600 dark:text-soft-blush-200 dark:hover:text-spicy-paprika-400"
                :href="link.href"
                rel="noopener noreferrer"
                target="_blank"
              >
                {{ link.label }} ↗
              </a>
            </li>
          </ul>

          <p
            class="mb-4 mt-7 font-code text-[10px] font-semibold uppercase tracking-[0.2em] text-regal-navy-600 dark:text-regal-navy-400"
          >
            Légal
          </p>
          <ul class="space-y-2.5">
            <li v-for="link in legalLinks" :key="link.to">
              <router-link
                class="text-sm text-coffee-bean-800 transition-colors hover:text-spicy-paprika-600 dark:text-soft-blush-200 dark:hover:text-spicy-paprika-400"
                :to="link.to"
                @click="scrollToTop"
              >
                {{ link.label }}
              </router-link>
            </li>
          </ul>
        </div>
      </div>

      <!-- Barre de fermeture -->
      <div
        class="mt-10 flex flex-col gap-2 border-t border-coffee-bean-200/60 pt-6 font-code text-xs text-coffee-bean-600 dark:border-soft-blush-50/10 dark:text-soft-blush-400 sm:flex-row sm:items-center sm:justify-between"
      >
        <p>© {{ currentYear }} Valentin Fiess</p>
        <p>
          Développé en VueJS <span class="select-none" aria-hidden="true">❤️</span>
        </p>
      </div>
    </div>
  </footer>
</template>
