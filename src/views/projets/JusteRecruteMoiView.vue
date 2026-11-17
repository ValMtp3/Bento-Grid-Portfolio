<script setup>
import SectionHeading from '@/components/SectionHeading.vue';
import { trackMatomoEvent } from '@/matomo';

const facts = [
  { label: 'Rôle', value: 'Auteur — fork de JustHireMe' },
  { label: 'Période', value: 'Juin 2026' },
  { label: 'Statut', value: 'MVP France, AGPL-3.0' },
  { label: 'Données', value: '100 % locales par défaut' },
];

const stack = ['Tauri', 'Rust', 'React', 'Python / FastAPI', 'France Travail API', 'JobSpy', 'JSON-LD'];
</script>

<template>
  <main class="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
    <router-link
      to="/projets"
      class="mb-6 inline-block font-code text-xs uppercase tracking-[0.16em] text-coffee-bean-600 transition-colors hover:text-spicy-paprika-600 dark:text-soft-blush-300 dark:hover:text-spicy-paprika-400"
    >
      ← Tous les projets
    </router-link>

    <SectionHeading :level="1" index="05" label="Étude de cas" title="Juste Recrute Moi" />

    <dl class="bento-cell mb-10 grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
      <div v-for="fact in facts" :key="fact.label">
        <dt
          class="font-code text-[10px] uppercase tracking-[0.16em] text-spicy-paprika-600 dark:text-spicy-paprika-400"
        >
          {{ fact.label }}
        </dt>
        <dd class="mt-1 text-sm text-coffee-bean-800 dark:text-soft-blush-100">{{ fact.value }}</dd>
      </div>
    </dl>

    <article
      class="flex flex-col gap-8 text-base leading-relaxed text-coffee-bean-800 dark:text-soft-blush-100"
    >
      <section>
        <h2 class="mb-3 font-heading text-2xl font-bold text-coffee-bean-950 dark:text-soft-blush-50">
          Ce que c'est
        </h2>
        <p>
          Juste Recrute Moi est un agrégateur local-first d'offres d'emploi dédié au marché
          français : l'application récupère les offres depuis plusieurs sources, les normalise,
          filtre les lignes faibles, déduplique les doublons, puis les classe dans un pipeline
          local.
        </p>
      </section>

      <section>
        <h2 class="mb-3 font-heading text-2xl font-bold text-coffee-bean-950 dark:text-soft-blush-50">
          Pourquoi un fork
        </h2>
        <p class="mb-3">
          Le projet part d'un fork de JustHireMe. La version amont est générique ; JRM la
          ramène au marché français : sources hexagonales, filtres et quality gate pensés pour
          les offres publiées en France.
        </p>
        <p>
          Le produit vise d'abord la recherche d'emploi, pas l'automatisation aveugle des
          candidatures.
        </p>
      </section>

      <section>
        <h2 class="mb-3 font-heading text-2xl font-bold text-coffee-bean-950 dark:text-soft-blush-50">
          Les sources, et le choix de ne rien payer
        </h2>
        <p class="mb-3">
          Prioritaires : l'API France Travail (source stable avec identifiants), les ATS
          directs (Greenhouse, Lever, Ashby, Workable, SmartRecruiters, Teamtailor) et
          l'import d'URL via le JSON-LD <code>JobPosting</code>. En best effort : JobSpy pour
          Indeed et Google Jobs, dont les résultats dépendent des limites des sites.
        </p>
        <p>
          Le projet évite volontairement les dépendances payantes obligatoires : pas de proxy
          payant, pas d'Apify imposé, aucune API commerciale requise pour la v1. Un agrégateur
          gratuit qui exige un abonnement dès le départ n'agrège rien.
        </p>
      </section>

      <section>
        <h2 class="mb-3 font-heading text-2xl font-bold text-coffee-bean-950 dark:text-soft-blush-50">
          Le pipeline local-first
        </h2>
        <p class="mb-3">
          Chaque offre passe par une chaîne fixe : normalisation, filtre qualité, déduplication,
          scoring, puis génération de dossiers de candidature sur mesure. Le profil, les offres,
          les scores et les documents générés restent stockés localement par défaut.
        </p>
        <p>
          L'auto-apply navigateur existe mais est désactivé par défaut : envoyer des candidatures
          automatiquement, c'est le choix de l'utilisateur, pas un réglage caché.
        </p>
      </section>

      <section>
        <h2 class="mb-3 font-heading text-2xl font-bold text-coffee-bean-950 dark:text-soft-blush-50">
          La stack, et pourquoi
        </h2>
        <div class="mb-3 flex flex-wrap gap-2">
          <span v-for="item in stack" :key="item" class="tag tag-navy">{{ item }}</span>
        </div>
        <p>
          Tauri + React pour une application desktop qui embarque son interface, Rust pour le
          cœur, Python / FastAPI pour le backend de collecte. Le tout sous licence AGPL-3.0 :
          un outil qui touche aux données de candidature se doit d'être transparent.
        </p>
      </section>
    </article>

    <a
      href="https://github.com/ValMtp3/Juste-Recrute-Moi"
      target="_blank"
      rel="noopener noreferrer"
      @click="trackMatomoEvent('portfolio_project', 'open_repository', 'Juste Recrute Moi — case study')"
      class="mt-10 inline-flex bg-spicy-paprika-700 px-5 py-2.5 font-code text-sm font-medium text-soft-blush-50 shadow-md shadow-spicy-paprika-500/30 transition-all duration-300 hover:bg-spicy-paprika-800 dark:bg-spicy-paprika-500 dark:text-coffee-bean-950 dark:hover:bg-spicy-paprika-400 hover:shadow-lg"
    >
      Voir le dépôt sur GitHub
    </a>
  </main>
</template>
