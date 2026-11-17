<script setup>
import SectionHeading from '@/components/SectionHeading.vue';
import { trackMatomoEvent } from '@/matomo';

const facts = [
  { label: 'Rôle', value: 'Auteur, seul développeur' },
  { label: 'Période', value: 'Depuis novembre 2026' },
  { label: 'Statut', value: 'Projet d’apprentissage, en ligne' },
  { label: 'Portefeuille', value: '10 000 € simulés — aucun ordre réel' },
];

const stack = [
  'Python / FastAPI',
  'LiteLLM',
  'Jev (décisions)',
  'Mistral Large 4',
  'PostgreSQL 17 + pgvector',
  'Redis',
  'React 19',
  'Docker / VPS OVH',
];
</script>

<template>
  <main class="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
    <router-link
      to="/projets"
      class="mb-6 inline-block font-code text-xs uppercase tracking-[0.16em] text-coffee-bean-600 transition-colors hover:text-spicy-paprika-600 dark:text-soft-blush-300 dark:hover:text-spicy-paprika-400"
    >
      ← Tous les projets
    </router-link>

    <SectionHeading :level="1" index="05" label="Étude de cas" title="Investia" />

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
          Ce que c’est
        </h2>
        <p>
          En parallèle de mon poste chez Shaarp, je construis Investia : un harness d’agent
          IA écrit entièrement à la main, avec le conseil en investissement comme terrain
          d’apprentissage. Mon agent lit des données de marché quasi temps réel, produit des
          analyses sourcées et gère un portefeuille simulé de 10 000 €.
        </p>
        <p class="mt-3">
          Aucun ordre réel n’est jamais passé : ce projet ne donne aucun conseil financier,
          et une documentation sécurité/légal dédiée encadre ça.
        </p>
      </section>

      <section>
        <h2 class="mb-3 font-heading text-2xl font-bold text-coffee-bean-950 dark:text-soft-blush-50">
          Pourquoi un harness écrit à la main
        </h2>
        <p class="mb-3">
          Un harness, c’est tout ce qui entoure le modèle : ses outils, sa mémoire, ses règles,
          ses tests, ses journaux. Le modèle est le moteur, le harness est la voiture. Je
          voulais comprendre chaque brique avant d’empiler un framework.
        </p>
        <p>
          L’organisation du projet reflète ce choix : un AGENTS.md à la racine lu à chaque
          session, une spec écrite avant chaque fonctionnalité, des skills versionnés et
          réutilisables, une CI GitHub Actions (uv, Ruff, ty, pytest). C’est la même discipline
          que celle de <router-link to="/blog/harness2-google" class="underline">Harness² de Google</router-link>,
          mais écrite à la main.
        </p>
      </section>

      <section>
        <h2 class="mb-3 font-heading text-2xl font-bold text-coffee-bean-950 dark:text-soft-blush-50">
          Le routage de modèles : décisions contre exécution
        </h2>
        <p class="mb-3">
          J’ai séparé les deux rôles. Jev, un
          <router-link to="/blog/modeles-de-decision" class="underline">modèle de décision</router-link>,
          prend les jugements bornés (quel outil appeler, faut-il approfondir, faut-il escalader)
          avec des probabilités calibrées. GPT-6 Luna répond aux petites tâches. Mistral
          Large 4 fait le raisonnement lourd. Le tout passe par la gateway LiteLLM.
        </p>
        <p>
          Ce routage tient mon budget LLM à 10–20 €/mois : prompt caching, cache sémantique dans
          Redis, et des décisions à quelques centimes le million de tokens.
        </p>
      </section>

      <section>
        <h2 class="mb-3 font-heading text-2xl font-bold text-coffee-bean-950 dark:text-soft-blush-50">
          Les données de marché
        </h2>
        <p>
          Des sources gratuites et vérifiées : Finnhub (prix + news), Stooq (historique),
          CoinGecko et Binance (crypto), Frankfurter/ECB (taux de change), le tout mis en cache
          dans Redis. La mémoire et les embeddings vivent dans un PostgreSQL 17 avec pgvector.
        </p>
      </section>

      <section>
        <h2 class="mb-3 font-heading text-2xl font-bold text-coffee-bean-950 dark:text-soft-blush-50">
          Déploiement
        </h2>
        <p>
          Docker Compose sur mon VPS OVH partagé, derrière le Nginx Proxy Manager existant,
          avec Authelia pour l’authentification. Le chat agent tourne en SSE + AG-UI, le
          dashboard est en React 19 + TanStack. Le tout est servi sur
          investia.valentin-fiess.fr, et le dépôt est public.
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
          L’objectif n’est pas un produit, c’est d’apprendre : chaque brique est écrite,
          testée et tracée. La prochaine étape prévue est une comparaison des frameworks
          d’agents (LangGraph, Pydantic AI, OpenAI Agents SDK) pour voir lequel remplace le
          mieux mon harness maison.
        </p>
      </section>
    </article>

    <a
      href="https://github.com/ValMtp3/investia"
      target="_blank"
      rel="noopener noreferrer"
      @click="trackMatomoEvent('portfolio_project', 'open_repository', 'Investia — case study')"
      class="mt-10 inline-flex bg-spicy-paprika-700 px-5 py-2.5 font-code text-sm font-medium text-soft-blush-50 shadow-md shadow-spicy-paprika-500/30 transition-all duration-300 hover:bg-spicy-paprika-800 dark:bg-spicy-paprika-500 dark:text-coffee-bean-950 dark:hover:bg-spicy-paprika-400 hover:shadow-lg"
    >
      Voir le dépôt sur GitHub
    </a>
  </main>
</template>
