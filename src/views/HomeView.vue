<script setup>
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import PresentationComponent from '@/components/PresentationComponent.vue';
import ContactComponent from '@/components/ContactComponent.vue';
import StatusComponent from '@/components/StatusComponent.vue';
import StatsComponent from '@/components/StatsComponent.vue';
import DeferredRender from '@/components/DeferredRender.vue';

const EntrepriseComponent = defineAsyncComponent(() => import('@/components/EntrepriseComponent.vue'));
const ExperienceComponent = defineAsyncComponent(() => import('@/components/ExperienceComponent.vue'));
const FormationComponent = defineAsyncComponent(() => import('@/components/FormationComponent.vue'));
const MaitriseComponent = defineAsyncComponent(() => import('@/components/MaitriseComponent.vue'));
const ProjetsComponent = defineAsyncComponent(() => import('@/components/ProjetsComponent.vue'));
const ContactFormsComponent = defineAsyncComponent(
  () => import('@/components/ContactFormsComponent.vue'),
);

const route = useRoute();
const sectionOrder = ['entreprises', 'experience', 'formation', 'competences', 'projets', 'contact'];
const targetSectionIndex = computed(() => sectionOrder.indexOf(route.hash.slice(1)));
const homeContent = ref(null);
let sectionObserver;

const scrollToHashWhenReady = async (hash) => {
  sectionObserver?.disconnect();
  sectionObserver = undefined;

  const targetId = hash.slice(1);
  const targetIndex = sectionOrder.indexOf(targetId);
  if (targetIndex < 0) return;

  await nextTick();

  const requiredSections = sectionOrder.slice(0, targetIndex + 1);
  const finishScroll = () => {
    const allMounted = requiredSections.every((id) =>
      document.querySelector(`#${id} > section`),
    );
    if (!allMounted) return;

    sectionObserver?.disconnect();
    sectionObserver = undefined;
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth';
    document.getElementById(targetId)?.scrollIntoView({ behavior });
  };

  finishScroll();
  if (sectionObserver || requiredSections.every((id) => document.querySelector(`#${id} > section`))) {
    return;
  }

  sectionObserver = new MutationObserver(finishScroll);
  if (homeContent.value) {
    sectionObserver.observe(homeContent.value, { childList: true, subtree: true });
  }
};

watch(
  () => route.hash,
  (hash) => scrollToHashWhenReady(hash),
  { immediate: true },
);

onBeforeUnmount(() => sectionObserver?.disconnect());
</script>

<template>
  <div ref="homeContent" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <PresentationComponent />
      <StatusComponent />
      <ContactComponent />
      <StatsComponent />
    </section>
    <DeferredRender :eager="targetSectionIndex >= 0" min-height="220px" target-id="entreprises">
      <EntrepriseComponent />
    </DeferredRender>
    <DeferredRender :eager="targetSectionIndex >= 1" min-height="440px" target-id="experience">
      <ExperienceComponent />
    </DeferredRender>
    <DeferredRender :eager="targetSectionIndex >= 2" min-height="440px" target-id="formation">
      <FormationComponent />
    </DeferredRender>
    <DeferredRender :eager="targetSectionIndex >= 3" min-height="420px" target-id="competences">
      <MaitriseComponent />
    </DeferredRender>
    <DeferredRender :eager="targetSectionIndex >= 4" min-height="560px" target-id="projets">
      <ProjetsComponent />
    </DeferredRender>
    <DeferredRender :eager="targetSectionIndex >= 5" min-height="600px" target-id="contact">
      <ContactFormsComponent />
    </DeferredRender>
  </div>
</template>
