import type { Meta, StoryObj } from '@storybook/vue3'
import QRPreview from './QRPreview.vue'
import type { QRCodeConfig } from '..'

const meta: Meta<typeof QRPreview> = {
  title: 'QR Lib / Large payloads',
  component: QRPreview
}
export default meta
type Story = StoryObj<typeof QRPreview>

const LOREM = 'The quick brown fox jumps over the lazy dog. '.repeat(20)

function make(data: string): QRCodeConfig {
  return {
    data,
    size: 320,
    errorCorrectionLevel: 'L',
    dots: { shape: 'square', color: '#000' },
    background: { color: '#ffffff' }
  }
}

export const About1KB: Story = { args: { config: make(LOREM) } }
export const NearCapacity: Story = {
  args: { config: make(LOREM + LOREM + 'EOF') }
}
