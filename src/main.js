import '../tailwind.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createMetaManager } from 'vue-meta';
import App from './App.vue';
import router from './router';

const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.use(pinia);
app.use(createMetaManager());

// Monitoring des erreurs JavaScript pour le SEO
window.addEventListener('error', (event) => {
  // Log des erreurs JavaScript pour analyse SEO
  console.error('JavaScript Error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  });

  // Ici vous pouvez envoyer à un service de monitoring comme Sentry, LogRocket, etc.
  // Exemple: Sentry.captureException(event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  // Log des promesses rejetées non gérées
  console.error('Unhandled Promise Rejection:', {
    reason: event.reason,
    timestamp: new Date().toISOString(),
    url: window.location.href,
  });

  // Ici vous pouvez envoyer à un service de monitoring
  // Exemple: Sentry.captureException(event.reason);
});

// Attendre que le routeur soit prêt avant de monter l'application
router.isReady().then(() => {
  app.mount('#app');
});
