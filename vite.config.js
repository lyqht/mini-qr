import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['app_icons/web/favicon.ico'],
      manifest: {
        name: 'MiniQR',
        short_name: 'MiniQR',
        description: 'A minimal QR code generator and scanner',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        icons: [
          {
            src: 'app_icons/web/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'app_icons/web/icon-192-maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'app_icons/web/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'app_icons/web/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
