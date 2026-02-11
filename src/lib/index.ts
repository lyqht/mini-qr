import type { App, Plugin } from 'vue'
import MiniQr from './MiniQr.vue'

export { MiniQr }

export const MiniQrPlugin: Plugin = {
  install(app: App) {
    app.component('MiniQr', MiniQr)
  }
}

export default MiniQrPlugin
