<template>
  <!-- Status Cell -->
  <div class="bento-cell p-6 flex flex-col items-center justify-center text-center">
    <p
      class="mb-2 font-code text-[10px] font-semibold uppercase tracking-[0.18em] text-regal-navy-600 dark:text-regal-navy-400"
    >
      $ disponible
    </p>
    <div class="flex items-center gap-3 mb-2">
      <span class="relative flex h-3 w-3">
        <span
          class="animate-ping absolute inline-flex h-full w-full bg-green-400 opacity-75"
        ></span>
        <span class="relative inline-flex h-3 w-3 bg-green-500"></span>
      </span>
      <span class="font-heading font-bold text-lg text-coffee-bean-950 dark:text-soft-blush-50">
        Ouvert aux opportunités
      </span>
    </div>
    <p class="text-coffee-bean-600 dark:text-soft-blush-300 text-sm">
      Disponible immédiatement pour un CDI, CDD ou une mission freelance.
    </p>
  </div>
</template>
