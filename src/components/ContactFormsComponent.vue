<script setup>
import { onMounted, ref, watch } from 'vue';
import emailjs from '@emailjs/browser';
import Cookies from 'js-cookie';

const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const apikey = import.meta.env.VITE_EMAILJS_API;
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || 'YOUR_SITE_KEY';

const formSubmitted = ref(false);

const name = ref('');
const email = ref('');
const subject = ref('');
const message = ref('');
const errors = ref({});
const turnstileToken = ref(null);
const turnstileContainer = ref(null);

const validateForm = () => {
  errors.value = {};
  if (!name.value) errors.value.name = 'Le nom est requis.';
  if (!email.value || !/\S+@\S+\.\S+/.test(email.value))
    errors.value.email = 'Un email valide est requis.';
  if (!subject.value) errors.value.subject = 'Le sujet est requis.';
  if (!message.value) errors.value.message = 'Le message est requis.';
  return Object.keys(errors.value).length === 0;
};

const saveToCookie = (key, value) => {
  // Expire après 2 heures (2/24 de journée)
  Cookies.set(key, value, { expires: 1 / 12 });
};

const clearFormCookies = () => {
  Cookies.remove('form_name');
  Cookies.remove('form_email');
  Cookies.remove('form_subject');
  Cookies.remove('form_message');
};

const loadFromCookie = (key, defaultValue) => {
  return Cookies.get(key) || defaultValue;
};

const setupFormPersistence = () => {
  watch(name, (newValue) => {
    saveToCookie('form_name', newValue);
  });
  watch(email, (newValue) => saveToCookie('form_email', newValue));
  watch(subject, (newValue) => saveToCookie('form_subject', newValue));
  watch(message, (newValue) => saveToCookie('form_message', newValue));
};

onMounted(() => {
  name.value = loadFromCookie('form_name', '');
  email.value = loadFromCookie('form_email', '');
  subject.value = loadFromCookie('form_subject', '');
  message.value = loadFromCookie('form_message', '');
  setupFormPersistence();
  initTurnstile();
});

const initTurnstile = () => {
  const renderWidget = () => {
    if (window.turnstile && turnstileContainer.value) {
      window.turnstile.render(turnstileContainer.value, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'auto',
        callback: (token) => {
          turnstileToken.value = token;
        },
        'expired-callback': () => {
          turnstileToken.value = null;
        },
        'error-callback': () => {
          turnstileToken.value = null;
        },
      });
    } else {
      setTimeout(renderWidget, 200);
    }
  };
  renderWidget();
};

const onSubmit = () => {
  if (!turnstileToken.value) {
    alert('Veuillez compléter la vérification de sécurité.');
    return;
  }
  if (!validateForm()) {
    alert('Veuillez corriger les erreurs dans le formulaire.');
    return;
  }
  formSubmitted.value = true;
  sendFeedback(serviceId, templateId, {
    name: sanitizeInput(name.value),
    email: sanitizeInput(email.value),
    subject: sanitizeInput(subject.value),
    message: sanitizeInput(message.value),
  });
};

const sendFeedback = (serviceId, templateId, variables) => {
  emailjs
    .send(serviceId, templateId, variables, apikey)
    .then(() => {
      // Email successfully sent
      clearFormCookies();

      // Tracking Matomo : Événement de contact réussi
      if (window._paq) {
        window._paq.push(['trackEvent', 'Contact', 'Email Sent']);
      }
    })
    .catch((err) => {
      console.error('Il y a une erreur', err);
    });
};
const sanitizeInput = (input) => {
  input = input.trim();
  return input;
};
</script>

<template>
  <form v-if="!formSubmitted" ref="form" @submit.prevent="onSubmit">
    <div class="mb-3">
      <label class="mb-1 block text-base font-medium text-black dark:text-white" for="name">
        Prénom Nom :
      </label>
      <input
        id="name"
        v-model="name"
        :required="name === ''"
        class="w-full rounded-xl m-2 border border-[#e0e0e0] dark:border-gray-600 bg-white dark:bg-gray-900 py-3 px-6 text-base font-medium text-[#6B7280] dark:text-white outline-none focus:border-blue-900 dark:focus:border-blue-500 focus:shadow-md dark:focus:shadow-dark-md transition-colors duration-300"
        name="name"
        placeholder="Prénom Nom"
        type="text"
      />
      <span v-if="errors.name" class="text-red-500">{{ errors.name }}</span>
    </div>
    <div class="mb-3">
      <label class="mb-1 block text-base font-medium text-black dark:text-white" for="email">
        Adresse Mail
      </label>
      <input
        id="email"
        v-model="email"
        :required="email === ''"
        class="w-full resize-none rounded-xl m-2 border border-[#e0e0e0] dark:border-gray-600 bg-white dark:bg-gray-900 py-3 px-6 text-base font-medium text-[#6B7280] dark:text-white outline-none focus:border-blue-900 dark:focus:border-blue-500 focus:shadow-md dark:focus:shadow-dark-md transition-colors duration-300"
        name="email"
        placeholder="example@domain.com"
        type="email"
      />
      <span v-if="errors.email" class="text-red-500">{{ errors.email }}</span>
    </div>
    <div class="mb-3">
      <label class="mb-1 block text-base font-medium text-black dark:text-white" for="subject">
        Sujet
      </label>
      <input
        id="subject"
        v-model="subject"
        :required="subject === ''"
        class="w-full resize-none rounded-xl m-2 border border-[#e0e0e0] dark:border-gray-600 bg-white dark:bg-gray-900 py-3 px-6 text-base font-medium text-[#6B7280] dark:text-white outline-none focus:border-blue-900 dark:focus:border-blue-500 focus:shadow-md dark:focus:shadow-dark-md transition-colors duration-300"
        name="subject"
        placeholder="Entrer votre sujet"
        type="text"
      />
      <span v-if="errors.subject" class="text-red-500">{{ errors.subject }}</span>
    </div>
    <div class="mb-3">
      <label class="mb-1 block text-base font-medium text-black dark:text-white" for="message">
        Message
      </label>
      <textarea
        id="message"
        v-model="message"
        :required="message === ''"
        class="w-full resize-none rounded-xl m-2 border border-[#e0e0e0] dark:border-gray-600 bg-white dark:bg-gray-900 py-3 px-6 text-base font-medium text-[#6B7280] dark:text-white outline-none focus:border-blue-900 dark:focus:border-blue-500 focus:shadow-md dark:focus:shadow-dark-md transition-colors duration-300"
        name="message"
        placeholder="Entrer votre message"
        rows="4"
      ></textarea>
      <span v-if="errors.message" class="text-red-500">{{ errors.message }}</span>
    </div>
    <div ref="turnstileContainer" class="flex justify-center mb-3" v-show="!turnstileToken"></div>
    <p
      v-if="!turnstileToken"
      class="text-center text-[10px] text-amber-500 dark:text-amber-400 mb-3"
    >
      Veuillez compléter la vérification ci-dessus pour envoyer un message.
    </p>
    <div class="flex justify-center">
      <button
        :disabled="!turnstileToken"
        class="hover:shadow-form dark:hover:shadow-dark-md rounded-md bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 transition-all duration-300 py-3 px-8 text-base font-semibold text-white outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        type="submit"
      >
        Envoyer
      </button>
    </div>
  </form>
  <div v-else>
    <p class="text-center text-lime-500 dark:text-lime-300 p-8 text-xl font-medium">
      Votre message a été envoyé avec succès !
    </p>
  </div>
</template>
