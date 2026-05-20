import type { Meta, StoryObj } from '@storybook/vue3'
import QRPreview from './QRPreview.vue'
import type { GradientConfig, QRCodeConfig } from '..'

const meta: Meta<typeof QRPreview> = {
  title: 'QR Lib / Gradient masks',
  component: QRPreview,
  argTypes: {
    data: {
      control: 'text',
      description: 'String encoded into the QR. Edit to see the gradient under different densities.'
    },
    config: { control: 'object' }
  },
  args: {
    data: 'https://github.com/lyqht/mini-qr'
  }
}
export default meta
type Story = StoryObj<typeof QRPreview>

const linearWarm: GradientConfig = {
  type: 'linear',
  rotation: Math.PI / 4,
  colorStops: [
    { offset: 0, color: '#ff6a00' },
    { offset: 1, color: '#ee0979' }
  ]
}

const linearCool: GradientConfig = {
  type: 'linear',
  rotation: 0,
  colorStops: [
    { offset: 0, color: '#0061ff' },
    { offset: 1, color: '#60efff' }
  ]
}

const radialNight: GradientConfig = {
  type: 'radial',
  colorStops: [
    { offset: 0, color: '#1f2a44' },
    { offset: 1, color: '#000000' }
  ]
}

const radialSunset: GradientConfig = {
  type: 'radial',
  colorStops: [
    { offset: 0, color: '#fceabb' },
    { offset: 1, color: '#f8b500' }
  ]
}

function withConfig(config: Partial<QRCodeConfig>): QRCodeConfig {
  return {
    data: 'https://github.com/lyqht/mini-qr',
    size: 280,
    background: { color: '#ffffff' },
    ...config
  }
}

export const LinearOnDots: Story = {
  args: {
    config: withConfig({
      dots: { shape: 'rounded', color: '#000000', gradient: linearWarm }
    })
  }
}

export const RadialOnDots: Story = {
  args: {
    config: withConfig({
      dots: { shape: 'dots', color: '#000000', gradient: radialNight }
    })
  }
}

export const GradientBackground: Story = {
  args: {
    config: withConfig({
      dots: { shape: 'square', color: '#1f2a44' },
      background: { color: '#ffffff', gradient: radialSunset }
    })
  }
}

export const FullyGradient: Story = {
  args: {
    config: withConfig({
      dots: { shape: 'extra-rounded', color: '#000000', gradient: linearCool },
      cornerSquares: { shape: 'extra-rounded', color: '#000000', gradient: linearWarm },
      cornerDots: { shape: 'dot', color: '#000000', gradient: linearWarm },
      background: { color: '#ffffff' }
    })
  }
}
