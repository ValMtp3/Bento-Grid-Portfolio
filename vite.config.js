import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // `deep-chat` est un element personnalise du navigateur, pas un composant
    // Vue : sans cette regle, Vue tenterait de le resoudre et avertirait a
    // chaque rendu du chatbot.
    vue({ template: { compilerOptions: { isCustomElement: (tag) => tag === 'deep-chat' } } }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
});
