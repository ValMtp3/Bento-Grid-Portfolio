<script setup>
import ContactFormsComponent from '@/components/ContactFormsComponent.vue';
import PresentationComponent from '@/components/PresentationComponent.vue';
import ContactComponent from '@/components/ContactComponent.vue';
import ExperienceComponent from '@/components/ExperienceComponent.vue';
import FormationComponent from '@/components/FormationComponent.vue';
import EntrepriseComponent from '@/components/EntrepriseComponent.vue';
import MaitriseComponent from '@/components/MaitriseComponent.vue';
import ProjetsComponent from '@/components/ProjetsComponent.vue';
import StatusComponent from '@/components/StatusComponent.vue';
import StatsComponent from '@/components/StatsComponent.vue';
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <PresentationComponent />
      <StatusComponent />
      <ContactComponent />
      <StatsComponent />
    </section>
    <ExperienceComponent />
    <EntrepriseComponent />
    <FormationComponent />
    <MaitriseComponent />
    <ProjetsComponent />
    <ContactFormsComponent />
  </div>
</template>
