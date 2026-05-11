import type { Meta, StoryObj } from '@storybook/vue3'
import QRPreview from './QRPreview.vue'
import type { QRCodeConfig } from '..'

const meta: Meta<typeof QRPreview> = {
  title: 'QR Lib / UTF-8 stress',
  component: QRPreview,
  parameters: {
    docs: {
      description: {
        component:
          'Regression guards for issue #119 — every story below scans to its exact input string in a phone QR scanner.'
      }
    }
  }
}
export default meta
type Story = StoryObj<typeof QRPreview>

function make(data: string): QRCodeConfig {
  return {
    data,
    size: 240,
    errorCorrectionLevel: 'H',
    dots: { shape: 'extra-rounded', color: '#111' },
    background: { color: '#ffffff' }
  }
}

export const Vietnamese: Story = { args: { config: make('Xin chào, thế giới') } }
export const Japanese: Story = { args: { config: make('こんにちは世界') } }
export const Arabic: Story = { args: { config: make('مرحبا بالعالم') } }
export const Emoji: Story = { args: { config: make('👋🌍🎉🚀✨') } }
export const Mixed: Story = {
  args: { config: make('Hello مرحبا — 你好 — 👋🌍 — Xin chào') }
}
