import { createApp } from "vue";
import "./style.css";
import "primeicons/primeicons.css";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import App from "./App.vue";

// @ts-ignore
import p5vue from "p5vue";

const pinia = createPinia();
const app = createApp(App);
app.use(p5vue);
app.use(pinia);
app.use(PrimeVue);

app.mount("#app");
