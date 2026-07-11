<script setup>
import { Icon } from '@iconify/vue';
import SectionHeading from './SectionHeading.vue';

const aiSkills = [
  { name: 'Python', icon: 'simple-icons:python' },
  { name: 'PyTorch', icon: 'simple-icons:pytorch' },
  { name: 'TensorFlow', icon: 'simple-icons:tensorflow' },
  { name: 'Scikit-Learn', icon: 'simple-icons:scikitlearn' },
  { name: 'Pandas', icon: 'simple-icons:pandas' },
  { name: 'Transformers', icon: 'simple-icons:huggingface' },
];

const webSkills = [
  { name: 'HTML', icon: 'simple-icons:html5' },
  { name: 'Tailwind', icon: 'simple-icons:tailwindcss' },
  { name: 'VueJS', icon: 'simple-icons:vuedotjs' },
  { name: 'React', icon: 'simple-icons:react' },
  { name: 'Go', icon: 'simple-icons:go' },
  { name: 'PostgreSQL', icon: 'simple-icons:postgresql' },
  { name: 'MongoDB', icon: 'simple-icons:mongodb' },
  { name: 'API', icon: 'simple-icons:openapiinitiative' },
  { name: 'FastAPI', icon: 'simple-icons:fastapi' },
  { name: 'n8n', icon: 'simple-icons:n8n' },
];

const devopsSkills = [
  { name: 'Git', icon: 'simple-icons:git' },
  { name: 'Docker', icon: 'simple-icons:docker' },
  { name: 'Cloudflare', icon: 'simple-icons:cloudflare' },
  { name: 'OVH', icon: 'simple-icons:ovh' },
];
</script>

<template>
  <!-- ═══ Skills Section ═══ -->
  <section id="competences">
    <SectionHeading index="04" label="Expertise" title="Compétences" />
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Data & IA -->
      <div class="bento-cell p-6 flex flex-col justify-between">
        <div>
          <h3
            class="font-heading font-bold text-lg text-emerald-700 dark:text-emerald-400 mb-4"
          >
            Data & IA
          </h3>
          <div class="grid grid-cols-3 gap-3">
            <div
              v-for="skill in aiSkills"
              :key="skill.name"
              class="flex flex-col items-center justify-center p-3 rounded-md bg-soft-blush-100/20 dark:bg-coffee-bean-900/30 border border-coffee-bean-100/10 dark:border-coffee-bean-800/20 hover:bg-white dark:hover:bg-coffee-bean-900 hover:scale-105 hover:shadow-md transition-all duration-300 group cursor-default"
            >
              <Icon
                :icon="skill.icon"
                class="w-8 h-8 text-coffee-bean-600 dark:text-soft-blush-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300"
              />
              <span
                class="text-[10px] font-code text-coffee-bean-700 dark:text-soft-blush-300 text-center mt-2 font-medium"
                >{{ skill.name }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Web & Automation -->
      <div class="bento-cell p-6 flex flex-col justify-between">
        <div>
          <h3
            class="font-heading font-bold text-lg text-spicy-paprika-700 dark:text-spicy-paprika-400 mb-4"
          >
            Web & Automation
          </h3>
          <div class="grid grid-cols-3 gap-3">
            <div
              v-for="skill in webSkills"
              :key="skill.name"
              class="flex flex-col items-center justify-center p-3 rounded-md bg-soft-blush-100/20 dark:bg-coffee-bean-900/30 border border-coffee-bean-100/10 dark:border-coffee-bean-800/20 hover:bg-white dark:hover:bg-coffee-bean-900 hover:scale-105 hover:shadow-md transition-all duration-300 group cursor-default"
            >
              <Icon
                :icon="skill.icon"
                class="w-8 h-8 text-coffee-bean-600 dark:text-soft-blush-400 group-hover:text-spicy-paprika-600 dark:group-hover:text-spicy-paprika-400 transition-colors duration-300"
              />
              <span
                class="text-[10px] font-code text-coffee-bean-700 dark:text-soft-blush-300 text-center mt-2 font-medium"
                >{{ skill.name }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- MLOps & DevOps -->
      <div class="bento-cell p-6 flex flex-col justify-between">
        <div>
          <h3
            class="font-heading font-bold text-lg text-regal-navy-600 dark:text-regal-navy-400 mb-4"
          >
            MLOps & DevOps
          </h3>
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="skill in devopsSkills"
              :key="skill.name"
              class="flex flex-col items-center justify-center p-3 rounded-md bg-soft-blush-100/20 dark:bg-coffee-bean-900/30 border border-coffee-bean-100/10 dark:border-coffee-bean-800/20 hover:bg-white dark:hover:bg-coffee-bean-900 hover:scale-105 hover:shadow-md transition-all duration-300 group cursor-default"
            >
              <Icon
                :icon="skill.icon"
                class="w-8 h-8 text-coffee-bean-600 dark:text-soft-blush-400 group-hover:text-regal-navy-500 dark:group-hover:text-regal-navy-400 transition-colors duration-300"
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
