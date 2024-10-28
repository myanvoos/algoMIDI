import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// @ts-ignore
import p5vue from "p5vue";

createApp(App).use(p5vue).mount('#app')
