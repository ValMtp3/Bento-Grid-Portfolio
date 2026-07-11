<script setup>
import { useMeta } from 'vue-meta';

// Meta tags pour la page Stack
useMeta({
  title: 'Stack Technique | Valentin Fiess - Outils & Technologies',
  meta: [
    {
      name: 'description',
      content:
        'Découvrez ma stack technique complète : IDE, frameworks, outils de développement et technologies utilisées par Valentin Fiess, développeur web et IA.',
    },
    {
      name: 'keywords',
      content:
        'stack technique, outils développement, IDE, WebStorm, PyCharm, Vue.js, Tailwind CSS, Valentin Fiess, technologies développeur',
    },
    { property: 'og:title', content: 'Stack Technique | Valentin Fiess - Outils & Technologies' },
    {
      property: 'og:description',
      content:
        'Découvrez ma stack technique complète : IDE, frameworks et outils de développement.',
    },
    { property: 'og:image', content: 'https://www.valentin-fiess.fr/assets/assets_index/VueJS.webp' },
    { property: 'og:url', content: 'https://www.valentin-fiess.fr/stack' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Stack Technique | Valentin Fiess - Outils & Technologies' },
    {
      name: 'twitter:description',
      content: 'Découvrez ma stack technique complète et mes outils de développement.',
    },
    { name: 'twitter:image', content: 'https://www.valentin-fiess.fr/assets/assets_index/VueJS.webp' },
    { name: 'author', content: 'Valentin Fiess' },
    { name: 'robots', content: 'index, follow' },
    { name: 'language', content: 'fr-FR' },
  ],
});
</script>

<template>
  <div class="text-gray-800 dark:text-soft-blush-200">
    <div class="container mx-auto p-6">
      <h1 class="text-3xl font-bold mb-6 text-center dark:text-soft-blush-50">Ma Stack Développement</h1>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-soft-blush-50">Matériel</h2>
      <div class="bg-white dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 p-4 shadow rounded-xl">
          <p>
            <strong>Ordinateur :</strong> MacBook Air M1 2020, 13", 8 Go de RAM, 256 Go de stockage
          </p>
          <p><strong>Écrans externes :</strong> Écrans externe ARZOPA FullHD</p>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-soft-blush-50">Système d'exploitation</h2>
      <div class="bg-white dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 p-4 shadow rounded-xl">
          <p><strong>OS :</strong> macOS Sonoma 14.0</p>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-soft-blush-50">Navigateur</h2>
      <div class="bg-white dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 p-4 shadow rounded-xl">
          <p><strong>Navigateur :</strong> Arc, Brave</p>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-soft-blush-50">IDE</h2>
      <div class="bg-white dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 p-4 shadow rounded-xl">
          <p><strong>IDE principaux :</strong> WebStorm, PhpStorm, PyCharm (suite IntelliJ)</p>
          <p><strong>Pour les retouches rapides :</strong> CursorAI</p>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-soft-blush-50">Plugins IDE</h2>
      <div class="bg-white dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 p-4 shadow rounded-xl">
          <p><strong>Plugin :</strong> GitHub Copilot</p>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-soft-blush-50">Versioning</h2>
      <div class="bg-white dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 p-4 shadow rounded-xl">
          <p><strong>Outil de versioning :</strong> GitHub</p>
          <p><strong>Client :</strong> GitHub Desktop</p>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-soft-blush-50">Gestion de projet</h2>
      <div class="bg-white dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 p-4 shadow rounded-xl">
          <p><strong>Outils :</strong> Linear, Notion, Trello</p>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-soft-blush-50">Communication</h2>
      <div class="bg-white dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 p-4 shadow rounded-xl">
          <p><strong>Outils :</strong> Discord, Zoom, Microsoft Teams, Slack, Telegram</p>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-soft-blush-50">Déploiement</h2>
      <div class="bg-white dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 p-4 shadow rounded-xl">
          <p><strong>Outils :</strong> Cyberduck ( FTP), Docker, Cloudflare, Plesk</p>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-soft-blush-50">Statistique</h2>
      <div class="bg-white dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 p-4 shadow rounded-xl">
          <p><strong>Outils :</strong> Google analytics, Semrush</p>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-soft-blush-50">Framework CSS</h2>
      <div class="bg-white dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 p-4 shadow rounded-xl">
          <p><strong>Outil :</strong> Tailwind CSS</p>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-soft-blush-50">Intelligence Artificielle</h2>
      <div class="bg-white dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 p-4 shadow rounded-xl">
          <p><strong>Outils :</strong> ChatGPT, Mistral</p>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-soft-blush-50">Design</h2>
      <div class="bg-white dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 p-4 shadow rounded-xl">
          <p><strong>Outil :</strong> Figma</p>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-soft-blush-50">Outils de productivité</h2>
      <div class="bg-white dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 p-4 shadow rounded-xl">
          <p><strong>Outils :</strong> Notion, Raycast</p>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-soft-blush-50">Virtualisation</h2>
      <div class="bg-white dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 p-4 shadow rounded-xl">
          <p><strong>Outil :</strong> Parallels Desktop</p>
        </div>
      </section>
    </div>
  </div>
</template>
