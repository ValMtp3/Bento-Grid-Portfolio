<script setup>
// Protege l'adresse email des harvesters, sur un site 100 % statique.
//
// Trois niveaux, porque un seul ne suffit pas :
//   1. Le HTML servi ne contient jamais l'email (voir obfuscateEmails dans
//      src/markdown.js pour le contenu pre-rendu).
//   2. Le DOM ne contient jamais le mailto : le href n'est pas pose, le lien
//      est reconstruit au clic via window.location. Un bot qui execute le JS
//      et lit les attributs ne trouve rien.
//   3. Le bundle JS ne contient pas l'email en clair : la prop `value` est
//      l'adresse encodee en base64, decodee ici. Un scan regex des assets ne
//      trouve que du base64.
//
// Limite honnete : un bot qui execute vraiment le JavaScript peut tout lire
// en memoire. Contre ce niveau-la, la seule parade est de ne plus publier
// l'email du tout (formulaire de contact uniquement).
const props = defineProps({
  value: {
    type: String,
    required: true,
  },
});

const email = atob(props.value);
const [user, domain] = email.split('@');
const dot = domain.lastIndexOf('.');
const display = `${user} [at] ${domain.slice(0, dot)} [point] ${domain.slice(dot + 1)}`;

const openMailClient = () => {
  window.location.href = `mailto:${email}`;
};
</script>

<template>
  <!-- Pas de href : sans lui le <a> n'est ni focusable ni active au clavier,
       d'ou role="link", tabindex et le keydown. -->
  <a
    role="link"
    tabindex="0"
    class="cursor-pointer hover:underline transition-colors"
    v-bind="$attrs"
    @click.prevent="openMailClient"
    @keydown.enter.prevent="openMailClient"
  >
    <slot>{{ display }}</slot>
  </a>
</template>
