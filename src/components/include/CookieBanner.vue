<script setup>
import { onMounted, ref } from 'vue';

const showBanner = ref(false);

onMounted(() => {
  const consent = localStorage.getItem('cookiesAccepted');
  showBanner.value = consent === null;

  // Si le consentement a déjà été donné, appliquer à Matomo
  if (consent === 'true' && window._paq) {
    window._paq.push(['setConsentGiven']);
    window._paq.push(['trackPageView']);
  }
});

function acceptCookies() {
  localStorage.setItem('cookiesAccepted', 'true');
  showBanner.value = false;

  // Activer Matomo si le consentement est donné
  if (window._paq) {
    window._paq.push(['setConsentGiven']);
    window._paq.push(['trackPageView']);
  }
}

function declineCookies() {
  localStorage.setItem('cookiesAccepted', 'false');
  showBanner.value = false;

  // Désactiver Matomo si le consentement est refusé
  if (window._paq) {
    window._paq.push(['forgetConsentGiven']);
  }
}
</script>

<template>
  <div
    v-if="showBanner"
    id="cookie-banner"
    aria-label="Bannière de consentement aux cookies"
    aria-live="polite"
    class="fixed bottom-0 w-full bg-gray-800 dark:bg-gray-900 text-white p-4 z-50 transition-colors duration-300"
    role="dialog"
  >
    <div class="container mx-auto flex flex-col md:flex-row items-center justify-between">
      <p class="mb-4 md:mb-0">
        Ce site utilise des cookies et Matomo pour améliorer votre expérience utilisateur et
        collecter des statistiques anonymes. Pour en savoir plus, consultez notre
        <a class="text-blue-400 underline" href="/policy">Politique de Confidentialité</a>.
      </p>
      <div class="flex">
        <button
          id="accept-cookies"
          class="bg-green-700 hover:bg-green-800 dark:bg-green-700 dark:hover:bg-green-800 text-white font-bold py-2 px-4 rounded mr-2 transition-colors duration-300"
          @click="acceptCookies"
        >
          Accepter
        </button>
        <button
          id="decline-cookies"
          class="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
          @click="declineCookies"
        >
          Refuser
        </button>
      </div>
    </div>
  </div>
</template>
