<script setup>
// Les balises meta de la page sont appliquees par App.vue depuis router/index.js.
import DocSection from '@/components/include/DocSection.vue';
</script>

<template>
  <div class="text-coffee-bean-800 dark:text-soft-blush-200">
    <div class="container mx-auto p-6">
      <h1 class="text-3xl font-bold font-heading mb-6 text-center dark:text-soft-blush-50">Mentions Légales</h1>

      <DocSection title="Identité du propriétaire du site" tone="blush">
        <p><strong>Nom :</strong> Valentin Fiess</p>
        <p><strong>Adresse :</strong> 34470 Pérols</p>
        <p>
          <strong>Email :</strong>
          <a href="mailto:sobre.05.statue@icloud.com" class="text-regal-navy-500"
            >sobre.05.statue@icloud.com</a
          >
        </p>
      </DocSection>

      <DocSection title="Responsable de la publication" tone="blush">
        <p><strong>Responsable :</strong> Valentin Fiess</p>
      </DocSection>

      <DocSection title="Hébergeur du site" tone="blush">
        <p><strong>Nom :</strong> PIVATEHEBERG via ANCELADE</p>
        <p><strong>Adresse :</strong> 128 rue de la Boétie, 75008 Paris</p>
        <p>
          <strong>Email :</strong>
          <a href="mailto:contact@ancelade.com" class="text-regal-navy-500">contact@ancelade.com</a>
        </p>
      </DocSection>

      <h2 class="text-3xl font-bold font-heading mb-6 text-center dark:text-soft-blush-50">
        Conditions Générales d'Utilisation (CGU)
      </h2>

      <DocSection title="Objet des CGU" tone="blush">
        <p>
          Le site a pour objectif de présenter le portfolio, le profil, les projets et les
          connaissances de Valentin Fiess, ainsi que de fournir un moyen de le contacter.
        </p>
      </DocSection>

      <DocSection title="Accès au site" tone="blush">
        <p>L'accès au site est libre.</p>
      </DocSection>

      <DocSection title="Propriété intellectuelle" tone="blush">
        <p>
          Toutes les images non libres de droit, les marques d'entreprises et les langages utilisés
          sur le site sont protégés par des droits d'auteur.
        </p>
      </DocSection>

      <DocSection title="Modifications des CGU" tone="blush">
        <p>
          Valentin Fiess se réserve le droit de modifier les CGU sans informer les utilisateurs
          individuellement.
        </p>
      </DocSection>

      <h2 class="text-3xl font-bold font-heading mb-6 text-center dark:text-soft-blush-50">Autres informations</h2>

      <DocSection title="Litiges et droit applicable" tone="blush">
        <p>
          En cas de litige, le droit applicable sera le droit français, et les tribunaux compétents
          seront ceux de la cour d'appel de Paris.
        </p>
      </DocSection>
    </div>
  </div>
</template>
