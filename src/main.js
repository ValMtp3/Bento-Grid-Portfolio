import '../tailwind.css';
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/intel-one-mono/400.css';
import '@fontsource/intel-one-mono/500.css';
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
