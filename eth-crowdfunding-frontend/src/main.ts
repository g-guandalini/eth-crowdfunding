import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './assets/main.css'
import VueNumeric from 'vue-numeric';
import router from './router'; 

// Importar o CSS da biblioteca toast
import "vue-toastification/dist/index.css";
// Importar o plugin e a interface de opções
import Toast, { type PluginOptions } from "vue-toastification";

const app = createApp(App);

// Opções de configuração padrão para os toasts
const toastOptions: PluginOptions = {
    // Você pode definir a posição padrão dos toasts
    position: "top-right", // Ex: "top-left", "top-center", "bottom-right", etc.
    timeout: 3000, // Duração padrão em milissegundos (3 segundos)
    closeOnClick: true, // Fecha o toast ao clicar
    pauseOnHover: true, // Pausa o timeout se o mouse estiver sobre o toast
    draggable: true, // Permite arrastar o toast
    draggablePercent: 0.6, // Percentual do toast que precisa ser arrastado para fechar
    showCloseButtonOnHover: false, // Mostra o botão de fechar apenas no hover
    hideProgressBar: false, // Esconde a barra de progresso do timeout
    closeButton: "button", // Tipo do botão de fechar (pode ser false para não mostrar)
    icon: true, // Mostra o ícone padrão para cada tipo de toast (sucesso, erro, etc.)
    rtl: false // Direção do texto (right-to-left)
};

app.use(createPinia());
app.use(VueNumeric); 
app.use(router);
app.use(Toast, toastOptions); // Registrar o plugin do Toast com as opções
app.mount('#app');
