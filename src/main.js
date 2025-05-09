import { createApp } from 'vue'
import { i18n } from './utils/i18n'
import App from './App.vue'
import './index.css'
import './style.css'
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })

createApp(App).use(i18n).mount('#app')
