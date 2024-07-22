<script setup>
import {onMounted, ref, watch} from 'vue';
import emailjs from '@emailjs/browser';
import Cookies from 'js-cookie';

const formSubmitted = ref(false);

const name = ref('');
const email = ref('');
const subject = ref('');
const message = ref('');
const errors = ref({});

const validateForm = () => {
  errors.value = {};
  if (!name.value) errors.value.name = "Le nom est requis.";
  if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) errors.value.email = "Un email valide est requis.";
  if (!subject.value) errors.value.subject = "Le sujet est requis.";
  if (!message.value) errors.value.message = "Le message est requis.";
  return Object.keys(errors.value).length === 0;
};

const saveToCookie = (key, value) => {
  Cookies.set(key, value);
};

const loadFromCookie = (key, defaultValue) => {
  return Cookies.get(key) || defaultValue;
};

const setupFormPersistence = () => {
  watch(name, (newValue) => {
    console.log('Saving name to cookie:', newValue);
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
  console.log('Loaded data from cookies');
  setupFormPersistence();
});

const onSubmit = (r) => {
  const turnstileResponse = Turnstile.getResponse();
  if (!turnstileResponse) {
    alert("Veuillez compléter le CAPTCHA.");
    return;
  }
  if (!validateForm()) {
    alert("Veuillez corriger les erreurs dans le formulaire.");
    return;
  }
  formSubmitted.value = true;
  alert("message envoyé! 😉");
  const templateId = "template_i9i9f3i";
  const serviceId = "service_spn1x8e";
  sendFeedback(serviceId, templateId, {
    name: sanitizeInput(name.value),
    email: sanitizeInput(email.value),
    subject: sanitizeInput(subject.value),
    message: sanitizeInput(message.value),
    'g-recaptcha-response': turnstileResponse
  });
};

const sendFeedback = (serviceId, templateId, variables) => {
  emailjs
      .send(serviceId, templateId, variables, "9bBLpgzvqPBPEovHR")
      .then((res) => {
        console.log('Email successfully sent!');
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

<template >
  <form v-if="!formSubmitted" ref="form" @submit.prevent="onSubmit" >
    <div class=" mb-5 p-2" >
      <label class="mb-3 block text-base font-medium text-black" for="name" >
        Prénom Nom
      </label >
      <input id="name" v-model="name" :required="name === ''"
             class="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-blue-900 focus:shadow-md"
             name="name" placeholder="Prénom Nom" type="text" />
      <span v-if="errors.name" class="text-red-500" >{{ errors.name }}</span >
    </div >
    <div class="mb-5" >
      <label class="mb-3 block text-base font-medium text-black" for="email" >
        Adresse Mail
      </label >
      <input id="email" v-model="email" :required="email === ''"
             class="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-blue-900 focus:shadow-md"
             name="email" placeholder="example@domain.com" type="email" />
      <span v-if="errors.email" class="text-red-500" >{{ errors.email }}</span >
    </div >
    <div class="mb-5" >
      <label class="mb-3 block text-base font-medium text-black" for="subject" >
        Sujet
      </label >
      <input id="subject" v-model="subject" :required="subject === ''"
             class="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-blue-900 focus:shadow-md"
             name="subject" placeholder="Entrer votre sujet" type="text" />
      <span v-if="errors.subject" class="text-red-500" >{{ errors.subject }}</span >
    </div >
    <div class="mb-5" >
      <label class="mb-3 block text-base font-medium text-black" for="message" >
        Message
      </label >
      <textarea id="message" v-model="message" :required="message === ''"
                class="w-full resize-none rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-blue-900 focus:shadow-md"
                name="message" placeholder="Entrer votre message" rows="4" ></textarea >
      <span v-if="errors.message" class="text-red-500" >{{ errors.message }}</span >
    </div >
    <div class="cf-turnstile" data-sitekey="<0x4AAAAAAAfmHeP6Qh4H2xpN>" ></div >
    <div class="flex justify-center" >
      <button class="hover:shadow-form rounded-md bg-blue-400 py-3 px-8 text-base font-semibold text-white outline-none"
              type="submit" >
        Envoyer
      </button >
    </div >
  </form >
  <div v-else >
    <p >Votre message a été envoyé avec succès !</p >
  </div >
</template >