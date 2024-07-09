<template>
  <div class="bg-[#FBFDFF]">
    <footer class="bg-[#FBFDFF] font-[AnonymousPro]">
      <div class="container mx-auto p-10">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <div class="col-span-1">
            <h1 class="text-3xl text-neutral-900 font-bold">Liens utiles</h1>
            <ul class="mt-5 grid grid-cols-2 gap-4">
              <li class="text-lg text-neutral-900 font-light">
                <router-link to="/" class="hover:underline">Acceuil</router-link>
              </li>
              <li class="text-lg text-neutral-900 font-light">
                <router-link to="/stack" class="hover:underline">Stack</router-link>
              </li>
              <li class="text-lg text-neutral-900 font-light">
                <router-link to="/projets" class="hover:underline">Projets</router-link>
              </li>
              <li class="text-lg text-neutral-900 font-light">
                <router-link to="/legal" class="hover:underline">Mention légales</router-link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  </div>
  <p class="text-md text-center text-neutral-900 font-light text-2xl m-3">
    Développé en VueJS par Valentin Fiess ❤️
  </p>
</template>
<script lang="ts" setup>
</script>