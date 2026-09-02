<script setup>
import SectionHeading from '@/components/SectionHeading.vue';
import { trackMatomoEvent } from '@/matomo';

const facts = [
  { label: 'Rôle', value: 'Fondateur, seul développeur' },
  { label: 'Période', value: 'Février – Juillet 2026' },
  { label: 'Utilisateur test', value: 'R2D Automation' },
  { label: 'Statut', value: 'En service, sans client' },
];

const stack = ['FastAPI', 'PostgreSQL / PGVector', 'React', 'Docker', 'Mistral API', 'VPS OVH'];
</script>

<template>
  <main class="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
    <router-link
      to="/projets"
      class="mb-6 inline-block font-code text-xs uppercase tracking-[0.16em] text-coffee-bean-600 transition-colors hover:text-spicy-paprika-600 dark:text-soft-blush-300 dark:hover:text-spicy-paprika-400"
    >
      ← Tous les projets
    </router-link>

    <SectionHeading :level="1" index="05" label="Étude de cas" title="Raguia" />

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
          Raguia branche un assistant de recherche sur les documents internes d'une entreprise. Je
          l'ai lancé et développé seul, de février à juillet 2026. R2D Automation, où je travaillais
          alors sur des pipelines de vision, a servi d'utilisateur test réel : c'est leur usage qui a
          orienté la plupart des décisions décrites ici.
        </p>
      </section>

      <section>
        <h2 class="mb-3 font-heading text-2xl font-bold text-coffee-bean-950 dark:text-soft-blush-50">
          La contrainte qui a tout décidé
        </h2>
        <p>
          Un RAG d'entreprise n'est pas un moteur de recherche avec un LLM devant. C'est un système
          qui, s'il se trompe une seule fois de périmètre, montre à un salarié un document qu'il
          n'avait pas le droit de lire. Sur un produit vendu à des PME, cette erreur-là ne se
          rattrape pas commercialement. Le reste de l'architecture découle de ce point.
        </p>
      </section>

      <section>
        <h2 class="mb-3 font-heading text-2xl font-bold text-coffee-bean-950 dark:text-soft-blush-50">
          Arbitrage 1 : PGVector plutôt qu'une base vectorielle dédiée
        </h2>
        <p class="mb-3">
          Le réflexe, sur un RAG, c'est Qdrant ou Weaviate. J'ai gardé Postgres avec PGVector, pour
          une raison qui n'a rien à voir avec la performance : deux bases, c'est deux modèles de
          permissions à tenir synchronisés, et donc une fenêtre où un document est indexé alors que
          ses droits d'accès ne le sont pas encore.
        </p>
        <p class="mb-3">
          Avec PGVector, les vecteurs et les droits vivent dans la même transaction. Un chunk se
          joint directement à la table des permissions en SQL, sans dupliquer ces permissions dans
          les métadonnées du vecteur. Et il n'y a qu'une base à sauvegarder, chiffrer et auditer.
        </p>
        <p>
          Le prix à payer : PGVector plafonne plus tôt qu'un moteur dédié, et le réglage de ses index
          est moins documenté. À l'échelle d'une PME, ce plafond était loin. J'ai échangé de la
          performance théorique contre une surface d'erreur plus petite.
        </p>
      </section>

      <section>
        <h2 class="mb-3 font-heading text-2xl font-bold text-coffee-bean-950 dark:text-soft-blush-50">
          Arbitrage 2 : filtrer au retrieval, pas après
        </h2>
        <p class="mb-3">
          Il y a deux façons d'appliquer les droits d'accès. Récupérer les meilleurs chunks puis
          retirer ceux que l'utilisateur ne peut pas voir. Ou borner la recherche vectorielle au
          périmètre autorisé avant qu'elle ne s'exécute.
        </p>
        <p class="mb-3">
          Le post-filtrage est plus simple à écrire, et il a deux défauts. Le top-k se vide : si huit
          des dix meilleurs chunks sont hors périmètre, la réponse se construit sur les deux qui
          restent. Surtout, les chunks interdits traversent le processus avant d'être écartés, et
          chaque log ou message d'erreur devient un endroit où ils peuvent apparaître.
        </p>
        <p class="mb-3">
          J'ai donc poussé le filtre dans la requête elle-même. C'est plus contraignant — il faut y
          penser à chaque chemin de lecture et prévoir les index composites qui vont avec — mais le
          cloisonnement devient une propriété de la requête au lieu d'une étape qu'on peut oublier.
        </p>
        <p>
          Le multi-tenant suit la même logique : l'identifiant du tenant est une colonne des chunks,
          filtrée dans la même clause. Un bug applicatif ne peut pas faire passer la frontière entre
          deux clients ; il faudrait un bug de requête.
        </p>
      </section>

      <section>
        <h2 class="mb-3 font-heading text-2xl font-bold text-coffee-bean-950 dark:text-soft-blush-50">
          Le point dur : le chunking et le réglage du retrieval
        </h2>
        <p class="mb-3">
          C'est là qu'est passé le plus de temps, et de loin. L'authentification, l'ingestion, les
          conteneurs, l'interface : du travail connu. Trouver le bon découpage des documents ne l'est
          pas.
        </p>
        <p class="mb-3">
          Un chunk trop petit perd son contexte : la phrase récupérée est juste, mais le modèle ne
          sait plus de quel contrat ou de quelle procédure elle vient. Trop gros, son vecteur devient
          la moyenne de plusieurs sujets et ne ressort sur aucune question précise. Le bon découpage
          dépend du type de document, et les documents d'une PME ne se ressemblent pas : un
          compte-rendu, un contrat, une fiche technique et un export de tableur n'ont ni la même
          structure ni la même densité.
        </p>
        <p>
          Le chunking ne se règle pas non plus isolément. Il interagit avec le nombre de chunks
          récupérés, le seuil de similarité et l'ordre dans lequel ils sont remis au modèle. Améliorer
          l'un dégrade souvent les autres. Il n'existe pas de réglage universel, seulement un cycle
          d'essais sur de vraies questions d'utilisateurs.
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
          Mistral par API et un serveur français : ce n'était pas de la décoration. L'argument de
          vente auprès de PME était que leurs documents ne quittent pas l'Europe, et cet argument
          contraignait le choix du modèle autant que celui de l'hébergeur.
        </p>
      </section>

      <section>
        <h2 class="mb-3 font-heading text-2xl font-bold text-coffee-bean-950 dark:text-soft-blush-50">
          Où ça en est
        </h2>
        <p class="mb-3">
          Le service tourne encore, sans client. Je l'ai arrêté commercialement faute d'en trouver, et
          parce que je suis entré chez Shaarp en juillet 2026.
        </p>
        <p>
          Ce que j'en retiens tient en une phrase : j'ai construit le produit avant d'avoir vérifié
          qu'on me l'achèterait. La partie technique a tenu. C'est la partie commerciale que je
          n'avais pas travaillée.
        </p>
      </section>
    </article>

    <a
      href="https://raguia.valentin-fiess.fr"
      target="_blank"
      rel="noopener noreferrer"
      @click="trackMatomoEvent('portfolio_project', 'open_project', 'Raguia — case study')"
      class="mt-10 inline-flex bg-spicy-paprika-500 px-5 py-2.5 font-code text-sm font-medium text-soft-blush-50 shadow-md shadow-spicy-paprika-500/30 transition-all duration-300 hover:bg-spicy-paprika-600 hover:shadow-lg"
    >
      Voir Raguia en ligne
    </a>
  </main>
</template>
