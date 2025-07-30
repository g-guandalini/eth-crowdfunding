import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './assets/main.css'
import VueNumeric from 'vue-numeric';
import router from './router'; 

const app = createApp(App);
app.use(createPinia());
app.use(VueNumeric); 
app.use(router);
app.mount('#app');
