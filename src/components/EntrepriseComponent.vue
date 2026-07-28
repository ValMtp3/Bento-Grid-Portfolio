<script setup>
import ResponsiveImage from './ResponsiveImage.vue';
import SectionHeading from './SectionHeading.vue';

const entreprise = [
  {
    alt: 'Logo SHAARP',
    image: '/assets/assets_index/SHAARP_logo.webp',
    name: 'Shaarp',
    role: 'Développeur Data/IA',
  },
  {
    alt: 'Logo Capgemini',
    image: '/assets/assets_index/capgemini.webp',
    name: 'Capgemini',
    role: 'Ambassadeur',
  },
  {
    alt: 'Logo R2D automation',
    image: '/assets/assets_index/R2D automation.webp',
    name: 'R2D Automation',
    role: 'Développeur IA/Client RAGUIA',
  },
  {
    alt: 'Logo Sport&Green',
    image: '/assets/assets_index/sportandgreen.webp',
    name: 'Sport&Green',
    role: 'Développeur web / Consultant SEO',
  },
  {
    alt: 'Logo from scratch',
    image: '/assets/assets_index/from_scratch.webp',
    name: 'From_Scratch',
    role: 'Développeur web',
  },
  {
    alt: 'Logo EPSI Montpellier',
    image: '/assets/assets_index/epsi.svg',
    name: 'EPSI Montpellier',
    role: 'Licence Développeur Data/IA',
  },
];

// Le bandeau est un marquee CSS et non un carrousel Swiper : avec 6 slides pour
// 4 visibles, le mode loop de Swiper ne calculait qu'un slide de boucle et le
// defilement se figeait au premier rebouclage. Une animation CSS defile sans
// rebouclage a calculer, et s'interrompt reellement au survol via
// animation-play-state. La piste contient deux copies de la liste : l'animation
// se translate de -50%, donc la seconde copie prend exactement la place de la
// premiere et la boucle est invisible. La copie est masquee aux lecteurs d'ecran.
const marqueeSlides = [...entreprise, ...entreprise];
</script>

<template>
  <!-- ═══ entreprise Section ═══ -->
  <section>
    <SectionHeading index="01" label="Réseau" title="Entreprises" />
    <div class="marquee slider-fade lg:[--slider-fade-edge:56px]">
      <ul class="marquee-track">
        <li
          v-for="(client, index) in marqueeSlides"
          :key="`${client.name}-${index}`"
          :aria-hidden="index >= entreprise.length ? 'true' : undefined"
          class="marquee-item"
        >
          <div
            class="brand-logo-card bento-cell p-3 flex flex-col items-center text-center h-full justify-between"
          >
            <div class="flex w-full flex-col items-center">
              <!-- Plaque uniforme : absorbe les fonds blancs ou colores deja incrustes
                   dans certains logos, pour que la rangee se lise comme un seul systeme. -->
              <div
                class="mb-2 flex h-14 w-full items-center justify-center rounded-md bg-white px-3 md:h-16"
              >
                <ResponsiveImage
                  :alt="client.alt"
                  :src="client.image"
                  :title="client.name"
                  class="brand-logo max-h-9 w-auto max-w-full object-contain md:max-h-11"
                  loading="lazy"
                  sizes="(max-width: 767px) 64px, 80px"
                />
              </div>
              <p
                class="font-heading font-bold text-sm text-coffee-bean-950 dark:text-soft-blush-50"
              >
                {{ client.name }}
              </p>
            </div>
            <span class="tag tag-paprika mt-1.5 py-0.5">
              {{ client.role }}
            </span>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.marquee {
  /* Vitesse du defilement : duree d'un passage complet des 6 entreprises.
     Augmenter la valeur ralentit le bandeau, la diminuer l'accelere. */
  --marquee-duration: 30s;
  overflow: hidden;
}

.marquee-track {
  display: flex;
  width: max-content;
  margin: 0;
  padding: 0;
  list-style: none;
  animation: marquee-scroll var(--marquee-duration) linear infinite;
}

/* Pas de gap sur la piste : l'ecart est porte par les items, sinon la
   translation de -50% laisse un demi-espacement de decalage a chaque cycle. */
.marquee-item {
  flex: 0 0 auto;
  width: 13rem;
  padding: 0.5rem 0;
  margin-right: 0.75rem;
}

@media (min-width: 1024px) {
  .marquee-item {
    width: 15rem;
    margin-right: 1rem;
  }
}

.marquee:hover .marquee-track,
.marquee:focus-within .marquee-track {
  animation-play-state: paused;
}

@keyframes marquee-scroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .marquee {
    overflow-x: auto;
  }
  .marquee-track {
    animation: none;
  }
}
</style>
