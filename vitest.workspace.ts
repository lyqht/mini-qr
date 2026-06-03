import { defineWorkspace } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

const alias = { '@': path.resolve(__dirname, './src') }

// Tests that need a real browser (DOM, canvas, IndexedDB, etc.) — opt-in.
// Everything else runs in the default node project and is picked up by glob,
// so new test files don't need to touch this config.
const BROWSER_TESTS = [
  'src/utils/useQRCodeStorage.test.ts',
  'src/utils/css.test.ts',
  'src/utils/framePresets.test.ts',
  'src/utils/qrCodePresets.test.ts',
  'src/utils/download.test.ts',
  'src/utils/convertToImage.test.ts',
  'src/utils/useFitScale.test.ts',
  'src/lib/qr-code/legacy-adapter.test.ts',
  'src/lib/qr-code/render/canvas.test.ts'
]

export default defineWorkspace([
  {
    plugins: [vue()],
    assetsInclude: ['**/*.png'],
    test: {
      name: 'node',
      globals: true,
      environment: 'node',
      include: ['src/**/*.test.ts'],
      exclude: BROWSER_TESTS
    },
    resolve: { alias }
  },
  {
    plugins: [vue()],
    test: {
      name: 'browser',
      globals: true,
      include: BROWSER_TESTS,
      browser: {
        enabled: true,
        provider: 'playwright',
        headless: true,
        instances: [{ browser: 'chromium' }]
      }
    },
    resolve: { alias }
  }
])
