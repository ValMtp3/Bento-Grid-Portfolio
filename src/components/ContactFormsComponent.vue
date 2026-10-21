<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';
import emailjs from '@emailjs/browser';
import Cookies from 'js-cookie';
import { renderTurnstile } from '@/turnstile';
import { CONTACT_LIMITS, validateContact } from '@/contactForm';
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
const successMessage = ref(null);

// Champs du formulaire indexes par nom : sert a la fois a la persistance en
// cookie et au payload EmailJS. Les regles de validation vivent dans
// src/contactForm.js, testees a part.
const fields = { name, email, subject, message };
const cookieKey = (field) => `form_${field}`;

const readValues = () =>
  Object.fromEntries(Object.entries(fields).map(([field, model]) => [field, model.value.trim()]));

const validateForm = () => {
  errors.value = validateContact(readValues());
  return Object.keys(errors.value).length === 0;
};

const clearFormCookies = () => {
  Object.keys(fields).forEach((field) => Cookies.remove(cookieKey(field)));
};

onMounted(() => {
  for (const [field, model] of Object.entries(fields)) {
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
  // Le bouton est desactive sans jeton : ce garde ne sert que si on contourne
  // l'interface, l'explication au visiteur est portee par le texte d'aide.
  if (!turnstileToken.value) return;
  if (!validateForm()) {
    requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus());
    return;
  }
  errorMessage.value = '';
  isSubmitting.value = true;

  try {
    await emailjs.send(serviceId, templateId, readValues(), apikey);
    formSubmitted.value = true;
    clearFormCookies();
    // Le formulaire disparait : sans ce deplacement, le focus clavier serait
    // perdu et un lecteur d'ecran n'annoncerait pas le succes.
    await nextTick();
    successMessage.value?.focus();
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
    <form v-if="!formSubmitted" ref="form" novalidate @submit.prevent="onSubmit">
      <div class="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2">
        <div>
          <label class="form-label" for="name">Prénom Nom</label>
          <input
            id="name"
            v-model="name"
            required
            :maxlength="CONTACT_LIMITS.name"
            class="form-field"
            name="name"
            autocomplete="name"
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
            required
            :maxlength="CONTACT_LIMITS.email"
            class="form-field"
            name="email"
            autocomplete="email"
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
            required
            :maxlength="CONTACT_LIMITS.subject"
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
            required
            :maxlength="CONTACT_LIMITS.message"
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
          class="w-full rounded-none bg-spicy-paprika-700 px-8 py-3 font-code text-base font-semibold text-soft-blush-50 outline-none transition-colors duration-300 hover:bg-spicy-paprika-800 dark:bg-spicy-paprika-500 dark:text-coffee-bean-950 dark:hover:bg-spicy-paprika-400 disabled:cursor-not-allowed disabled:opacity-50 sm:ml-auto sm:w-auto"
          type="submit"
          :disabled="!turnstileToken || isSubmitting"
          :aria-busy="isSubmitting"
          aria-describedby="contact-turnstile-hint"
        >
          {{ isSubmitting ? 'Envoi en cours…' : 'Envoyer' }}
        </button>
        <p id="contact-turnstile-hint" class="sr-only" aria-live="polite">
          {{
            turnstileToken
              ? 'Vérification anti-robot réussie, le message peut être envoyé.'
              : 'Complétez la vérification anti-robot pour activer l’envoi.'
          }}
        </p>
      </div>
    </form>
    <div
      v-else
      ref="successMessage"
      role="status"
      tabindex="-1"
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
