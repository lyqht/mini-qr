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
      includeAssets: [
        'app_icons/web/favicon.ico',
        'app_icons/web/splash-750x1334@2x.png',
        'app_icons/web/splash-1170x2532@3x.png',
        'app_icons/web/splash-1290x2796@3x.png',
        'app_icons/web/splash-2048x2732@2x.png'
      ],
      manifest: {
        name: 'MiniQR',
        short_name: 'MiniQR',
        description: 'A minimal QR code generator and scanner',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
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
        ],
        screenshots: [
          {
            src: 'app_icons/web/screenshot-narrow.png',
            sizes: '3510x7596',
            type: 'image/png',
            form_factor: 'narrow'
          },
          {
            src: 'app_icons/web/screenshot-wide.png',
            sizes: '7596x3510',
            type: 'image/png',
            form_factor: 'wide'
          }
        ]
      },
      workbox: {
        navigateFallback: 'index.html'
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
