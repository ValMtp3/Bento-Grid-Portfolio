<template>
  <!-- GitHub activity cell -->
  <div class="md:col-span-2 bento-cell p-5 sm:p-6 flex flex-col justify-between overflow-hidden">
    <div class="flex items-start justify-between gap-3 mb-4">
      <div>
        <p class="font-code text-xs text-regal-navy-700 dark:text-regal-navy-300 mb-1">
          ~ dev activity
        </p>
        <h3
          class="font-heading font-bold text-base sm:text-lg text-coffee-bean-950 dark:text-soft-blush-50"
        >
          Historique GitHub
        </h3>
      </div>
      <a
        href="https://github.com/ValMtp3"
        target="_blank"
        rel="noopener noreferrer"
        class="font-code text-xs text-spicy-paprika-600 dark:text-spicy-paprika-400 hover:text-spicy-paprika-700 dark:hover:text-spicy-paprika-300 transition-colors"
      >
        @ValMtp3
      </a>
    </div>
    <a
      href="https://github.com/ValMtp3"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Voir l'historique de contributions GitHub de Valentin Fiess"
      class="block rounded-md border border-coffee-bean-100 dark:border-soft-blush-50/10 bg-soft-blush-100/60 dark:bg-coffee-bean-950/40 p-2.5 hover:border-spicy-paprika-300 dark:hover:border-spicy-paprika-500 transition-colors"
    >
      <img
        src="https://ghchart.rshah.org/E65A28/ValMtp3"
        alt="Historique global des contributions GitHub de Valentin Fiess"
        width="720"
        height="86"
        loading="eager"
        decoding="async"
        fetchpriority="high"
        class="h-[86px] w-full object-fill opacity-90"
      />
    </a>
    <div class="mt-3 flex flex-wrap gap-2">
      <span
        class="font-code text-[11px] px-2 py-1 border border-regal-navy-200 dark:border-regal-navy-800 text-regal-navy-700 dark:text-regal-navy-200 bg-regal-navy-50/80 dark:bg-regal-navy-950/40"
      >
        commits publics
      </span>
      <span
        class="font-code text-[11px] px-2 py-1 border border-coffee-bean-100 dark:border-soft-blush-50/10 text-coffee-bean-700 dark:text-soft-blush-200 bg-soft-blush-100/70 dark:bg-coffee-bean-950/30"
      >
        projets data / IA / web
      </span>
    </div>
  </div>
</template>
