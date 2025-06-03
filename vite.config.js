import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, '.', '')
  // Get BASE_PATH from environment variable, default to '/'
  // Ensure base path ends with slash for proper URL construction
  let base = env.BASE_PATH || '/'
  if (base !== '/' && !base.endsWith('/')) {
    base = base + '/'
  }

  return {
    base,
    define: {
      // Make BASE_PATH available to client-side code through import.meta.env
      'import.meta.env.BASE_PATH': JSON.stringify(base)
    },
    plugins: [
      vue(),
      vueJsx(),
      VitePWA({
        registerType: 'autoUpdate',
        base: base, // Make sure PWA respects the base path
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
          start_url: base, // Use the base path as start URL
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
          globPatterns: ['**/*.{js,css,svg,png,jpg,jpeg,gif,ico,woff,woff2}'], // Removed html from patterns
          // Exclude large files from precaching and HTML files to avoid base path issues
          globIgnores: ['**/app_preview.*', '**/presets/*.svg', '**/*.html'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit
          // Don't precache index.html to avoid base path issues
          dontCacheBustURLsMatching: /\.\w{8}\./,
          navigateFallback: null, // Disable navigate fallback to avoid issues
          navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
          // Remove modifyURLPrefix as it's causing conflicts with the base path
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.destination === 'document',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'pages',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 86400 // 1 day
                }
              }
            }
          ]
        },
        devOptions: {
          // enabled: true,
          type: 'module'
        }
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  }
})
