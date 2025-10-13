<template>
  <div
    class="bg-white dark:bg-dark-card font-[AnonymousPro] p-1 rounded-3xl w-full max-w-none transition-colors duration-300">
    <span
      class="flex justify-center my-2 text-base text-center underline sm:text-xl text-neutral-900 dark:text-dark-primary">Formation</span>
    <ol class="flex flex-col-reverse items-start m-3 md:items-start xl:flex-row">
      <li class="relative mb-6 sm:mb-0">
        <div class="flex items-center">
          <div
            class="z-10 flex items-center justify-center w-6 h-6 overflow-hidden bg-white rounded-full dark:bg-dark-secondary shrink-0 aspect-square">
            <svg aria-hidden="true" class="w-3 h-3 text-blue-800 dark:text-blue-300" fill="currentColor"
              viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
            </svg>
          </div>
          <span class="mx-2 text-sm text-gray-600 text-nowrap dark:text-dark-primary">2018-2020</span>
          <div class="hidden sm:flex w-full bg-gray-200 h-0.5 dark:bg-dark-secondary"></div>
        </div>
        <div class="mt-3 sm:pe-8">
          <h3 class="text-lg font-semibold leading-tight text-gray-900 dark:text-dark-primary text-pretty">
            Science et Technologie de l'Industrie et du Développement Durable
          </h3>
          <time class="block font-normal leading-none text-gray-700 text-md dark:text-dark-primary/80">Lycée Émile
            Peytavin, Mende
          </time>
          <p class="text-base font-normal text-gray-500 dark:text-dark-primary/60">
            Baccalauréat STI2D
          </p>
        </div>
      </li>
      <li class="relative mb-6 sm:mb-0">
        <div class="flex items-center">
          <div
            class="z-10 flex items-center justify-center w-6 h-6 overflow-hidden bg-white rounded-full dark:bg-dark-secondary shrink-0 aspect-square">
            <svg aria-hidden="true" class="w-3 h-3 text-blue-800 dark:text-blue-300" fill="currentColor"
              viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
            </svg>
          </div>
          <span class="mx-2 text-sm text-gray-600 text-nowrap dark:text-dark-primary">2020-2020</span>
          <div class="hidden sm:flex w-full bg-gray-200 h-0.5 dark:bg-dark-secondary"></div>
        </div>
        <div class="mt-3 sm:pe-8">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-dark-primary">
            Certification TOSA
          </h3>
          <time class="block font-normal leading-none text-gray-700 text-md dark:text-dark-primary/80">Gréta, Clermont
            l'Hérault
          </time>
          <p class="text-base font-normal text-gray-500 dark:text-dark-primary/60">
            Word - 688/1000 Excel - 815/1000 PowerPoint - 715/1000
          </p>
        </div>
      </li>
      <li class="relative mb-6 sm:mb-0">
        <div class="flex items-center">
          <div
            class="z-10 flex items-center justify-center w-6 h-6 overflow-hidden bg-white rounded-full dark:bg-dark-secondary shrink-0 aspect-square">
            <svg aria-hidden="true" class="w-3 h-3 text-blue-800 dark:text-blue-300" fill="currentColor"
              viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
            </svg>
          </div>
          <span class="mx-2 text-sm text-gray-600 text-nowrap dark:text-dark-primary">2021-2022</span>
          <div class="hidden sm:flex w-full bg-gray-200 h-0.5 dark:bg-dark-secondary"></div>
        </div>
        <div class="mt-3 sm:pe-8">
          <h3 class="text-lg font-semibold leading-tight text-gray-900 dark:text-dark-primary">
            Management Economique de la Construction
          </h3>
          <time class="block font-normal leading-none text-gray-700 text-md dark:text-dark-primary/80">Lycée Aime
            Césaire, Clisson
          </time>
          <p class="text-base font-normal text-gray-500 dark:text-dark-primary/60">
            1ère année de BTS M.E.C
          </p>
        </div>
      </li>
      <!-- Formation la plus récente avec mise en évidence -->
      <li
        class="relative pl-2 mb-6 transform scale-105 border-l-4 border-blue-500 rounded shadow-md sm:mb-0 dark:border-blue-400 dark:shadow-blue-900/30 bg-white/50 dark:bg-dark-secondary/50">
        <div class="flex items-center">
          <div
            class="z-10 flex items-center justify-center w-6 h-6 overflow-hidden bg-blue-100 rounded-full shadow-sm dark:bg-blue-900/70 shrink-0 aspect-square">
            <svg aria-hidden="true" class="w-3 h-3 text-blue-600 dark:text-blue-200" fill="currentColor"
              viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
            </svg>
          </div>
          <span class="mx-2 text-sm font-semibold text-blue-700 text-nowrap dark:text-blue-200">2022-2025</span>
          <div class="hidden w-full h-1 bg-blue-200 sm:flex dark:bg-blue-700/60"></div>
        </div>
        <div class="mt-3 sm:pe-8">
          <h3 class="text-lg font-semibold leading-tight text-gray-900 dark:text-dark-primary">
            Licence Informatique (3ème année)
          </h3>
          <time class="block font-normal leading-none text-gray-700 text-md dark:text-dark-primary/80">EPSI Montpellier
          </time>
          <p class="text-base font-normal text-gray-500 dark:text-dark-primary/60">
            En cours de Licence à l'EPSI (3ème année)
          </p>
        </div>
      </li>
    </ol>
  </div>
</template>
