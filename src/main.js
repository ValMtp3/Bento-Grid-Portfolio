import '../tailwind.css';
import '@fontsource/space-grotesk/latin-400.css';
import '@fontsource/space-grotesk/latin-500.css';
import '@fontsource/space-grotesk/latin-600.css';
import '@fontsource/space-grotesk/latin-700.css';
import '@fontsource/intel-one-mono/latin-400.css';
import '@fontsource/intel-one-mono/latin-500.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createMetaManager } from 'vue-meta';
import App from './App.vue';
import router from './router';
import { initMatomo } from './matomo';

const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.use(pinia);
app.use(createMetaManager());
initMatomo(router);

// Attendre que le routeur soit prêt avant de monter l'application
router.isReady().then(() => {
  app.mount('#app');
});
