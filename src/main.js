import { createApp } from 'vue'
import { i18n } from './utils/i18n'
import App from './App.vue'
import './index.css'
import './style.css'

createApp(App).use(i18n).mount('#app')
