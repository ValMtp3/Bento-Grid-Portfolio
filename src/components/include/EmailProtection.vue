<script setup>
import { computed, onMounted, ref } from 'vue';

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

// L'adresse complete n'existe jamais en clair dans le HTML servi : un harvester
// la recupererait telle quelle. Le texte affiche une forme lisible par un
// humain mais pas copiable par un bot ("x [at] y [point] z"), et le href
// mailto n'est construit qu'au montage, cote client. Avant le montage le lien
// n'a pas de href : il devient cliquable une frame plus tard, le temps que Vue
// monte.
const email = computed(() => `${props.user}@${props.domain}`);
const display = computed(() => `${props.user} [at] ${props.domain.replace(/\./g, ' [point] ')}`);
const href = ref(null);

onMounted(() => {
  href.value = `mailto:${email.value}`;
});
</script>

<template>
  <a :href="href" class="hover:underline transition-colors" v-bind="$attrs">
    <slot>{{ display }}</slot>
  </a>
</template>
