<script setup>
import SectionHeading from '@/components/SectionHeading.vue';
import { trackMatomoEvent } from '@/matomo';

const facts = [
  { label: 'Rôle', value: 'Auteur, seul développeur' },
  { label: 'Période', value: 'Août 2026' },
  { label: 'Statut', value: 'Open source — GitLab' },
  { label: 'Format', value: 'Binaire Go, zéro dépendance' },
];

const stack = ['Go', 'crypto/rand', 'HKDF-SHA-512', 'BIP-39', 'SSE', 'CSP stricte'];
</script>

<template>
  <main class="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
    <router-link
      to="/projets"
      class="mb-6 inline-block font-code text-xs uppercase tracking-[0.16em] text-coffee-bean-600 transition-colors hover:text-spicy-paprika-600 dark:text-soft-blush-300 dark:hover:text-spicy-paprika-400"
    >
      ← Tous les projets
    </router-link>

    <SectionHeading :level="1" index="05" label="Étude de cas" title="Seed Generator" />

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
          Seed Generator produit des phrases BIP-39 — les mnémoniques de 12 à 24 mots qui
          servent de racine à un portefeuille crypto — hors ligne, en Go, avec la standard
          library uniquement. Le parti pris du projet est simple : un outil de sécurité doit
          être vérifiable, pas cru sur parole.
        </p>
      </section>

      <section>
        <h2 class="mb-3 font-heading text-2xl font-bold text-coffee-bean-950 dark:text-soft-blush-50">
          La règle d'or : crypto/rand reste la racine
        </h2>
        <p class="mb-3">
          Beaucoup de générateurs « renforcés » ajoutent des sources d'aléa exotiques. Ici, la
          racine de confiance reste <code>crypto/rand</code> : les sources auxiliaires (jitter
          CPU, télémétrie du runtime, souris, micro, caméra) sont mélangées comme diversifiants
          via HKDF-SHA-512, jamais en remplacement du CSPRNG. L'entropie ne peut donc que
          monter, jamais baisser.
        </p>
        <p>
          C'est un choix délibéré contre l'obscurité : chaque octet d'entropie du résultat
          vient soit du générateur cryptographique du système, soit d'un diversifiant
          documenté — rien d'autre.
        </p>
      </section>

      <section>
        <h2 class="mb-3 font-heading text-2xl font-bold text-coffee-bean-950 dark:text-soft-blush-50">
          L'auto-test au démarrage
        </h2>
        <p>
          Au lancement, le binaire rejoue les 96 vecteurs de test officiels du BIP-39 contre
          ses quatre dictionnaires embarqués (anglais, français, espagnol, japonais) et refuse
          de démarrer si un seul échoue. Un générateur de clés qui ne sait pas reproduire les
          vecteurs de la spec ne génère pas des clés.
        </p>
      </section>

      <section>
        <h2 class="mb-3 font-heading text-2xl font-bold text-coffee-bean-950 dark:text-soft-blush-50">
          Une interface web qui reste locale
        </h2>
        <p>
          L'interface est servie sur le loopback uniquement, vérifie l'en-tête
          <code>Host</code> contre le DNS rebinding, sert ses flux SSE par tickets à usage
          unique et applique une CSP stricte. Zéro dépendance externe signifie aussi zéro
          appel réseau : le binaire n'a aucune raison de sortir de la machine.
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
          Un outil qui manipule des secrets de portefeuille ne mérite la confiance qu'on lui
          accorde que s'il tient dans un binaire auditable ligne par ligne. La standard library
          de Go tient cette promesse ; chaque paquet tiers aurait été une surface d'attaque
          supplémentaire.
        </p>
      </section>
    </article>

    <a
      href="https://gitlab.com/ValMtp3/seed-generator"
      target="_blank"
      rel="noopener noreferrer"
      @click="trackMatomoEvent('portfolio_project', 'open_repository', 'Seed Generator — case study')"
      class="mt-10 inline-flex bg-spicy-paprika-700 px-5 py-2.5 font-code text-sm font-medium text-soft-blush-50 shadow-md shadow-spicy-paprika-500/30 transition-all duration-300 hover:bg-spicy-paprika-800 dark:bg-spicy-paprika-500 dark:text-coffee-bean-950 dark:hover:bg-spicy-paprika-400 hover:shadow-lg"
    >
      Voir le dépôt sur GitLab
    </a>
  </main>
</template>
