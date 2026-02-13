<template>
  <div
    class="bg-white dark:bg-gray-800 font-[AnonymousPro] p-4 rounded-3xl w-full max-w-none transition-colors duration-300"
  >
    <span
      class="flex justify-center mb-6 text-xl font-bold text-center underline text-neutral-900 dark:text-white"
      >Formation</span
    >
    <ol class="flex flex-col-reverse gap-8 w-full xl:flex-row xl:gap-0">
      <li class="relative w-full xl:w-auto xl:flex-1 p-4">
        <div class="flex items-center">
          <div
            class="z-10 flex items-center justify-center w-6 h-6 overflow-hidden bg-white rounded-full dark:bg-gray-900 shrink-0 aspect-square"
          >
            <svg
              aria-hidden="true"
              class="w-3 h-3 text-blue-800 dark:text-blue-300"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"
              />
            </svg>
          </div>
          <span class="mx-2 text-sm text-gray-600 text-nowrap dark:text-white">2018-2020</span>
          <div class="hidden xl:flex w-full bg-gray-200 h-0.5 dark:bg-gray-900"></div>
        </div>
        <div class="mt-3 ml-2 xl:ml-0 xl:pe-8">
          <h3 class="text-lg font-semibold leading-tight text-gray-900 dark:text-white text-pretty">
            Bac STI2D
          </h3>
          <time class="block font-normal leading-none text-gray-700 text-md dark:text-white/80"
            >Lycée Émile Peytavin, Mende
          </time>
          <p class="text-base font-normal text-gray-500 dark:text-white/60">Science et Technologie de l'Industrie</p>
        </div>
      </li>
      <li class="relative w-full xl:w-auto xl:flex-1 p-4">
        <div class="flex items-center">
          <div
            class="z-10 flex items-center justify-center w-6 h-6 overflow-hidden bg-white rounded-full dark:bg-gray-900 shrink-0 aspect-square"
          >
            <svg
              aria-hidden="true"
              class="w-3 h-3 text-blue-800 dark:text-blue-300"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"
              />
            </svg>
          </div>
          <span class="mx-2 text-sm text-gray-600 text-nowrap dark:text-white">2020</span>
          <div class="hidden xl:flex w-full bg-gray-200 h-0.5 dark:bg-gray-900"></div>
        </div>
        <div class="mt-3 ml-2 xl:ml-0 xl:pe-8">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Certification TOSA</h3>
          <time class="block font-normal leading-none text-gray-700 text-md dark:text-white/80"
            >Gréta, Clermont l'Hérault
          </time>
          <p class="text-base font-normal text-gray-500 dark:text-white/60">
            Word, Excel, PowerPoint
          </p>
        </div>
      </li>
      <li class="relative w-full xl:w-auto xl:flex-1 p-4">
        <div class="flex items-center">
          <div
            class="z-10 flex items-center justify-center w-6 h-6 overflow-hidden bg-white rounded-full dark:bg-gray-900 shrink-0 aspect-square"
          >
            <svg
              aria-hidden="true"
              class="w-3 h-3 text-blue-800 dark:text-blue-300"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"
              />
            </svg>
          </div>
          <span class="mx-2 text-sm text-gray-600 text-nowrap dark:text-white">2021-2022</span>
          <div class="hidden xl:flex w-full bg-gray-200 h-0.5 dark:bg-gray-900"></div>
        </div>
        <div class="mt-3 ml-2 xl:ml-0 xl:pe-8">
          <h3 class="text-lg font-semibold leading-tight text-gray-900 dark:text-white">
            BTS M.E.C
          </h3>
          <time class="block font-normal leading-none text-gray-700 text-md dark:text-white/80"
            >Lycée Aime Césaire, Clisson
          </time>
          <p class="text-base font-normal text-gray-500 dark:text-white/60">
            1ère année Management Éco.
          </p>
        </div>
      </li>
      <!-- Formation la plus récente -->
      <li
        class="relative p-4 mb-2 xl:mb-0 transform scale-100 w-full xl:w-auto xl:flex-1 border border-blue-200 rounded-xl shadow-sm bg-blue-50/50 dark:bg-blue-900/20 dark:border-blue-800"
      >
        <div class="flex items-center">
          <div
            class="z-10 flex items-center justify-center w-6 h-6 overflow-hidden bg-blue-100 rounded-full shadow-sm dark:bg-blue-900/70 shrink-0 aspect-square"
          >
            <svg
              aria-hidden="true"
              class="w-3 h-3 text-blue-600 dark:text-blue-200"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"
              />
            </svg>
          </div>
          <span class="mx-2 text-sm font-semibold text-blue-700 text-nowrap dark:text-blue-200"
            >2022-2025</span
          >
          <div class="hidden w-full h-1 bg-blue-200 xl:flex dark:bg-blue-700/60"></div>
        </div>
        <div class="mt-3 xl:pe-8">
          <h3 class="text-lg font-bold leading-tight text-gray-900 dark:text-white">
            Licence Info Data/IA
          </h3>
          <time class="block font-medium leading-none text-blue-700 dark:text-blue-300"
            >EPSI Montpellier
          </time>
          <p class="text-sm font-normal text-gray-600 dark:text-gray-300 mt-1">
            Développement & Big Data (RNCP Niv. 6)
          </p>
        </div>
      </li>
    </ol>
  </div>

</template>
