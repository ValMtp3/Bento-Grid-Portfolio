<script setup>
import { ref, onMounted, watch } from 'vue';

const name = ref('');
const email = ref('');
const subject = ref('');
const message = ref('');

const saveToLocalStorage = (key, value) => {
  localStorage.setItem(key, value);
};

const loadFromLocalStorage = (key, defaultValue) => {
  return localStorage.getItem(key) || defaultValue;
};

const setupFormPersistence = () => {
  watch(name, (newValue) => {
    console.log('Saving name to localStorage:', newValue);
    saveToLocalStorage('form_name', newValue);
  });
  watch(email, (newValue) => saveToLocalStorage('form_email', newValue));
  watch(subject, (newValue) => saveToLocalStorage('form_subject', newValue));
  watch(message, (newValue) => saveToLocalStorage('form_message', newValue));
};

onMounted(() => {
  name.value = loadFromLocalStorage('form_name', '');
  email.value = loadFromLocalStorage('form_email', '');
  subject.value = loadFromLocalStorage('form_subject', '');
  message.value = loadFromLocalStorage('form_message', '');
  console.log('Loaded data from localStorage');
  setupFormPersistence();
});
</script>

<template>
  <form action="https://formbold.com/s/FORM_ID" method="POST">
    <div class="mb-5 p-2">
      <label class="mb-3 block text-base font-medium text-black" for="name">
        Prénom Nom
      </label>
      <input id="name"
             v-model="name"
             :required="name === ''"
             class="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-blue-900 focus:shadow-md"
             name="name" placeholder="Prénom Nom" type="text" />
    </div>
    <div class="mb-5">
      <label class="mb-3 block text-base font-medium text-black" for="email">
        Adresse Mail
      </label>
      <input id="email"
             v-model="email"
             :required="email === ''"
             class="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-blue-900 focus:shadow-md"
             name="email" placeholder="example@domain.com" type="email" />
    </div>
    <div class="mb-5">
      <label class="mb-3 block text-base font-medium text-black" for="subject">
        Sujet
      </label>
      <input id="subject"
             v-model="subject"
             :required="subject === ''"
             class="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-blue-900 focus:shadow-md"
             name="subject" placeholder="Entrer votre sujet" type="text" />
    </div>
    <div class="mb-5">
      <label class="mb-3 block text-base font-medium text-black" for="message">
        Message
      </label>
      <textarea id="message"
                v-model="message"
                :required="message === ''"
                class="w-full resize-none rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-blue-900 focus:shadow-md"
                name="message" placeholder="Entrer votre message" rows="4"></textarea>
    </div>
    <div class="flex justify-center">
      <button class="hover:shadow-form rounded-md bg-blue-400 py-3 px-8 text-base font-semibold text-white outline-none">
        Envoyer
      </button>
    </div>
  </form>
</template>