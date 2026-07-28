<script setup>
// Les balises meta de la page sont appliquees par App.vue depuis router/index.js.
import DocSection from '@/components/include/DocSection.vue';

const stack = [
  {
    title: 'Matériel',
    items: [
      { label: 'Ordinateur', value: 'MacBook Air M4' },
      { label: 'Écrans externes', value: 'Écrans externe ARZOPA FullHD' },
    ],
  },
  {
    title: "Système d'exploitation",
    items: [{ label: 'OS', value: 'macOS Golden Gate 27' }],
  },
  {
    title: 'Navigateur',
    items: [{ label: 'Navigateur', value: 'Brave' }],
  },
  {
    title: 'IDE',
    items: [
      { label: 'Éditeur principal', value: 'ZED' },
      { label: 'Agent IA', value: 'OpenCode' },
    ],
  },
  {
    title: 'Versioning',
    items: [{ label: 'Plateforme', value: 'GitHub' }],
  },
  {
    title: 'Gestion de projet',
    items: [{ label: 'Outil', value: 'Linear' }],
  },
  {
    title: 'Communication',
    items: [
      { label: 'Outils', value: 'Discord, Telegram, Signal, Session, kmeet' },
    ],
  },
  {
    title: 'Déploiement & Infrastructure',
    items: [
      { label: 'Hébergement', value: 'VPS OVH, Cloudflare' },
      { label: 'Conteneurisation', value: 'Docker / Orbstack' },
      { label: 'Proxy', value: 'Caddy' },
      { label: 'Monitoring', value: 'Uptime Kuma' },
      { label: 'Sécurité', value: 'Crowdsec' },
      { label: 'FTP', value: 'Cyberduck' },
    ],
  },
  {
    title: 'Analytics',
    items: [{ label: 'Outil', value: 'Matomo' }],
  },
  {
    title: 'Framework CSS & UI',
    items: [
      { label: 'CSS', value: 'Tailwind CSS' },
      { label: 'Composants', value: 'Shadcn UI' },
    ],
  },
  {
    title: 'Design',
    items: [
      { label: 'Outils', value: 'Claude Design, Google Stitch' },
    ],
  },
  {
    title: 'Intelligence Artificielle',
    items: [
      { label: 'Agent principal', value: 'OpenCode — framework agentique pour le développement assisté par IA' },
      { label: 'Modèles', value: 'Mistral, Claude, Euria' },
      { label: 'Locaux', value: 'LM Studio / LocallyAI — modèles exécutés en local' },
    ],
  },
  {
    title: 'OpenCode — Tools',
    items: [
      { label: 'RTK', value: 'Compression des sorties shell et économie de tokens' },
      { label: 'lean-ctx', value: 'Context Engineering avancé — compression agressive du contexte, 81 outils MCP, 10 modes de lecture, support de 27 langages via tree-sitter AST' },
    ],
  },
  {
    title: 'OpenCode — MCP Servers',
    items: [
      { label: 'Context7', value: 'Documentation à jour des librairies et frameworks' },
      { label: 'Superpowers', value: 'Bibliothèque de skills réutilisables pour agents' },
    ],
  },
  {
    title: 'OpenCode — Plugins',
    items: [
      { label: 'opencode-dcp', value: 'Compression de contexte avancée (Deep Context Protocol)' },
      { label: 'envsitter-guard', value: 'Protection des fichiers .env contre les fuites' },
      { label: 'opencode-quota', value: 'Affichage et suivi des quotas de tokens' },
    ],
  },
  {
    title: 'OpenCode — Skills',
    items: [
      { label: 'autoskills', value: 'Installation automatique de skills en fonction de la stack du projet' },
    ],
  },
  {
    title: 'Productivité & Terminal',
    items: [
      { label: 'Prise de notes', value: 'Obsidian' },
      { label: 'Terminal', value: 'Ghostty (terminal GPU-accelerated)' },
      { label: 'SSH distant', value: 'Termius' },
    ],
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
