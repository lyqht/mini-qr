import type { Meta, StoryObj } from '@storybook/vue3'
import QRPreview from './QRPreview.vue'
import type { ECLevel, QRCodeConfig } from '..'

const LONG_URL =
  'https://github.com/lyqht/mini-qr?utm_source=storybook&utm_campaign=ec-level-comparison'

const meta: Meta<typeof QRPreview> = {
  title: 'QR Lib / Error correction',
  component: QRPreview,
  argTypes: {
    data: {
      control: 'text',
      description: 'Edit to compare how the matrix density grows with stronger correction'
    }
  },
  args: {
    data: LONG_URL
  }
}
export default meta
type Story = StoryObj<typeof QRPreview>

function make(level: ECLevel): QRCodeConfig {
  return {
    data: LONG_URL,
    size: 200,
    errorCorrectionLevel: level,
    dots: { shape: 'square', color: '#000' },
    background: { color: '#ffffff' }
  }
}

export const L: Story = { args: { config: make('L') } }
export const M: Story = { args: { config: make('M') } }
export const Q: Story = { args: { config: make('Q') } }
export const H: Story = { args: { config: make('H') } }
