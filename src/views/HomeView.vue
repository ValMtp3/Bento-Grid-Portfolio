<script setup >
import {ref} from 'vue';
import PresentationComponent from "@/components/PresentationComponent.vue";
import ContactComponent from "@/components/ContactComponent.vue";
import FormationComponent from "@/components/FormationComponent.vue";
import MaitriseComponent from "@/components/MaitriseComponent.vue";
import ProjetsComponent from "@/components/ProjetsComponent.vue";
import ClientsComponent from "@/components/ClientsComponent.vue";
import {projets} from '@/data/projets.js';

const languages = [
  {alt: "Logo HTML5", image: "/assets/HTML-removebg.webp", title: "HTML"},
  {alt: "Logo Tailwind", image: "/assets/Tailwind-removebg.webp", title: "Tailwind CSS"},
  {alt: "Logo Symfony", image: "/assets/Symfony.webp", title: "PHP Symfony"},
  {alt: "Logo Python", image: "/assets/Python-removebg.webp", title: "Python"},
  {alt: "Logo VueJS", image: "/assets/VueJS.webp", title: "VueJS"},
  {alt: "Logo MySQL", image: "/assets/MySQL-removebg.webp", title: "MySQL"},
  {alt: "Logo Solidity", image: "/assets/Solidity.webp", title: "Solidity"},
];


const clients = [
  {
    alt: "Logo Sport&Green",
    image: "/assets/sportandgreen.webp",
    name: "Sport&Green",
    role: "Développeur web / Consultant SEO",
  },
  {
    alt: "Logo from scratch",
    image: "/assets/from_scratch.webp",
    name: "From_Scratch",
    role: "Développeur web",
  }
]

const projetsAffiches = ref(2);

function toggleProjetsAffichage() {
  projetsAffiches.value = projetsAffiches.value === 2 ? projets.length : 2;
}
</script >

<template>
  <div class="pt-4 px-4 pb-2">
    <div class="flex flex-col xl:flex-row xl:justify-around xl:space-x-4 space-y-4 md:mb-4 xl:mb-0">
      <PresentationComponent class="min-h-full" />
      <ContactComponent class="min-h-full" />
    </div>
  </div>
  <div class="px-4 py-2" >
    <FormationComponent />
  </div >
  <div class="px-4 py-2" >
    <div class="flex flex-col xl:flex-row xl:justify-around space-y-4 xl:space-x-4" >
      <div class="bg-white font-[AnonymousPro] p-1 rounded-3xl w-full max-w-none" >
        <span class="text-base sm:text-xl underline my-2 flex justify-center text-center" >Maitrise</span >
        <div class="grid grid-cols-4 gap-12 m-2 justify-items-center items-center h-full" >
          <MaitriseComponent v-for="lang in languages" :key="lang.name" v-bind="lang" />
          <span > À venir ...</span >
        </div >
      </div >
      <div class="bg-white font-[AnonymousPro] p-1 rounded-3xl w-full max-w-none" >
        <span class="text-base sm:text-xl underline my-2 flex justify-center text-center" >Projets</span >
        <div class="grid grid-cols-2 mr-12 m-2 justify-items-center items-center h-full" >
          <ProjetsComponent v-for="pro in projets.slice(0, projetsAffiches)" :key="pro.name" v-bind="pro" />
          <button class="text-3xl font-bold m-20 col-span-2 cursor-pointer  " @click="toggleProjetsAffichage" >
            {{ projetsAffiches < projets.length ? 'Voir +' : 'Voir -' }}
          </button >
        </div >
      </div >
    </div >
  </div >
  <div class="px-4 pt-2 pb-4" >
    <div class="bg-white font-[AnonymousPro] p-1 rounded-3xl w-full max-w-none" >
      <span
          class="text-base sm:text-xl underline my-2 flex justify-center text-center" >Entreprise avec lesquels j’ai travaillé</span >
      <div class="flex justify-around" >
        <ClientsComponent v-for="cl in clients" :key="cl.name" v-bind="cl" />
      </div >
    </div >
  </div >
  <!--  <div class="px-4 py-2 " >-->
  <!--    <div class="bg-white font-[AnonymousPro] p-1 rounded-3xl w-full max-w-none" >-->
  <!--    <ContactFormsComponent />-->
  <!--    </div >-->
  <!--  </div>-->
</template >