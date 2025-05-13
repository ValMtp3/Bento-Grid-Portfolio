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
app.mount('#app');
