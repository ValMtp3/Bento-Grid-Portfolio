<script setup >
import {RouterView} from 'vue-router'
import Footer from './components/include/Footer.vue'
</script >

<template >
  <div class="bg-custom-gradient" >
    <router-view />
    <div class="bg-white font-[AnonymousPro] " >
      <Footer />
    </div >
  </div >
</template >