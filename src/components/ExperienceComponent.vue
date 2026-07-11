<script setup>
import SectionHeading from './SectionHeading.vue';

const experiences = [
  {
    year: 'Mai 2023 – Juin 2023',
    title: 'Développeur Web / Consultant SEO',
    company: 'Sport and green, Montpellier',
    detail:
      'Création de pages CMS Webflow, amélioration responsive, conversion des images en WebP et optimisation des performances et des contenus SEO.',
    skills: ['Webflow', 'SEO', 'WebP'],
  },
  {
    year: 'Mai 2024 – Juin 2024',
    title: 'Développeur Web',
    company: 'From_Scratch, Distanciel',
    detail:
      "Participation au développement de sites pour une agence web, de l'intégration front-end aux adaptations PHP selon les besoins des projets.",
    skills: ['HTML / CSS', 'PHP'],
  },
  {
    year: 'Sept 2024 – Sept 2025',
    title: 'Développeur IA',
    company: 'R2D automation, Clapiers',
    detail:
      "Conception de pipelines OCR et de computer vision pour le contrôle qualité industriel : préparation d'images, détection de présence, classification et tests de robustesse.",
    skills: ['OCR', 'Computer vision', 'Contrôle qualité'],
  },
  {
    year: 'Mars 2026 – Mai 2026',
    title: 'Fondateur / Développeur IA',
    company: 'Raguia, Montpellier',
    detail:
      "Développement d'un assistant RAG sécurisé avec ingestion documentaire, recherche sémantique, permissions utilisateurs et architecture conteneurisée.",
    skills: ['FastAPI', 'PostgreSQL / PGVector', 'React', 'Docker'],
    featured: true,
  },
];
</script>

<template>
  <!-- ═══ Expérience Section ═══ -->
  <section>
    <SectionHeading index="02" label="Parcours" title="Expérience professionnelle" />
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="exp in experiences"
        :key="exp.company"
        class="bento-cell p-5 flex flex-col"
      >
        <span
          v-if="exp.featured"
          class="mb-3 font-code text-[10px] uppercase tracking-[0.16em] text-spicy-paprika-600 dark:text-spicy-paprika-400"
        >
          ~ latest role
        </span>
        <span class="font-code text-sm text-regal-navy-600 dark:text-regal-navy-400 mb-1 font-semibold">{{ exp.year }}</span>
        <h3 class="font-heading font-bold text-coffee-bean-950 dark:text-soft-blush-50 mb-1">
          {{ exp.title }}
        </h3>
        <p class="text-sm text-regal-navy-600 dark:text-regal-navy-400 font-semibold mb-2">
          {{ exp.company }}
        </p>
        <p class="text-sm text-coffee-bean-600 dark:text-soft-blush-300 mb-4">
          {{ exp.detail }}
        </p>
        <div class="mt-auto flex flex-wrap gap-1.5">
          <span
            v-for="skill in exp.skills"
            :key="skill"
            class="border-l-2 border-regal-navy-400 bg-regal-navy-50/60 px-2 py-1 font-code text-[10px] uppercase tracking-wide text-regal-navy-700 dark:border-regal-navy-500 dark:bg-regal-navy-950/30 dark:text-regal-navy-200"
          >
            {{ skill }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
