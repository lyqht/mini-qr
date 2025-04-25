// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()], // Include Vue plugin if testing Vue components
  test: {
    globals: true, // Use global APIs like describe, it, expect
    // Exclude E2E tests
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      './tests/e2e/**'
    ],
    // Add any other Vitest config options here
    coverage: {
      provider: 'v8', // or 'istanbul'
      reporter: ['text', 'json', 'html']
    }
  },
  resolve: {
    alias: {
      // Setup aliases to match your Vite/Vue config if necessary
      '@': path.resolve(__dirname, './src')
    }
  }
})
