<script setup>
import { computed } from 'vue';

const props = defineProps({
  user: {
    type: String,
    required: true,
  },
  domain: {
    type: String,
    required: true,
  },
});

const email = computed(() => `${props.user}@${props.domain}`);
</script>

<template>
  <a :href="'mailto:' + email">
    {{ email }}
  </a>
</template>
