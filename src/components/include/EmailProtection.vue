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
const href = computed(() => `mailto:${email.value}`);
</script>

<template>
  <a :href="href" class="hover:underline transition-colors" v-bind="$attrs">
    <slot>{{ email }}</slot>
  </a>
</template>
