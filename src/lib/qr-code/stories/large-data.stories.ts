import type { Meta, StoryObj } from '@storybook/vue3'
import QRPreview from './QRPreview.vue'
import type { QRCodeConfig } from '..'

const LOREM = 'The quick brown fox jumps over the lazy dog. '.repeat(20)

const meta: Meta<typeof QRPreview> = {
  title: 'QR Lib / Large payloads',
  component: QRPreview,
  argTypes: {
    data: {
      control: 'text',
      description: 'Paste a large payload here to test capacity at the chosen EC level'
    }
  },
  args: {
    data: LOREM
  }
}
export default meta
type Story = StoryObj<typeof QRPreview>

function make(data: string): QRCodeConfig {
  return {
    data,
    size: 320,
    errorCorrectionLevel: 'L',
    dots: { shape: 'square', color: '#000' },
    background: { color: '#ffffff' }
  }
}

export const About1KB: Story = { args: { data: LOREM, config: make(LOREM) } }
export const NearCapacity: Story = {
  args: { data: LOREM + LOREM + 'EOF', config: make(LOREM + LOREM + 'EOF') }
}
