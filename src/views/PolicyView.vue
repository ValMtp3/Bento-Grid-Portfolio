<script setup>
// Les balises meta de la page sont appliquees par App.vue depuis router/index.js.
import DocSection from '@/components/include/DocSection.vue';
import EmailProtection from '@/components/include/EmailProtection.vue';
</script>

<template>
  <div class="text-gray-800 dark:text-soft-blush-200">
    <div class="container mx-auto p-6">
      <h1 class="text-3xl font-bold mb-6 text-center dark:text-soft-blush-50">
        Politique de Confidentialité
      </h1>

      <DocSection title="1. Introduction">
        <p>
          Bienvenue sur mon site portfolio. Cette politique de confidentialité a pour objectif de
          vous informer sur la manière dont vos données personnelles sont collectées, utilisées, et
          protégées lors de votre visite. Je m'engage à respecter votre vie privée et à protéger les
          informations personnelles que vous partagez.
        </p>
      </DocSection>

      <DocSection title="2. Données Collectées">
        <p>
          Lorsque vous utilisez le formulaire de contact, je collecte les informations suivantes :
        </p>
        <ul class="list-disc pl-5">
          <li>Prénom et Nom</li>
          <li>Adresse email</li>
          <li>Sujet de votre message</li>
          <li>Contenu de votre message</li>
        </ul>
        <p>
          Ces données sont essentielles pour vous identifier et répondre à vos demandes. De plus,
          mon site utilise des cookies pour améliorer votre expérience de navigation.
        </p>
      </DocSection>

      <DocSection title="3. Finalité des Données">
        <p>Les données collectées via le formulaire de contact sont uniquement utilisées pour :</p>
        <ul class="list-disc pl-5">
          <li>Répondre à vos demandes de contact.</li>
          <li>Vous identifier lors de nos échanges.</li>
        </ul>
        <p>
          Les cookies peuvent être utilisés pour des statistiques anonymes afin d'améliorer la
          qualité du site.
        </p>
      </DocSection>

      <DocSection title="4. Destinataires des Données">
        <p>
          Vos données personnelles sont envoyées directement à ma boîte mail personnelle. Leur
          acheminement transite par <strong>EmailJS</strong>, prestataire technique d'envoi
          d'e-mails, et le formulaire est protégé des envois automatisés par
          <strong>Cloudflare Turnstile</strong>. En dehors de ces prestataires techniques,
          nécessaires au fonctionnement du formulaire, vos données ne sont partagées avec aucun
          tiers : ni revente, ni usage publicitaire.
        </p>
      </DocSection>

      <DocSection title="5. Durée de Conservation des Données">
        <p>
          Les données collectées via le formulaire de contact, notamment votre prénom, nom, adresse
          email, sujet et message, sont susceptibles d'être stockées dans ma boîte mail pour une
          durée indéfinie. Cette conservation indéterminée est justifiée par la nécessité de
          conserver une trace des échanges afin de faciliter le suivi des conversations et répondre
          aux demandes futures. Vous avez toutefois le droit de demander la suppression de vos
          données à tout moment en me contactant à l'adresse suivante :
          <EmailProtection
            user="sobre.05.statue"
            domain="icloud.com"
            class="text-blue-600 dark:text-regal-navy-300"
          />.
        </p>
      </DocSection>

      <DocSection title="6. Sécurité des Données">
        <p>
          Je mets en œuvre des mesures de sécurité standard pour protéger vos données personnelles.
          Cependant, étant donné qu'elles sont stockées sur ma boîte mail, elles sont soumises aux
          sécurités offertes par les services de messagerie utilisés.
        </p>
      </DocSection>

      <DocSection title="7. Cookies et Traceurs">
        <p>
          Mon site utilise des cookies pour améliorer votre expérience utilisateur et pour collecter
          des statistiques anonymes via des outils comme
          <strong>Cloudflare Browser Insights</strong> et <strong>Matomo</strong>. Ces cookies
          permettent de surveiller les performances du site, de détecter d'éventuels problèmes
          techniques, et d'assurer une qualité de service optimale.
        </p>
        <p>
          <strong>Matomo</strong> est une solution d'analyse web respectueuse de la vie privée que
          j'utilise pour collecter des statistiques anonymes sur l'utilisation du site.
          Contrairement à d'autres outils d'analyse, Matomo est hébergé sur mes propres serveurs, ce
          qui signifie que vos données restent sous mon contrôle et ne sont pas partagées avec des
          tiers. Les données collectées par Matomo incluent des informations telles que les pages
          visitées, la durée des visites, les appareils utilisés, et les pays d'origine. Toutes ces
          données sont anonymisées et ne permettent pas de vous identifier personnellement.
        </p>
        <p>
          Les données collectées par Cloudflare Browser Insights incluent des informations telles
          que les temps de chargement des pages, les performances des ressources, et d'autres
          mesures techniques relatives à votre navigation sur le site. Ces données sont utilisées
          exclusivement à des fins statistiques et d'amélioration du service.
        </p>
        <p>
          Une bannière d'acceptation vous permet de gérer vos préférences en matière de cookies.
          Vous pouvez également configurer votre navigateur pour bloquer ou supprimer les cookies à
          tout moment.
        </p>
      </DocSection>

      <DocSection title="8. Droits des Utilisateurs">
        <p>Vous disposez des droits suivants concernant vos données personnelles :</p>
        <ul class="list-disc pl-5">
          <li>Droit d'accès</li>
          <li>Droit de rectification</li>
          <li>Droit d'effacement</li>
          <li>Droit d'opposition</li>
        </ul>
        <p>
          Pour exercer ces droits, vous pouvez me contacter par email à l'adresse suivante :
          <EmailProtection
            user="sobre.05.statue"
            domain="icloud.com"
            class="text-blue-600 dark:text-regal-navy-300"
          />.
        </p>
      </DocSection>

      <DocSection title="9. Modification de la Politique de Confidentialité">
        <p>
          Je me réserve le droit de modifier cette politique de confidentialité à tout moment. Toute
          modification sera publiée sur cette page sans notification individuelle.
        </p>
      </DocSection>

      <DocSection title="10. Loi Applicable">
        <p>
          Cette politique de confidentialité est régie par le Règlement Général sur la Protection
          des Données (RGPD) de l'Union Européenne.
        </p>
      </DocSection>
    </div>
  </div>
</template>
