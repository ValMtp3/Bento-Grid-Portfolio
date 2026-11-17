<script setup>
import SectionHeading from '@/components/SectionHeading.vue';
import { trackMatomoEvent } from '@/matomo';

const facts = [
  { label: 'Rôle', value: 'Auteur, seul développeur' },
  { label: 'Période', value: '2025 – 2026 (v2.4)' },
  { label: 'Distribution', value: 'Cask Homebrew, releases signées' },
  { label: 'Format', value: 'v4 (.chto)' },
];

const stack = ['Go', 'AES-256-GCM', 'ChaCha20-Poly1305', 'Argon2id', 'zstd', 'GoReleaser', 'cosign'];
</script>

<template>
  <main class="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
    <router-link
      to="/projets"
      class="mb-6 inline-block font-code text-xs uppercase tracking-[0.16em] text-coffee-bean-600 transition-colors hover:text-spicy-paprika-600 dark:text-soft-blush-300 dark:hover:text-spicy-paprika-400"
    >
      ← Tous les projets
    </router-link>

    <SectionHeading :level="1" index="05" label="Étude de cas" title="Chiffremento CLI" />

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
          Chiffremento CLI est un outil en ligne de commande écrit en Go pour chiffrer et
          déchiffrer des fichiers et des dossiers. Lancé sans argument, il ouvre une interface
          guidée plein écran ; avec des flags, il s'intègre dans des scripts.
        </p>
      </section>

      <section>
        <h2 class="mb-3 font-heading text-2xl font-bold text-coffee-bean-950 dark:text-soft-blush-50">
          Le format v4 : engagement de clé
        </h2>
        <p>
          Le format v4 ajoute un témoin de 32 octets sur la clé maîtresse, comparé avant tout
          déchiffrement. Un mot de passe faux est annoncé comme tel immédiatement, au lieu d'une
          erreur d'authentification en fin de lecture — et l'attaque par oracle de
          partitionnement n'a plus de prise.
        </p>
      </section>

      <section>
        <h2 class="mb-3 font-heading text-2xl font-bold text-coffee-bean-950 dark:text-soft-blush-50">
          Enveloppe DEK/KEK : changer de mot de passe sans relire le fichier
        </h2>
        <p class="mb-3">
          La clé qui chiffre le contenu est tirée au hasard puis scellée dans l'en-tête : elle ne
          dépend plus du mot de passe. Résultat, <code>-mode passwd</code> change le mot de passe
          en réécrivant 117 octets d'en-tête, quelle que soit la taille du fichier.
        </p>
        <p>
          La nuance honnête : l'ancien mot de passe continue d'ouvrir toute copie antérieure du
          fichier (sauvegarde, snapshot). Pour une révocation complète, il faut déchiffrer puis
          rechiffrer — et le dire, plutôt que le cacher.
        </p>
      </section>

      <section>
        <h2 class="mb-3 font-heading text-2xl font-bold text-coffee-bean-950 dark:text-soft-blush-50">
          AEAD en streaming, KDF à paramètres inscrits
        </h2>
        <p class="mb-3">
          Le contenu est chiffré en AES-256-GCM ou ChaCha20-Poly1305, en streaming. La clé est
          dérivée du mot de passe en Argon2id (m=256 MiB, t=3, p=4) avec un sel de 16 octets.
        </p>
        <p>
          Les paramètres du KDF sont inscrits dans le fichier : un chiffrement ancien reste
          lisible après un durcissement du coût, au lieu de devenir illisible.
        </p>
      </section>

      <section>
        <h2 class="mb-3 font-heading text-2xl font-bold text-coffee-bean-950 dark:text-soft-blush-50">
          Dossiers, écriture atomique, distribution signée
        </h2>
        <p class="mb-3">
          Un dossier est empaqueté en tar au fil du chiffrement, sans archive intermédiaire sur
          le disque ; compression zstd, remplissage optionnel pour masquer la taille réelle,
          écriture atomique, et aucun fichier temporaire ne survit à un Ctrl+C.
        </p>
        <p>
          Côté distribution : cask Homebrew via GoReleaser, releases signées avec cosign, avec
          SBOM et attestation de provenance — on peut vérifier qu'un binaire vient bien du dépôt
          avant de lui confier des fichiers.
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
          Go pour un binaire unique, rapide et déployable partout ; un AEAD moderne plutôt qu'un
          mode maison ; Argon2id plutôt que SHA pour la dérivation. Chaque choix vise à réduire la
          surface d'erreur plutôt qu'à empiler des fonctionnalités.
        </p>
      </section>
    </article>

    <a
      href="https://github.com/ValMtp3/chiffremento-go-cli"
      target="_blank"
      rel="noopener noreferrer"
      @click="trackMatomoEvent('portfolio_project', 'open_repository', 'Chiffremento CLI — case study')"
      class="mt-10 inline-flex bg-spicy-paprika-700 px-5 py-2.5 font-code text-sm font-medium text-soft-blush-50 shadow-md shadow-spicy-paprika-500/30 transition-all duration-300 hover:bg-spicy-paprika-800 dark:bg-spicy-paprika-500 dark:text-coffee-bean-950 dark:hover:bg-spicy-paprika-400 hover:shadow-lg"
    >
      Voir le dépôt sur GitHub
    </a>
  </main>
</template>
