<script setup>
import { onMounted, ref } from 'vue';

const showBanner = ref(false);

onMounted(() => {
  const consent = localStorage.getItem('cookiesAccepted');
  showBanner.value = consent === null;
});

function acceptCookies() {
  localStorage.setItem('cookiesAccepted', 'true');
  showBanner.value = false;
}

function declineCookies() {
  localStorage.setItem('cookiesAccepted', 'false');
  showBanner.value = false;
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
        Ce site utilise des cookies pour améliorer votre expérience utilisateur et collecter des
        statistiques anonymes. Pour en savoir plus, consultez notre
        <a class="text-blue-400 underline" href="/policy">Politique de Confidentialité</a>.
      </p>
      <div class="flex">
        <button
          id="accept-cookies"
          class="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 transition-colors duration-300"
          @click="acceptCookies"
        >
          Accepter
        </button>
        <button
          id="decline-cookies"
          class="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
          @click="declineCookies"
        >
          Refuser
        </button>
      </div>
    </div>
  </div>
</template>
