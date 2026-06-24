<script setup>
const experiences = [
  {
    year: 'Mai 2023 – Juin 2023',
    title: 'Développeur Web / Consultant SEO',
    company: 'Sport and green, Montpellier',
    detail: 'Développement web sur le CMS WebFlow et développement Marketing SEO avec optimisation.',
  },
  {
    year: 'Mai 2024 – Juin 2024',
    title: 'Développeur Web',
    company: 'From_Scratch, Distanciel',
    detail: 'Développement web pour une agence web (HTML/CSS et PHP).',
  },
  {
    year: 'Sept 2024 – Sept 2025',
    title: 'Développeur IA',
    company: 'R2D automation, Clapiers',
    detail: "Création de scripts d'OCR, détection de présence et classification pour application industrielle.",
  },
  {
    year: 'Mars 2026 – Mai 2026',
    title: 'Fondateur / Développeur IA',
    company: 'Raguia, Montpellier',
    detail: "Création d'une start-up de RAG IA pour entreprise et développement complet de la solution de RAG.",
  },
];
</script>

<template>
  <!-- ═══ Expérience Section ═══ -->
  <section id="experience">
    <h2
      class="text-xl sm:text-2xl font-heading font-bold text-spicy-paprika-600 dark:text-spicy-paprika-400 mb-4 text-center"
    >
      Expérience Professionnelle
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="exp in experiences"
        :key="exp.company"
        class="bento-cell p-5 flex flex-col hover:border-regal-navy-300 dark:hover:border-regal-navy-600 transition-colors"
      >
        <span class="font-code text-sm text-regal-navy-600 dark:text-regal-navy-400 mb-1 font-semibold">{{ exp.year }}</span>
        <h3 class="font-heading font-bold text-coffee-bean-950 dark:text-soft-blush-50 mb-1">
          {{ exp.title }}
        </h3>
        <p class="text-sm text-spicy-paprika-600 dark:text-spicy-paprika-400 font-semibold mb-2">
          {{ exp.company }}
        </p>
        <p class="text-sm text-coffee-bean-600 dark:text-soft-blush-300 mt-auto">
          {{ exp.detail }}
        </p>
      </div>
    </div>
  </section>
</template>
