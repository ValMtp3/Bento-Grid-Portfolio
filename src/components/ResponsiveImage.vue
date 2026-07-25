<script setup>
import { computed } from 'vue';

// Largeurs generees par image_processor.go dans public/assets/assets_index/<w>/.
const WIDTHS = [360, 400, 640, 800, 1200, 1400];
const FALLBACK_WIDTH = 640;

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    required: true,
  },
  class: {
    type: String,
    default: '',
  },
  sizes: {
    type: String,
    default:
      '(max-width: 360px) 360px, (max-width: 480px) 400px, (max-width: 768px) 640px, (max-width: 1024px) 800px, (max-width: 1400px) 1200px, 1400px',
  },
  loading: {
    type: String,
    default: 'lazy',
  },
  decoding: {
    type: String,
    default: 'async',
  },
  fetchpriority: {
    type: String,
    default: 'auto',
  },
});

// Seules les images passees par le pipeline de redimensionnement ont des
// declinaisons : SVG, data-URI et URLs externes sont servis tels quels.
const hasVariants = computed(
  () =>
    !props.src.endsWith('.svg') &&
    !props.src.startsWith('data:') &&
    props.src.includes('assets_index'),
);

const variantUrl = (width) => {
  const segments = props.src.split('/');
  const filename = segments.pop().replace(/\.[^.]*$/, '.webp');
  return [...segments, width, encodeURIComponent(filename)].join('/');
};

const resolvedSrc = computed(() => (hasVariants.value ? variantUrl(FALLBACK_WIDTH) : props.src));
const srcset = computed(() =>
  hasVariants.value
    ? WIDTHS.map((width) => `${variantUrl(width)} ${width}w`).join(', ')
    : undefined,
);
</script>

<template>
  <img
    :src="resolvedSrc"
    :srcset="srcset"
    :sizes="sizes"
    :alt="alt"
    :loading="loading"
    :decoding="decoding"
    :fetchpriority="fetchpriority"
    :class="class"
  />
</template>
