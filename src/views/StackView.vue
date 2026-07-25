<script setup>
// Les balises meta de la page sont appliquees par App.vue depuis router/index.js.
import DocSection from '@/components/include/DocSection.vue';

const stack = [
  {
    title: 'Matériel',
    items: [
      { label: 'Ordinateur', value: 'MacBook Air M1 2020, 13", 8 Go de RAM, 256 Go de stockage' },
      { label: 'Écrans externes', value: 'Écrans externe ARZOPA FullHD' },
    ],
  },
  {
    title: "Système d'exploitation",
    items: [{ label: 'OS', value: 'macOS Sonoma 14.0' }],
  },
  {
    title: 'Navigateur',
    items: [{ label: 'Navigateur', value: 'Arc, Brave' }],
  },
  {
    title: 'IDE',
    items: [
      { label: 'IDE principaux', value: 'WebStorm, PhpStorm, PyCharm (suite IntelliJ)' },
      { label: 'Pour les retouches rapides', value: 'CursorAI' },
    ],
  },
  {
    title: 'Plugins IDE',
    items: [{ label: 'Plugin', value: 'GitHub Copilot' }],
  },
  {
    title: 'Versioning',
    items: [
      { label: 'Outil de versioning', value: 'GitHub' },
      { label: 'Client', value: 'GitHub Desktop' },
    ],
  },
  {
    title: 'Gestion de projet',
    items: [{ label: 'Outils', value: 'Linear, Notion, Trello' }],
  },
  {
    title: 'Communication',
    items: [{ label: 'Outils', value: 'Discord, Zoom, Microsoft Teams, Slack, Telegram' }],
  },
  {
    title: 'Déploiement',
    items: [{ label: 'Outils', value: 'Cyberduck ( FTP), Docker, Cloudflare, Plesk' }],
  },
  {
    title: 'Statistique',
    items: [{ label: 'Outils', value: 'Google analytics, Semrush' }],
  },
  {
    title: 'Framework CSS',
    items: [{ label: 'Outil', value: 'Tailwind CSS' }],
  },
  {
    title: 'Intelligence Artificielle',
    items: [{ label: 'Outils', value: 'ChatGPT, Mistral' }],
  },
  {
    title: 'Design',
    items: [{ label: 'Outil', value: 'Figma' }],
  },
  {
    title: 'Outils de productivité',
    items: [{ label: 'Outils', value: 'Notion, Raycast' }],
  },
  {
    title: 'Virtualisation',
    items: [{ label: 'Outil', value: 'Parallels Desktop' }],
  },
];
</script>

<template>
  <div class="text-gray-800 dark:text-soft-blush-200">
    <div class="container mx-auto p-6">
      <h1 class="text-3xl font-bold mb-6 text-center dark:text-soft-blush-50">
        Ma Stack Développement
      </h1>

      <DocSection v-for="section in stack" :key="section.title" :title="section.title">
        <p v-for="item in section.items" :key="item.label">
          <strong>{{ item.label }} :</strong> {{ item.value }}
        </p>
      </DocSection>
    </div>
  </div>
</template>
