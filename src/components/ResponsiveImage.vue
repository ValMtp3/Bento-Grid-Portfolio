<script setup>
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

const getResponsiveSrc = (src, size) => {
  if (!src) return '';
  if (src.endsWith('.svg') || src.startsWith('data:') || !src.includes('assets_index')) {
    return src;
  }
  const path = src.substring(0, src.lastIndexOf('/'));
  let filename = src.substring(src.lastIndexOf('/') + 1);
  const lastDot = filename.lastIndexOf('.');
  if (lastDot !== -1) {
    filename = filename.substring(0, lastDot) + '.webp';
  }
  return `${path}/${size}/${encodeURIComponent(filename)}`;
};

const srcset = (props.src.endsWith('.svg') || props.src.startsWith('data:') || !props.src.includes('assets_index'))
  ? undefined
  : `${getResponsiveSrc(props.src, 360)} 360w, ${getResponsiveSrc(props.src, 400)} 400w, ${getResponsiveSrc(props.src, 640)} 640w, ${getResponsiveSrc(props.src, 800)} 800w, ${getResponsiveSrc(props.src, 1200)} 1200w, ${getResponsiveSrc(props.src, 1400)} 1400w`;
</script>

<template>
  <img
    :src="getResponsiveSrc(src, 640)"
    :srcset="srcset"
    :sizes="sizes"
    :alt="alt"
    :loading="loading"
    :decoding="decoding"
    :fetchpriority="fetchpriority"
    :class="class"
  />
</template>
