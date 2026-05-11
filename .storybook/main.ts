import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: ['../src/lib/qr-code/**/*.stories.@(ts|js)'],
  addons: [],
  framework: {
    name: '@storybook/vue3-vite',
    options: {}
  },
  docs: { autodocs: false },
  core: { disableTelemetry: true }
}

export default config
