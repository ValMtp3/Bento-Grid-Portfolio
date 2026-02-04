<script setup>
import { useMeta } from 'vue-meta';
import EmailProtection from '../components/include/EmailProtection.vue';


// Meta tags pour la page Mentions Légales
useMeta({
  title: 'Mentions Légales | Valentin Fiess - Portfolio Développeur',
  meta: [
    {
      name: 'description',
      content:
        "Mentions légales du portfolio de Valentin Fiess. Informations juridiques, responsabilité, propriété intellectuelle et conditions d'utilisation du site.",
    },
    {
      name: 'keywords',
      content:
        'mentions légales, CGU, conditions générales, Valentin Fiess, droit français, propriété intellectuelle',
    },
    { property: 'og:title', content: 'Mentions Légales | Valentin Fiess - Portfolio Développeur' },
    {
      property: 'og:description',
      content:
        "Consultez les mentions légales et conditions générales d'utilisation du portfolio de Valentin Fiess.",
    },
    { property: 'og:url', content: 'https://www.valentin-fiess.fr/legal' },
    { property: 'og:type', content: 'website' },
    { name: 'robots', content: 'index, follow' },
    { name: 'language', content: 'fr-FR' },
  ],
});
</script>

<template>
  <div class="text-gray-800 dark:text-gray-200">
    <div class="container mx-auto p-6">
      <h1 class="text-3xl font-bold mb-6 text-center dark:text-white">Mentions Légales</h1>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-gray-200">
          Identité du propriétaire du site
        </h2>
        <div class="bg-white dark:bg-gray-800 p-4 shadow rounded-lg">
          <p><strong>Nom :</strong> Valentin Fiess</p>
          <p><strong>Adresse :</strong> 34470 Pérols</p>
          <p>
            <strong>Email :</strong>
            <EmailProtection
              user="sobre.05.statue"
              domain="icloud.com"
              class="text-blue-600 dark:text-blue-300"
            />
          </p>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-gray-200">
          Responsable de la publication
        </h2>
        <div class="bg-white dark:bg-gray-800 p-4 shadow rounded-lg">
          <p><strong>Responsable :</strong> Valentin Fiess</p>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-gray-200">Hébergeur du site</h2>
        <div class="bg-white dark:bg-gray-800 p-4 shadow rounded-lg">
          <p><strong>Nom :</strong> PIVATEHEBERG via ANCELADE</p>
          <p><strong>Adresse :</strong> 128 rue de la Boétie, 75008 Paris</p>
          <p>
            <strong>Email :</strong>
            <EmailProtection
              user="contact"
              domain="ancelade.com"
              class="text-blue-600 dark:text-blue-300"
            />
          </p>
        </div>
      </section>

      <h1 class="text-3xl font-bold mb-6 text-center dark:text-white">
        Conditions Générales d'Utilisation (CGU)
      </h1>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-gray-200">Objet des CGU</h2>
        <div class="bg-white dark:bg-gray-800 p-4 shadow rounded-lg">
          <p>
            Le site a pour objectif de présenter le portfolio, le profil, les projets et les
            connaissances de Valentin Fiess, ainsi que de fournir un moyen de le contacter.
          </p>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-gray-200">Accès au site</h2>
        <div class="bg-white dark:bg-gray-800 p-4 shadow rounded-lg">
          <p>L'accès au site est libre.</p>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-gray-200">Propriété intellectuelle</h2>
        <div class="bg-white dark:bg-gray-800 p-4 shadow rounded-lg">
          <p>
            Toutes les images non libres de droit, les marques d'entreprises et les langages
            utilisés sur le site sont protégés par des droits d'auteur.
          </p>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-gray-200">Modifications des CGU</h2>
        <div class="bg-white dark:bg-gray-800 p-4 shadow rounded-lg">
          <p>
            Valentin Fiess se réserve le droit de modifier les CGU sans informer les utilisateurs
            individuellement.
          </p>
        </div>
      </section>

      <h1 class="text-3xl font-bold mb-6 text-center dark:text-white">Autres informations</h1>

      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-2 dark:text-gray-200">Litiges et droit applicable</h2>
        <div class="bg-white dark:bg-gray-800 p-4 shadow rounded-lg">
          <p>
            En cas de litige, le droit applicable sera le droit français, et les tribunaux
            compétents seront ceux de la cour d'appel de Paris.
          </p>
        </div>
      </section>
    </div>
  </div>
</template>
