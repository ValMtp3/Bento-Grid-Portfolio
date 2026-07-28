<script setup>
import { useMeta } from 'vue-meta';

useMeta({
  title: 'Stack Technique | Valentin Fiess - Outils & Technologies',
  meta: [
    {
      name: 'description',
      content:
        'Stack technique complète de Valentin Fiess : développement agentique avec OpenCode, MCP, lean-ctx, ZED, infrastructure VPS OVH, et outils IA.',
    },
    {
      name: 'keywords',
      content:
        'stack technique, OpenCode, MCP, lean-ctx, ZED, agentic AI, développement IA, Valentin Fiess, outils développeur, VPS OVH, Orbstack',
    },
    { property: 'og:title', content: 'Stack Technique | Valentin Fiess - Développement Agentique & IA' },
    {
      property: 'og:description',
      content:
        'Stack technique complète : développement agentique avec OpenCode, MCP, lean-ctx, ZED, infrastructure VPS et outils IA.',
    },
    { property: 'og:image', content: 'https://www.valentin-fiess.fr/assets/assets_index/VueJS.webp' },
    { property: 'og:url', content: 'https://www.valentin-fiess.fr/stack' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Stack Technique | Valentin Fiess - Développement Agentique & IA' },
    {
      name: 'twitter:description',
      content: 'Stack technique complète : développement agentique avec OpenCode, MCP, lean-ctx, ZED et outils IA.',
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
        <div class="bg-white dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 p-4 shadow rounded-lg">
          <p><strong>Ordinateur :</strong> MacBook Air M4</p>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-soft-blush-50">Système d'exploitation</h2>
        <div class="bg-white dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 p-4 shadow rounded-lg">
          <p><strong>OS :</strong> macOS Golden Gate 27</p>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-soft-blush-50">Navigateur</h2>
        <div class="bg-white dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 p-4 shadow rounded-lg">
          <p><strong>Navigateur :</strong> Brave</p>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-soft-blush-50">IDE</h2>
        <div class="bg-white dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 p-4 shadow rounded-lg">
          <p><strong>Éditeur principal :</strong> ZED</p>
          <p class="text-sm text-gray-600 dark:text-soft-blush-300 mt-1">
            Éditeur performant natif, utilisé avec ses extensions intégrées.
          </p>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-soft-blush-50">Versioning</h2>
        <div class="bg-white dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 p-4 shadow rounded-lg">
          <p><strong>Plateforme :</strong> GitHub</p>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-soft-blush-50">Gestion de projet</h2>
        <div class="bg-white dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 p-4 shadow rounded-lg">
          <p><strong>Outil :</strong> Linear</p>
          <p class="text-sm text-gray-600 dark:text-soft-blush-300 mt-1">
            Suivi de projets et tickets, léger et rapide.
          </p>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-soft-blush-50">Communication</h2>
        <div class="bg-white dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 p-4 shadow rounded-lg">
          <p><strong>Outils :</strong> Discord, Telegram, Signal, Session, kmeet</p>
          <p class="text-sm text-gray-600 dark:text-soft-blush-300 mt-1">
            Messagerie instantanée et visioconférence, avec un focus sur la vie privée (Signal, Session).
          </p>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-soft-blush-50">Déploiement & Infrastructure</h2>
        <div class="bg-white dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 p-4 shadow rounded-lg">
          <p><strong>Hébergement :</strong> VPS OVH, Cloudflare</p>
          <p><strong>Conteneurisation :</strong> Docker / Orbstack</p>
          <p><strong>Proxy :</strong> Caddy</p>
          <p><strong>Monitoring :</strong> Uptime Kuma</p>
          <p><strong>Sécurité :</strong> Crowdsec</p>
          <p><strong>FTP :</strong> Cyberduck</p>
          <p class="text-sm text-gray-600 dark:text-soft-blush-300 mt-1">
            Infrastructure auto-hébergée : VPS OVH, reverse proxy avec Caddy, conteneurisation via Orbstack, sécurisé par Crowdsec et supervisé par Uptime Kuma.
          </p>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-soft-blush-50">Analytics</h2>
        <div class="bg-white dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 p-4 shadow rounded-lg">
          <p><strong>Outil :</strong> Matomo</p>
          <p class="text-sm text-gray-600 dark:text-soft-blush-300 mt-1">
            Analytics open source, auto-hébergé, respectueux de la vie privée.
          </p>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-soft-blush-50">Framework CSS & UI</h2>
        <div class="bg-white dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 p-4 shadow rounded-lg">
          <p><strong>CSS :</strong> Tailwind CSS</p>
          <p><strong>Composants :</strong> Shadcn UI</p>
          <p class="text-sm text-gray-600 dark:text-soft-blush-300 mt-1">
            Tailwind CSS pour le styling utilitaire, Shadcn UI pour les composants réutilisables.
          </p>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-soft-blush-50">Design</h2>
        <div class="bg-white dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 p-4 shadow rounded-lg">
          <p><strong>Outils :</strong> Claude Design, Google Stitch</p>
          <p class="text-sm text-gray-600 dark:text-soft-blush-300 mt-1">
            Design assisté par IA : Claude Design pour la génération UI, Google Stitch pour le prototypage.
          </p>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-soft-blush-50">Intelligence Artificielle</h2>

        <div class="bg-white dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 p-4 shadow rounded-lg mb-4">
          <h3 class="text-lg font-semibold mb-1 dark:text-soft-blush-50">Agents & Modèles</h3>
          <p><strong>Agent principal :</strong> OpenCode — framework agentique pour le développement assisté par IA</p>
          <p><strong>Modèles :</strong> Mistral, Claude, Euria</p>
          <p><strong>Locaux :</strong> LM Studio / LocallyAI — modèles exécutés en local</p>
          <p class="text-sm text-gray-600 dark:text-soft-blush-300 mt-1">
            OpenCode orchestre le développement agentique. Mistral, Claude et Euria pour les tâches générales. LM Studio et LocallyAI pour l'inférence locale sans dépendance cloud.
          </p>
        </div>

        <div class="bg-white dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 p-4 shadow rounded-lg mb-4">
          <h3 class="text-lg font-semibold mb-1 dark:text-soft-blush-50">OpenCode — Tools</h3>
          <p><strong>RTK :</strong> Compression des sorties shell et économie de tokens</p>
          <p><strong>lean-ctx :</strong> Context Engineering avancé — compression agressive du contexte, 81 outils MCP, 10 modes de lecture, support de 27 langages via tree-sitter AST</p>
          <p class="text-sm text-gray-600 dark:text-soft-blush-300 mt-1">
            RTK filtre et compresse les sorties de commandes pour réduire la consommation de tokens. lean-ctx optimise le contexte des agents IA en ne gardant que l'information pertinente.
          </p>
        </div>

        <div class="bg-white dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 p-4 shadow rounded-lg mb-4">
          <h3 class="text-lg font-semibold mb-1 dark:text-soft-blush-50">OpenCode — MCP Servers</h3>
          <p><strong>Context7 :</strong> Documentation à jour des librairies et frameworks</p>
          <p><strong>Superpowers :</strong> Bibliothèque de skills réutilisables pour agents</p>
          <p class="text-sm text-gray-600 dark:text-soft-blush-300 mt-1">
            Les MCP servers étendent les capacités des agents : Context7 fournit de la documentation fraîche, Superpowers apporte des skills prêts à l'emploi.
          </p>
        </div>

        <div class="bg-white dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 p-4 shadow rounded-lg mb-4">
          <h3 class="text-lg font-semibold mb-1 dark:text-soft-blush-50">OpenCode — Plugins</h3>
          <p><strong>opencode-dcp :</strong> Compression de contexte avancée (Deep Context Protocol)</p>
          <p><strong>envsitter-guard :</strong> Protection des fichiers .env contre les fuites</p>
          <p><strong>opencode-quota :</strong> Affichage et suivi des quotas de tokens</p>
          <p class="text-sm text-gray-600 dark:text-soft-blush-300 mt-1">
            Plugins pour étendre OpenCode : compression de contexte pour gagner en tokens, protection des secrets, et monitoring des quotas d'utilisation.
          </p>
        </div>

        <div class="bg-white dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 p-4 shadow rounded-lg">
          <h3 class="text-lg font-semibold mb-1 dark:text-soft-blush-50">OpenCode — Skills</h3>
          <p><strong>autoskills :</strong> Installation automatique de skills en fonction de la stack du projet</p>
          <p class="text-sm text-gray-600 dark:text-soft-blush-300 mt-1">
            Analyse la stack du projet et charge automatiquement les skills pertinents pour l'agent.
          </p>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-soft-blush-50">Productivité & Terminal</h2>
        <div class="bg-white dark:bg-coffee-bean-900/60 dark:border dark:border-coffee-bean-800/40 p-4 shadow rounded-lg">
          <p><strong>Prise de notes :</strong> Obsidian</p>
          <p><strong>Terminal :</strong> Ghostty (terminal GPU-accelerated)</p>
          <p><strong>SSH distant :</strong> Termius</p>
          <p class="text-sm text-gray-600 dark:text-soft-blush-300 mt-1">
            Obsidian pour le knowledge management en markdown lié, Ghostty comme terminal moderne et performant, Termius pour la gestion des connexions SSH.
          </p>
        </div>
      </section>
    </div>
  </div>
</template>
