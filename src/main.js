import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import '../tailwind.css';

const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.mount('#app');
