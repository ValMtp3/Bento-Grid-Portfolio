<script setup>
import { onMounted, ref, watch } from 'vue';
import emailjs from '@emailjs/browser';
import Cookies from 'js-cookie';
import SectionHeading from './SectionHeading.vue';

const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const apikey = import.meta.env.VITE_EMAILJS_API;
const isLocal =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.'));

const TURNSTILE_SITE_KEY = isLocal
  ? '1x00000000000000000000AA'
  : import.meta.env.VITE_TURNSTILE_SITE_KEY || 'YOUR_SITE_KEY';

const formSubmitted = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref('');

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
  if (!email.value || !/\S[^\s@]*@\S+\.\S+/.test(email.value))
    errors.value.email = 'Un email valide est requis.';
  if (!subject.value) errors.value.subject = 'Le sujet est requis.';
  if (!message.value) errors.value.message = 'Le message est requis.';
  return Object.keys(errors.value).length === 0;
};

const saveToCookie = (key, value) => {
  Cookies.set(key, value, {
    expires: 1 / 12,
    sameSite: 'Strict',
    secure: location.protocol === 'https:',
  });
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
  let attempts = 0;
  const MAX_ATTEMPTS = 20;

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
    } else if (attempts < MAX_ATTEMPTS) {
      attempts++;
      setTimeout(renderWidget, 200);
    } else {
      console.warn('Turnstile: échec après 20 tentatives');
    }
  };
  renderWidget();
};

const onSubmit = async () => {
  if (!turnstileToken.value) {
    alert('Veuillez compléter la vérification de sécurité.');
    return;
  }
  if (!validateForm()) {
    requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus());
    return;
  }
  errorMessage.value = '';
  isSubmitting.value = true;
  await sendFeedback(serviceId, templateId, {
    name: sanitizeInput(name.value),
    email: sanitizeInput(email.value),
    subject: sanitizeInput(subject.value),
    message: sanitizeInput(message.value),
  });
};

const sendFeedback = async (serviceId, templateId, variables) => {
  try {
    await emailjs.send(serviceId, templateId, variables, apikey);
      formSubmitted.value = true;
      clearFormCookies();
  } catch (err) {
      console.error("Erreur d'envoi EmailJS", err);
      errorMessage.value = "Une erreur est survenue lors de l'envoi. Veuillez réessayer.";
  } finally {
    isSubmitting.value = false;
  }
};
const sanitizeInput = (input) => {
  return input.trim();
};
</script>

