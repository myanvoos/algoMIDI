import { createApp } from 'vue'
import './style.css'
import 'primeicons/primeicons.css'
import App from './App.vue'
import PrimeVue from 'primevue/config'

// @ts-ignore
import p5vue from "p5vue";

const app = createApp(App)
app.use(p5vue)
app.use(PrimeVue)

app.mount('#app')
