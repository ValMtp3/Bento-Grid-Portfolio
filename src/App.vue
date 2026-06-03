<script setup>
import { RouterView } from 'vue-router';
import Footer from './components/include/Footer.vue';
</script>

<template>
  <div class="bg-custom-gradient">
    <router-view />
    <div class="bg-soft-blush-50 font-body">
      <Footer />
    </div>
  </div>
</template>
