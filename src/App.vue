<script setup>
import { RouterView } from 'vue-router'
import Navbar from './components/include/Navbar.vue'
import Footer from './components/include/Footer.vue'
import CookieBanner from './components/include/CookieBanner.vue';
</script>

<template>
  <div class="bg-custom-gradient">
    <Navbar />
    <router-view />
    <div class="bg-white font-[AnonymousPro] ">
      <CookieBanner />
      <Footer />
    </div>
  </div>
</template>