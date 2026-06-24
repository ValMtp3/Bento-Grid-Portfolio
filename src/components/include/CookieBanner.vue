<script setup>
import { onMounted, ref } from 'vue';

const showBanner = ref(false);

onMounted(() => {
  const consent = localStorage.getItem('cookiesAccepted');
  showBanner.value = consent === null;

  if (consent === 'true' && window._paq) {
    window._paq.push(['rememberConsentGiven', 8760]);
    window._paq.push(['setDocumentTitle', document.title]);
    window._paq.push(['trackPageView']);
  }
});

function acceptCookies() {
  localStorage.setItem('cookiesAccepted', 'true');
  showBanner.value = false;

  if (window._paq) {
    window._paq.push(['rememberConsentGiven', 8760]);
    window._paq.push(['setDocumentTitle', document.title]);
    window._paq.push(['trackPageView']);
  }
}

function declineCookies() {
  localStorage.setItem('cookiesAccepted', 'false');
  showBanner.value = false;

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
    class="fixed bottom-0 w-full bg-coffee-bean-900 text-soft-blush-50 p-4 z-50"
    role="dialog"
  >
    <div class="container mx-auto flex flex-col md:flex-row items-center justify-between">
      <p class="mb-4 md:mb-0">
        Ce site utilise des cookies pour améliorer votre expérience utilisateur et collecter des
        statistiques anonymes. Pour en savoir plus, consultez notre
        <a class="text-regal-navy-400 underline" href="/policy">Politique de Confidentialité</a>.
      </p>
      <div class="flex">
        <button
          id="accept-cookies"
          class="bg-spicy-paprika-500 hover:bg-spicy-paprika-600 text-soft-blush-50 font-bold font-code py-2 px-4 rounded mr-2"
          @click="acceptCookies"
        >
          Accepter
        </button>
        <button
          id="decline-cookies"
          class="bg-coffee-bean-700 hover:bg-coffee-bean-800 text-soft-blush-50 font-bold font-code py-2 px-4 rounded"
          @click="declineCookies"
        >
          Refuser
        </button>
      </div>
    </div>
  </div>
</template>
