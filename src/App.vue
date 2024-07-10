<script setup >
import {RouterView} from 'vue-router'
import Navbar from './components/include/Navbar.vue'
import Footer from './components/include/Footer.vue'
import HomeView from "@/views/HomeView.vue";
</script >

<template >
  <div class="bg-custom-gradient" >
    <Navbar />
    <router-view />
      <div class="bg-white font-[AnonymousPro] " >
        <Footer />
      </div >
    </div >
</template >