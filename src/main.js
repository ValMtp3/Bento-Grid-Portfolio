import '../tailwind.css';
import '@fontsource/space-grotesk/latin-400.css';
import '@fontsource/space-grotesk/latin-500.css';
import '@fontsource/space-grotesk/latin-600.css';
import '@fontsource/space-grotesk/latin-700.css';
import '@fontsource/intel-one-mono/latin-400.css';
import '@fontsource/intel-one-mono/latin-500.css';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { printConsoleSignature } from './easter-eggs/console.js';

const app = createApp(App);

app.use(router);

import('./matomo')
  .then(({ initMatomo }) => initMatomo(router))
  .catch(() => {});

// Attendre que le routeur soit prêt avant de monter l'application
router.isReady().then(() => {
  app.mount('#app');
  printConsoleSignature();
});
