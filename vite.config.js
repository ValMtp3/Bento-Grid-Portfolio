import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue')) return 'vendor-vue';
            if (id.includes('swiper')) return 'vendor-swiper';
            if (id.includes('markstream') || id.includes('stream-markdown-parser')) {
              return 'vendor-chat';
            }
            if (id.includes('@iconify')) return 'vendor-iconify';
            return 'vendor';
          }
        },
      },
    },
  },
});
