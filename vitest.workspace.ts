import { defineWorkspace } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

const alias = { '@': path.resolve(__dirname, './src') }

export default defineWorkspace([
  {
    plugins: [vue()],
    assetsInclude: ['**/*.png'],
    test: {
      name: 'node',
      globals: true,
      environment: 'node',
      include: [
        'src/utils/csv.test.ts',
        'src/utils/csvBatchProcessing.test.ts',
        'src/utils/dataEncoding.test.ts'
      ]
    },
    resolve: { alias }
  },
  {
    plugins: [vue()],
    test: {
      name: 'browser',
      globals: true,
      include: [
        'src/utils/useQRCodeStorage.test.ts',
        'src/utils/css.test.ts',
        'src/utils/framePresets.test.ts',
        'src/utils/qrCodePresets.test.ts'
      ],
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
