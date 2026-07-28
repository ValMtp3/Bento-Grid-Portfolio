<script setup>
import { onMounted, ref, watch } from 'vue';
import emailjs from '@emailjs/browser';
import Cookies from 'js-cookie';
import { renderTurnstile } from '@/turnstile';
import SectionHeading from './SectionHeading.vue';

const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const apikey = import.meta.env.VITE_EMAILJS_API;

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

// Champs du formulaire indexes par nom : sert a la fois a la validation, a la
// persistance en cookie et au payload EmailJS, pour n'avoir qu'une seule liste.
const isFilled = (value) => Boolean(value);
const fields = {
  name: { model: name, error: 'Le nom est requis.', isValid: isFilled },
  email: {
    model: email,
    error: 'Un email valide est requis.',
    isValid: (value) => Boolean(value) && /\S[^\s@]*@\S+\.\S+/.test(value),
  },
  subject: { model: subject, error: 'Le sujet est requis.', isValid: isFilled },
  message: { model: message, error: 'Le message est requis.', isValid: isFilled },
};
const cookieKey = (field) => `form_${field}`;

const validateForm = () => {
  errors.value = {};
  for (const [field, { model, error, isValid }] of Object.entries(fields)) {
    if (!isValid(model.value)) errors.value[field] = error;
  }
  return Object.keys(errors.value).length === 0;
};

const clearFormCookies = () => {
  Object.keys(fields).forEach((field) => Cookies.remove(cookieKey(field)));
};

onMounted(() => {
  for (const [field, { model }] of Object.entries(fields)) {
    model.value = Cookies.get(cookieKey(field)) || '';
    watch(model, (value) => {
      Cookies.set(cookieKey(field), value, {
        expires: 1 / 12,
        sameSite: 'Strict',
        secure: location.protocol === 'https:',
      });
    });
  }
  void renderTurnstile(turnstileContainer, turnstileToken);
});

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

  const variables = Object.fromEntries(
    Object.entries(fields).map(([field, { model }]) => [field, model.value.trim()]),
  );

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
</script>

<template>
  <section class="bento-cell p-6">
    <SectionHeading index="06" label="Contact" title="Me contacter" />
    <form v-if="!formSubmitted" ref="form" @submit.prevent="onSubmit">
      <div class="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2">
        <div>
          <label class="form-label" for="name">Prénom Nom</label>
          <input
            id="name"
            v-model="name"
            :required="name === ''"
            class="form-field"
            name="name"
            placeholder="Prénom Nom"
            type="text"
            :aria-invalid="Boolean(errors.name)"
            :aria-describedby="errors.name ? 'name-error' : undefined"
          />
          <span v-if="errors.name" id="name-error" role="alert" class="form-error">{{
            errors.name
          }}</span>
        </div>
        <div>
          <label class="form-label" for="email">Adresse mail</label>
          <input
            id="email"
            v-model="email"
            :required="email === ''"
            class="form-field"
            name="email"
            placeholder="example@domain.com"
            type="email"
            :aria-invalid="Boolean(errors.email)"
            :aria-describedby="errors.email ? 'email-error' : undefined"
          />
          <span v-if="errors.email" id="email-error" role="alert" class="form-error">{{
            errors.email
          }}</span>
        </div>
        <div class="md:col-span-2">
          <label class="form-label" for="subject">Sujet</label>
          <input
            id="subject"
            v-model="subject"
            :required="subject === ''"
            class="form-field"
            name="subject"
            placeholder="Entrer votre sujet"
            type="text"
            :aria-invalid="Boolean(errors.subject)"
            :aria-describedby="errors.subject ? 'subject-error' : undefined"
          />
          <span v-if="errors.subject" id="subject-error" role="alert" class="form-error">{{
            errors.subject
          }}</span>
        </div>
        <div class="md:col-span-2">
          <label class="form-label" for="message">Message</label>
          <textarea
            id="message"
            v-model="message"
            :required="message === ''"
            class="form-field resize-none"
            name="message"
            placeholder="Entrer votre message"
            rows="5"
            :aria-invalid="Boolean(errors.message)"
            :aria-describedby="errors.message ? 'message-error' : undefined"
          ></textarea>
          <span v-if="errors.message" id="message-error" role="alert" class="form-error">{{
            errors.message
          }}</span>
        </div>
      </div>

      <!-- Widget Turnstile et Sceau Homard -->
      <div
        class="mt-5 flex flex-col items-start gap-4 border-t border-coffee-bean-200/60 pt-5 dark:border-soft-blush-50/10 sm:flex-row sm:items-center sm:justify-between"
      >
        <div ref="turnstileContainer" v-show="!turnstileToken" class="min-h-[50px]"></div>
        <button
          class="w-full rounded-none bg-spicy-paprika-500 px-8 py-3 font-code text-base font-semibold text-soft-blush-50 outline-none transition-colors duration-300 hover:bg-spicy-paprika-600 disabled:cursor-not-allowed disabled:opacity-50 sm:ml-auto sm:w-auto"
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
