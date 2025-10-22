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
    default: '(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px',
  },
  loading: {
    type: String,
    default: 'lazy',
  },
  decoding: {
    type: String,
    default: 'async',
  },
});

const getResponsiveSrc = (src, size) => {
  const path = src.substring(0, src.lastIndexOf('/'));
  const filename = src.substring(src.lastIndexOf('/') + 1);
  return `${path}/${size}/${filename}`;
};

const srcset = `${getResponsiveSrc(props.src, 400)} 400w, ${getResponsiveSrc(props.src, 800)} 800w, ${getResponsiveSrc(props.src, 1200)} 1200w`;
</script>

<template>
  <img
    :src="getResponsiveSrc(src, 800)"
    :srcset="srcset"
    :sizes="sizes"
    :alt="alt"
    :loading="loading"
    :decoding="decoding"
    :class="class"
  />
</template>
