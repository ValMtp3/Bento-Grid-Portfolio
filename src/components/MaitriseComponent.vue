<script setup>
import { Icon } from '@iconify/vue';
import SectionHeading from './SectionHeading.vue';

// Les trois cartes partagent exactement la meme structure : seuls le titre, sa
// couleur, la couleur de survol des icones et le nombre de colonnes changent.
// Les classes sont ecrites en clair pour rester detectables par Tailwind.
const skillGroups = [
  {
    title: 'Data & IA',
    titleClass: 'text-emerald-700 dark:text-emerald-400',
    iconHoverClass: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    columnsClass: 'grid-cols-3',
    skills: [
      { name: 'Python', icon: 'simple-icons:python' },
      { name: 'PyTorch', icon: 'simple-icons:pytorch' },
      { name: 'TensorFlow', icon: 'simple-icons:tensorflow' },
      { name: 'Scikit-Learn', icon: 'simple-icons:scikitlearn' },
      { name: 'Pandas', icon: 'simple-icons:pandas' },
      { name: 'Transformers', icon: 'simple-icons:huggingface' },
      { name: 'OpenAI API', icon: 'simple-icons:openai' },
      { name: 'RAG', icon: 'mdi:database-search' },
      { name: 'Mistral', icon: 'simple-icons:mistralai' },
      { name: 'n8n', icon: 'simple-icons:n8n' },
      { name: 'NLP', icon: 'mdi:message-processing-outline' },
      { name: 'Vision par ordinateur', icon: 'mdi:eye-outline' },
      { name: 'Agents IA', icon: 'mdi:robot-outline' },
    ],
  },
  {
    title: 'Web & Automation',
    titleClass: 'text-spicy-paprika-700 dark:text-spicy-paprika-400',
    iconHoverClass: 'group-hover:text-spicy-paprika-600 dark:group-hover:text-spicy-paprika-400',
    columnsClass: 'grid-cols-3',
    skills: [
      { name: 'HTML', icon: 'simple-icons:html5' },
      { name: 'Tailwind', icon: 'simple-icons:tailwindcss' },
      { name: 'VueJS', icon: 'simple-icons:vuedotjs' },
      { name: 'React', icon: 'simple-icons:react' },
      { name: 'Go', icon: 'simple-icons:go' },
      { name: 'PostgreSQL', icon: 'simple-icons:postgresql' },
      { name: 'MongoDB', icon: 'simple-icons:mongodb' },
      { name: 'API', icon: 'simple-icons:openapiinitiative' },
      { name: 'FastAPI', icon: 'simple-icons:fastapi' },
    ],
  },
  {
    title: 'MLOps & DevOps',
    titleClass: 'text-regal-navy-600 dark:text-regal-navy-400',
    iconHoverClass: 'group-hover:text-regal-navy-500 dark:group-hover:text-regal-navy-400',
    columnsClass: 'grid-cols-2',
    skills: [
      { name: 'Git', icon: 'simple-icons:git' },
      { name: 'Docker', icon: 'simple-icons:docker' },
      { name: 'Cloudflare', icon: 'simple-icons:cloudflare' },
      { name: 'OVH', icon: 'simple-icons:ovh' },
      { name: 'Cryptographie', icon: 'mdi:shield-check' },
    ],
  },
];
</script>

<template>
  <section>
    <SectionHeading index="04" label="Expertise" title="Compétences" />
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        v-for="group in skillGroups"
        :key="group.title"
        class="bento-cell p-6 flex flex-col justify-between"
      >
        <div>
          <h3 class="font-heading font-bold text-lg mb-4" :class="group.titleClass">
            {{ group.title }}
          </h3>
          <div class="grid gap-3" :class="group.columnsClass">
            <div
              v-for="skill in group.skills"
              :key="skill.name"
              class="flex flex-col items-center justify-center p-3 rounded-md bg-soft-blush-100/20 dark:bg-coffee-bean-900/30 border border-coffee-bean-100/10 dark:border-coffee-bean-800/20 hover:bg-white dark:hover:bg-coffee-bean-900 hover:scale-105 hover:shadow-md transition-all duration-300 group cursor-default"
            >
              <Icon
                :icon="skill.icon"
                class="w-8 h-8 text-coffee-bean-600 dark:text-soft-blush-400 transition-colors duration-300"
                :class="group.iconHoverClass"
              />
              <span
                class="text-[10px] font-code text-coffee-bean-700 dark:text-soft-blush-300 text-center mt-2 font-medium"
                >{{ skill.name }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
