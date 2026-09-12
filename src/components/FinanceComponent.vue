<script setup>
import { computed, onMounted, ref } from 'vue';

import ShareBar from '@/components/ShareBar.vue';
import { formatHolding, loadFinance } from '@/data/finance';
import { formatRelative } from '@/data/pulse';

const finance = ref(null);
const loaded = ref(false);

const mix = computed(() => finance.value?.mix ?? []);
const regions = computed(() => finance.value?.regions ?? []);
const currencies = computed(() => finance.value?.currencies ?? []);
const structure = computed(() => finance.value?.structure ?? null);
const behaviour = computed(() => finance.value?.behaviour ?? null);

const refreshedAt = computed(() => formatRelative(finance.value?.generatedAt));
const hasCrypto = computed(() => mix.value.some((part) => part.label === 'Crypto'));

const percent = (share) => (Number.isFinite(share) ? `${share} %` : null);

// Chaque tuile porte un libelle qui se suffit a lui-meme : "lignes" ou
// "reseaux" seuls obligeaient le visiteur a deviner de quoi on parle.
// Une entree sans valeur est retiree plutot qu'affichee a zero : quand une
// source du collecteur tombe, la carte doit maigrir, pas mentir.
const tiles = computed(() => {
  if (!structure.value || !behaviour.value) return [];

  return [
    {
      key: 'positions',
      value: structure.value.positions,
      label: 'Actifs',
      hint: 'actions, ETF et cryptos différents',
    },
    {
      key: 'networks',
      value: structure.value.networks,
      label: 'Blockchains',
      hint: 'réseaux où je détiens des cryptos',
    },
    {
      key: 'countries',
      value: structure.value.countries,
      label: 'Pays',
      hint: "origine des sociétés en portefeuille",
    },
    {
      key: 'orders',
      value: behaviour.value.ordersLast30d,
      label: 'Ordres',
      hint: 'passés sur les 30 derniers jours',
    },
    {
      key: 'top3',
      value: percent(structure.value.topThreeShare),
      label: 'Concentration',
      hint: 'poids de mes 3 plus grosses lignes',
    },
    {
      key: 'working',
      value: percent(structure.value.workingShare),
      label: 'En rendement',
      hint: 'staking et dépôts qui génèrent des intérêts',
    },
    {
      key: 'holding',
      value: formatHolding(behaviour.value.avgHoldingDays),
      label: 'Détention',
      hint: 'durée moyenne de conservation',
    },
    {
      key: 'oldest',
      value: formatHolding(behaviour.value.oldestPositionMonths * 30),
      label: 'Ancienneté',
      hint: 'ma position la plus ancienne',
    },
  ].filter((tile) => tile.value !== null && tile.value !== undefined && tile.value !== 0);
});

// Phrase de rythme : la facon de passer ses ordres dit plus sur une maniere
// d'investir qu'un chiffre de plus dans la grille.
const rhythm = computed(() => {
  if (!behaviour.value) return null;

  const { ordersLast30d, buyRatio, favouriteDay } = behaviour.value;
  if (ordersLast30d === null || ordersLast30d === undefined) return null;
  if (ordersLast30d === 0) return 'Aucun ordre ce mois-ci — positions gardées telles quelles.';

  // "100 % à l'achat" se lit comme une approximation alors que c'est un fait
  // net : aucune vente sur la periode.
  const side =
    buyRatio === null
      ? 'Des mouvements ce mois-ci'
      : buyRatio === 100
        ? 'Que des achats ce mois-ci'
        : `${buyRatio} % de mes ordres à l'achat`;

  const day = favouriteDay ? `, plutôt le ${favouriteDay}` : '';

  return `${side}${day}.`;
});

onMounted(async () => {
  finance.value = await loadFinance();
  loaded.value = true;
});
</script>

<template>
  <!-- Grande tuile carree : elle occupe deux rangees face aux cartes larges de
       droite, ce qui casse l'alignement uniforme de la grille. C'est aussi le
       seul format ou ses huit chiffres tiennent sans etre a l'etroit. -->
  <div class="md:col-span-2 lg:row-span-2 bento-cell p-5 sm:p-6 flex flex-col gap-5">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h2 class="font-semibold text-coffee-bean-900 dark:text-soft-blush-50">Portefeuille</h2>
        <!-- Dire tout de suite ce que la carte ne montre pas evite la question
             que tout visiteur se pose devant des chiffres d'investissement. -->
        <p class="mt-0.5 text-xs text-coffee-bean-600 dark:text-soft-blush-300">
          Répartitions et rythme — jamais de montant
        </p>
      </div>
      <span v-if="refreshedAt" class="tag tag-navy shrink-0">{{ refreshedAt }}</span>
    </div>

    <template v-if="finance">
      <div class="flex flex-col gap-4">
        <ShareBar caption="Composition" :parts="mix" :delay="0" />
        <ShareBar v-if="regions.length" caption="Mes actions par zone" :parts="regions" :delay="120" />
        <ShareBar v-if="currencies.length" caption="Devises de cotation" :parts="currencies" :delay="240" />
      </div>

      <dl v-if="tiles.length" class="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div
          v-for="(tile, index) in tiles"
          :key="tile.key"
          class="stat-reveal rounded-lg border border-coffee-bean-100 bg-soft-blush-50/60 px-3 py-2.5 transition-colors duration-200 hover:border-regal-navy-300 dark:border-soft-blush-50/10 dark:bg-soft-blush-50/[0.04] dark:hover:border-regal-navy-600"
          :style="{ '--stat-delay': `${360 + index * 50}ms` }"
        >
          <!-- Le chiffre d'abord, gros : c'est ce qu'on vient lire. Puis ce
               qu'il mesure, puis comment le comprendre. -->
          <dd
            class="font-heading text-2xl font-bold leading-none tabular-nums text-regal-navy-700 dark:text-regal-navy-300"
          >
            {{ tile.value }}
          </dd>
          <dt class="mt-1.5">
            <span
              class="block text-xs font-semibold leading-tight text-coffee-bean-800 dark:text-soft-blush-100"
            >
              {{ tile.label }}
            </span>
            <span
              class="mt-0.5 block text-[11px] leading-snug text-pretty text-coffee-bean-500 dark:text-soft-blush-400"
            >
              {{ tile.hint }}
            </span>
          </dt>
        </div>
      </dl>

      <div class="mt-auto flex flex-col gap-1.5">
        <p
          v-if="rhythm"
          class="stat-reveal text-sm text-pretty text-coffee-bean-700 dark:text-soft-blush-300"
          :style="{ '--stat-delay': '760ms' }"
        >
          {{ rhythm }}
        </p>

        <!-- Attribution exigee par les conditions d'utilisation de CoinGecko
             des que ses cours servent a un affichage public. -->
        <p
          v-if="hasCrypto"
          class="font-code text-[10px] text-coffee-bean-500 dark:text-soft-blush-400"
        >
          Cours crypto : Powered by CoinGecko
        </p>
      </div>
    </template>

    <!-- Le collecteur ne publie rien tant qu'aucune source ne repond : mieux
         vaut le dire que laisser une carte a moitie vide sans explication. -->
    <p v-else-if="loaded" class="text-sm text-coffee-bean-600 dark:text-soft-blush-300">
      Statistiques indisponibles pour le moment.
    </p>
    <p v-else class="text-sm text-coffee-bean-500 dark:text-soft-blush-400">
      Chargement…
    </p>
  </div>
</template>
