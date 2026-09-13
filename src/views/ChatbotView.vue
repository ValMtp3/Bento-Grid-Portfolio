<template>
  <!-- Pas de fond pose ici : le degrade du site, porte par <body>, doit rester
       visible autour de la carte. Un aplat gris le recouvrait et detachait cette
       page du reste du portfolio. -->
  <div class="min-h-screen px-4 py-8 sm:py-10">
    <div class="mx-auto max-w-4xl">
      <header class="mb-5 border-b border-coffee-bean-200/70 pb-3 dark:border-soft-blush-50/10 sm:mb-6">
        <p
          class="mb-1 font-code text-[10px] font-semibold uppercase tracking-[0.2em] text-spicy-paprika-600 dark:text-spicy-paprika-400"
        >
          $ / Assistant
        </p>
        <h1
          class="font-heading text-xl font-bold text-balance text-regal-navy-700 dark:text-regal-navy-300 sm:text-2xl"
        >
          Chatbot IA
        </h1>
        <p class="mt-2 max-w-xl text-sm text-pretty text-coffee-bean-600 dark:text-soft-blush-300">
          Posez vos questions sur mon parcours, mes projets et mes compétences. Les réponses sont
          générées par un modèle, elles peuvent contenir des erreurs.
        </p>
      </header>

      <!-- Meme cadre que les cellules du bento, sans leur reaction au survol :
           une carte de cette taille n'a pas a bouger quand la souris la traverse. -->
      <div
        class="h-[72dvh] overflow-hidden rounded-xl border border-coffee-bean-100 shadow-sm shadow-coffee-bean-950/10 md:h-200 dark:border-soft-blush-50/[0.12] dark:shadow-coffee-bean-950/20"
      >
        <ChatInterface />
      </div>
    </div>
  </div>
</template>

<script setup>
// Les balises meta de la page sont appliquees par App.vue depuis router/index.js.
import ChatInterface from '@/components/ChatInterface.vue';
</script>
