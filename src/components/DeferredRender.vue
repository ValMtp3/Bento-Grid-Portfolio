<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps({
  rootMargin: {
    type: String,
    default: '400px 0px',
  },
  minHeight: {
    type: String,
    default: '1px',
  },
  targetId: {
    type: String,
    default: undefined,
  },
  eager: {
    type: Boolean,
    default: false,
  },
});

const container = ref(null);
const shouldRender = ref(false);
let observer;

const render = () => {
  shouldRender.value = true;
  observer?.disconnect();
  observer = undefined;
};

watch(
  () => props.eager,
  (eager) => {
    if (eager) render();
  },
  { immediate: true },
);

onMounted(() => {
  if (shouldRender.value) return;

  if (!('IntersectionObserver' in window)) {
    render();
    return;
  }

  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) render();
    },
    { rootMargin: props.rootMargin },
  );

  if (container.value) observer.observe(container.value);
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <div
    :id="targetId"
    ref="container"
    :style="shouldRender ? undefined : { minHeight }"
  >
    <slot v-if="shouldRender" />
  </div>
</template>