<template>
  <section id="contact" class="bento-cell p-6">
    <SectionHeading index="06" label="Contact" title="Me contacter" />
    <form v-if="!formSubmitted" ref="form" @submit.prevent="onSubmit">
      <div class="mb-3">
        <label
          class="mb-1 block text-base font-medium text-regal-navy-700 dark:text-regal-navy-300 font-semibold"
          for="name"
        >
          Prénom Nom :
        </label>
        <input
          id="name"
          v-model="name"
          :required="name === ''"
          class="w-full rounded-md mt-2 border border-coffee-bean-200 dark:border-coffee-bean-700 bg-soft-blush-50 dark:bg-coffee-bean-900/60 py-3 px-6 text-base font-medium text-coffee-bean-600 dark:text-soft-blush-200 outline-none focus:border-regal-navy-700 dark:focus:border-regal-navy-400 focus:shadow-md"
          name="name"
          placeholder="Prénom Nom"
          type="text"
          :aria-invalid="Boolean(errors.name)"
          :aria-describedby="errors.name ? 'name-error' : undefined"
        />
        <span v-if="errors.name" id="name-error" role="alert" class="text-spicy-paprika-700 dark:text-spicy-paprika-300">{{ errors.name }}</span>
      </div>
      <div class="mb-3">
        <label
          class="mb-1 block text-base font-medium text-regal-navy-700 dark:text-regal-navy-300 font-semibold"
          for="email"
        >
          Adresse Mail
        </label>
        <input
          id="email"
          v-model="email"
          :required="email === ''"
          class="w-full rounded-md mt-2 border border-coffee-bean-200 dark:border-coffee-bean-700 bg-soft-blush-50 dark:bg-coffee-bean-900/60 py-3 px-6 text-base font-medium text-coffee-bean-600 dark:text-soft-blush-200 outline-none focus:border-regal-navy-700 dark:focus:border-regal-navy-400 focus:shadow-md"
          name="email"
          placeholder="example@domain.com"
          type="email"
          :aria-invalid="Boolean(errors.email)"
          :aria-describedby="errors.email ? 'email-error' : undefined"
        />
        <span v-if="errors.email" id="email-error" role="alert" class="text-spicy-paprika-700 dark:text-spicy-paprika-300">{{ errors.email }}</span>
      </div>
      <div class="mb-3">
        <label
          class="mb-1 block text-base font-medium text-regal-navy-700 dark:text-regal-navy-300 font-semibold"
          for="subject"
        >
          Sujet
        </label>
        <input
          id="subject"
          v-model="subject"
          :required="subject === ''"
          class="w-full rounded-md mt-2 border border-coffee-bean-200 dark:border-coffee-bean-700 bg-soft-blush-50 dark:bg-coffee-bean-900/60 py-3 px-6 text-base font-medium text-coffee-bean-600 dark:text-soft-blush-200 outline-none focus:border-regal-navy-700 dark:focus:border-regal-navy-400 focus:shadow-md"
          name="subject"
          placeholder="Entrer votre sujet"
          type="text"
          :aria-invalid="Boolean(errors.subject)"
          :aria-describedby="errors.subject ? 'subject-error' : undefined"
        />
        <span v-if="errors.subject" id="subject-error" role="alert" class="text-spicy-paprika-700 dark:text-spicy-paprika-300">{{ errors.subject }}</span>
      </div>
      <div class="mb-3">
        <label
          class="mb-1 block text-base font-medium text-regal-navy-700 dark:text-regal-navy-300 font-semibold"
          for="message"
        >
          Message
        </label>
        <textarea
          id="message"
          v-model="message"
          :required="message === ''"
          class="w-full resize-none rounded-md mt-2 border border-coffee-bean-200 dark:border-coffee-bean-700 bg-soft-blush-50 dark:bg-coffee-bean-900/60 py-3 px-6 text-base font-medium text-coffee-bean-600 dark:text-soft-blush-200 outline-none focus:border-regal-navy-700 dark:focus:border-regal-navy-400 focus:shadow-md"
          name="message"
          placeholder="Entrer votre message"
          rows="4"
          :aria-invalid="Boolean(errors.message)"
          :aria-describedby="errors.message ? 'message-error' : undefined"
        ></textarea>
        <span v-if="errors.message" id="message-error" role="alert" class="text-spicy-paprika-700 dark:text-spicy-paprika-300">{{ errors.message }}</span>
      </div>
      <!-- Widget Turnstile et Sceau Homard -->
      <div class="mb-4 flex flex-col items-center justify-center min-h-[50px]">
        <div ref="turnstileContainer" v-show="!turnstileToken"></div>
      </div>

      <div class="flex justify-center">
        <button
          class="hover:shadow-form rounded-none bg-spicy-paprika-500 hover:bg-spicy-paprika-600 transition-colors duration-300 py-3 px-8 text-base font-semibold text-soft-blush-50 outline-none font-code disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          :disabled="!turnstileToken || isSubmitting"
          :aria-busy="isSubmitting"
        >
          {{ isSubmitting ? 'Envoi en cours…' : 'Envoyer' }}
        </button>
      </div>
    </form>
    <div
      v-else
      class="flex flex-col items-center justify-center p-8 bg-spicy-paprika-50 dark:bg-spicy-paprika-950/20 rounded-xl border border-spicy-paprika-100 dark:border-spicy-paprika-900/30"
    >
      <div class="text-4xl mb-3 select-none">🦞</div>
      <p class="text-center text-spicy-paprika-600 dark:text-spicy-paprika-400 text-xl font-bold">
        Votre message a été envoyé avec succès !
      </p>
      <p class="text-center text-xs text-gray-500 dark:text-soft-blush-300 mt-2 font-medium">
        Le Homard Mascotte a validé l'envoi de votre message.
      </p>
    </div>
    <p v-if="errorMessage" role="alert" class="text-center text-red-700 dark:text-red-300 mt-2">{{ errorMessage }}</p>
  </section>
</template>
