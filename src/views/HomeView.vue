<script setup>
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import PresentationComponent from '@/components/PresentationComponent.vue';
import StatusComponent from '@/components/StatusComponent.vue';
import StatsComponent from '@/components/StatsComponent.vue';
import PulseComponent from '@/components/PulseComponent.vue';
import FootballComponent from '@/components/FootballComponent.vue';
import FavorisComponent from '@/components/FavorisComponent.vue';
import DeferredRender from '@/components/DeferredRender.vue';
import { getScrollBehavior } from '@/scroll';

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

  // Toutes les sections situees avant la cible doivent etre montees, sinon la
  // cible se deplacerait encore pendant le defilement.
  const requiredSections = sectionOrder.slice(0, targetIndex + 1);
  const tryScroll = () => {
    if (!requiredSections.every((id) => document.querySelector(`#${id} > section`))) return false;

    sectionObserver?.disconnect();
    sectionObserver = undefined;
    document.getElementById(targetId)?.scrollIntoView({ behavior: getScrollBehavior() });
    return true;
  };

  if (tryScroll() || !homeContent.value) return;

  sectionObserver = new MutationObserver(tryScroll);
  sectionObserver.observe(homeContent.value, { childList: true, subtree: true });
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
      <StatsComponent />
      <PulseComponent />
      <FootballComponent />
    </section>
    <DeferredRender :eager="targetSectionIndex >= 0" min-height="220px" target-id="entreprises">
      <EntrepriseComponent />
    </DeferredRender>
    <DeferredRender
      :eager="targetSectionIndex >= 1"
      min-height="740px"
      placeholder-class="md:min-h-[520px] lg:min-h-[300px]"
      target-id="experience"
    >
      <ExperienceComponent />
    </DeferredRender>
    <DeferredRender
      :eager="targetSectionIndex >= 2"
      min-height="620px"
      placeholder-class="md:min-h-[300px] lg:min-h-[180px]"
      target-id="formation"
    >
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
    <FavorisComponent />
  </div>
</template>
