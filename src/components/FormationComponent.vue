<script setup>
const formations = [
  {
    year: '2018–2020',
    title: 'Baccalauréat STI2D',
    school: 'Lycée Émile Peytavin, Mende',
    detail: "Science et Technologie de l'Industrie et du Développement Durable",
  },
  {
    year: '2020',
    title: 'Certification TOSA',
    school: "Gréta, Clermont-l'Hérault",
    detail: 'Word 688 · Excel 815 · PowerPoint 715',
  },
  {
    year: '2021–2022',
    title: 'Management Économique de la Construction',
    school: 'Lycée Aimé Césaire, Clisson',
    detail: '1ère année de BTS M.E.C',
  },
  {
    year: '2022–2025',
    title: 'Licence Développeur Data/IA',
    school: 'EPSI Montpellier',
    detail: 'Diplômé — Développement & Big Data (RNCP Niv. 6)',
  },
];
</script>

<template>
  <!-- ═══ Formation Section ═══ -->
  <section id="formation">
    <h2
      class="text-xl sm:text-2xl font-heading font-bold text-regal-navy-700 dark:text-regal-navy-300 mb-4 text-center"
    >
      Formation
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="formation in formations"
        :key="formation.year"
        class="bento-cell p-5 flex flex-col"
      >
        <span class="font-code text-sm text-spicy-paprika-500 mb-1">{{ formation.year }}</span>
        <h3 class="font-heading font-bold text-coffee-bean-950 dark:text-soft-blush-50 mb-1">
          {{ formation.title }}
        </h3>
        <p class="text-sm text-regal-navy-600 dark:text-regal-navy-400 mb-2">
          {{ formation.school }}
        </p>
        <p class="text-sm text-coffee-bean-600 dark:text-soft-blush-300 mt-auto">
          {{ formation.detail }}
        </p>
      </div>
    </div>
  </section>
</template>
