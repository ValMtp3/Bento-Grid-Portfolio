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
    year: 'Sept 2024 – Sept 2025',
    title: 'Développeur IA',
    company: 'R2D automation, Clapiers',
    detail:
      "Conception de pipelines OCR et de computer vision pour le contrôle qualité industriel : préparation d'images, détection de présence, classification et tests de robustesse.",
    skills: ['OCR', 'Computer vision', 'Contrôle qualité'],
  },
  {
    year: 'Février 2026 – Juillet 2026',
    title: 'Fondateur / Développeur IA',
    company: 'Raguia, Montpellier',
    detail:
      "Développement d'un assistant RAG sécurisé avec ingestion documentaire, recherche sémantique, permissions utilisateurs et architecture conteneurisée.",
    skills: ['FastAPI', 'PostgreSQL / PGVector', 'React', 'Docker'],
  },
  {
    year: 'Juillet 2026 – Présent',
    title: 'Ingénieur IA/Data',
    company: 'Shaarp, Montpellier',
    detail:
      "Amélioration des pipelines data et IA d'une application SaaS IA pour commerciaux : optimisation des flux de données, sélection et mise à jour des modèles LLM et amélioration continue de la stack MLOps.",
    skills: ['API', 'LLM', 'MLOps', 'TypeScript', 'Data'],
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
            class="tag tag-navy"
          >
            {{ skill }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
