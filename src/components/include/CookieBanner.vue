<template>
    <div id="cookie-banner" class="fixed bottom-0 w-full bg-gray-800 text-white p-4 z-50">
        <div class="container mx-auto flex flex-col md:flex-row items-center justify-between">
            <p class="mb-4 md:mb-0">
                Ce site utilise des cookies pour améliorer votre expérience utilisateur et collecter des statistiques
                anonymes. Pour en savoir plus, consultez notre <a href="/policy"
                    class="text-blue-400 underline">Politique de Confidentialité</a>.
            </p>
            <div class="flex">
                <button id="accept-cookies"
                    class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mr-2">
                    Accepter
                </button>
                <button id="decline-cookies" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                    Refuser
                </button>
            </div>
        </div>
    </div>
</template>
