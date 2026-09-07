<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { Icon } from '@iconify/vue';
import { formatRelative, loadPulse } from '@/data/pulse';

const MONTPELLIER = { latitude: 43.6109, longitude: 3.8763 };

// Codes WMO renvoyes par Open-Meteo, regroupes par famille : la nuance entre
// "bruine legere" et "bruine moderee" n'apporte rien dans une cellule.
const WEATHER = [
  { max: 0, label: 'ciel degage', icon: 'mdi:weather-sunny' },
  { max: 2, label: 'peu nuageux', icon: 'mdi:weather-partly-cloudy' },
  { max: 3, label: 'couvert', icon: 'mdi:weather-cloudy' },
  { max: 48, label: 'brouillard', icon: 'mdi:weather-fog' },
  { max: 57, label: 'bruine', icon: 'mdi:weather-partly-rainy' },
  { max: 67, label: 'pluie', icon: 'mdi:weather-rainy' },
  { max: 77, label: 'neige', icon: 'mdi:weather-snowy' },
  { max: 82, label: 'averses', icon: 'mdi:weather-pouring' },
  { max: 86, label: 'averses de neige', icon: 'mdi:weather-snowy-heavy' },
  { max: 99, label: 'orage', icon: 'mdi:weather-lightning' },
];

const weatherFor = (code) =>
  WEATHER.find((entry) => code <= entry.max) ?? { label: 'temps calme', icon: 'mdi:weather-cloudy' };

const timeFormatter = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Paris',
});

const now = ref(timeFormatter.format(new Date()));
const weather = ref(null);
const pulse = ref(null);
let clock;

const github = computed(() => pulse.value?.github ?? null);
const lastCommit = computed(() => github.value?.lastCommit ?? null);
const commitAge = computed(() => formatRelative(lastCommit.value?.date));
const languages = computed(() => github.value?.week?.languages ?? []);

// Exception assumee a la palette de marque : ce sont les couleurs officielles
// de GitHub Linguist, celles que tout developpeur associe deja a ces langages.
// La direction artistique autorise une sortie de palette quand elle est
// justifiee par la semantique, et c'est exactement le cas ici.
const LANGUAGE_COLORS = {
  Python: '#3572a5',
  Go: '#00add8',
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Vue: '#41b883',
  CSS: '#663399',
  HTML: '#e34c26',
  SQL: '#e38c00',
  Shell: '#89e051',
  Rust: '#dea584',
  Java: '#b07219',
  PHP: '#4f5d95',
  Ruby: '#701516',
  Config: '#6e7781',
  Docs: '#083fa1',
};

const colorFor = (name) => LANGUAGE_COLORS[name] ?? '#8b949e';

const fetchWeather = async () => {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${MONTPELLIER.latitude}` +
      `&longitude=${MONTPELLIER.longitude}&current=temperature_2m,weather_code&timezone=Europe%2FParis`;
    const response = await fetch(url);
    if (!response.ok) return;
    const { current } = await response.json();
    weather.value = {
      temperature: Math.round(current.temperature_2m),
      ...weatherFor(current.weather_code),
    };
  } catch {
    weather.value = null; // La cellule reste lisible sans la meteo.
  }
};

onMounted(() => {
  // L'heure affichee ne descend pas sous la minute : inutile de reveiller le
  // navigateur chaque seconde.
  clock = setInterval(() => {
    now.value = timeFormatter.format(new Date());
  }, 30_000);

  fetchWeather();
  loadPulse().then((data) => {
    pulse.value = data;
  });
});

onBeforeUnmount(() => clearInterval(clock));
</script>

<template>
  <!-- Live pulse cell -->
  <div class="md:col-span-2 bento-cell p-5 sm:p-6 flex flex-col gap-4">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p
          class="mb-1 font-code text-[10px] font-semibold uppercase tracking-[0.18em] text-regal-navy-600 dark:text-regal-navy-400"
        >
          $ en direct
        </p>
        <h3
          class="font-heading font-bold text-base sm:text-lg text-coffee-bean-950 dark:text-soft-blush-50"
        >
          Montpellier, {{ now }}
        </h3>
      </div>

      <div v-if="weather" class="flex shrink-0 items-center gap-2 text-right">
        <Icon
          :icon="weather.icon"
          class="h-6 w-6 text-regal-navy-600 dark:text-regal-navy-300"
          aria-hidden="true"
        />
        <div>
          <p class="font-heading font-bold text-lg leading-none text-coffee-bean-950 dark:text-soft-blush-50">
            {{ weather.temperature }}&nbsp;°C
          </p>
          <p class="font-code text-[10px] text-coffee-bean-600 dark:text-soft-blush-300">
            {{ weather.label }}
          </p>
        </div>
      </div>
    </div>

    <div
      class="border-t border-coffee-bean-200/60 pt-4 dark:border-soft-blush-50/10"
    >
      <p
        class="mb-2 font-code text-[10px] uppercase tracking-[0.14em] text-regal-navy-600 dark:text-regal-navy-400"
      >
        ~ dernier commit
      </p>

      <a
        v-if="lastCommit"
        :href="lastCommit.url"
        target="_blank"
        rel="noopener noreferrer"
        class="group block"
      >
        <p
          class="font-code text-xs leading-relaxed text-coffee-bean-800 group-hover:text-spicy-paprika-700 dark:text-soft-blush-200 dark:group-hover:text-spicy-paprika-300 transition-colors"
        >
          {{ lastCommit.message }}
        </p>
        <p class="mt-1 font-code text-[10px] text-coffee-bean-600 dark:text-soft-blush-400">
          {{ lastCommit.repo.split('/')[1] }} · {{ commitAge }}
        </p>
      </a>

      <!-- Une semaine sans push public doit dire quelque chose, pas afficher un
           commit poussiereux. -->
      <p
        v-else-if="pulse"
        class="font-code text-xs text-coffee-bean-600 dark:text-soft-blush-300"
      >
        Rien de public cette semaine — la tête dans du code privé.
      </p>
      <p v-else class="font-code text-xs text-coffee-bean-500 dark:text-soft-blush-400">
        Chargement…
      </p>
    </div>

    <div v-if="languages.length" class="mt-auto">
      <div class="flex h-1.5 w-full overflow-hidden rounded-full">
        <span
          v-for="language in languages"
          :key="language.name"
          :style="{ width: `${language.share}%`, backgroundColor: colorFor(language.name) }"
          class="h-full"
        />
      </div>
      <div class="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        <span
          v-for="language in languages"
          :key="language.name"
          class="flex items-center gap-1.5 font-code text-[10px] text-coffee-bean-700 dark:text-soft-blush-300"
        >
          <!-- L'anneau evite que le jaune de JavaScript disparaisse sur la
               carte claire. -->
          <span
            :style="{ backgroundColor: colorFor(language.name) }"
            class="h-2 w-2 rounded-full ring-1 ring-coffee-bean-950/15 dark:ring-soft-blush-50/25"
            aria-hidden="true"
          />
          {{ language.name }} {{ language.share }} %
        </span>
      </div>
    </div>
  </div>
</template>
