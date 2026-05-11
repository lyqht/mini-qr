import type { Meta, StoryObj } from '@storybook/vue3'
import QRPreview from './QRPreview.vue'
import type { QRCodeConfig, TextPosition } from '..'

const meta: Meta<typeof QRPreview> = {
  title: 'QR Lib / Frame',
  component: QRPreview,
  argTypes: {
    data: { control: 'text' }
  },
  args: {
    data: 'https://github.com/lyqht/mini-qr'
  }
}
export default meta
type Story = StoryObj<typeof QRPreview>

function make(textPosition: TextPosition, text = 'Scan me'): QRCodeConfig {
  return {
    data: 'https://github.com/lyqht/mini-qr',
    size: 220,
    dots: { shape: 'extra-rounded', color: '#0f8b4c' },
    cornerSquares: { shape: 'extra-rounded', color: '#0f8b4c' },
    cornerDots: { shape: 'square', color: '#0f8b4c' },
    background: { color: '#ffffff' },
    frame: {
      text,
      textPosition,
      backgroundColor: '#ffffff',
      borderColor: '#0f8b4c',
      borderWidth: 3,
      borderRadius: 12,
      padding: 16,
      fontSize: 20,
      textColor: '#0f8b4c'
    }
  }
}

export const Top: Story = { args: { config: make('top') } }
export const Bottom: Story = { args: { config: make('bottom') } }
export const Left: Story = { args: { config: make('left', 'Scan\nme') } }
export const Right: Story = { args: { config: make('right', 'Scan\nme') } }
