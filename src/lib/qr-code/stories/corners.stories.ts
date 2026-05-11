import type { Meta, StoryObj } from '@storybook/vue3'
import QRPreview from './QRPreview.vue'
import type { CornerDotShape, CornerSquareShape, QRCodeConfig } from '..'

const meta: Meta<typeof QRPreview> = {
  title: 'QR Lib / Corner shapes',
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

function make(cs: CornerSquareShape, cd: CornerDotShape): QRCodeConfig {
  return {
    data: 'https://github.com/lyqht/mini-qr',
    size: 240,
    dots: { shape: 'extra-rounded', color: '#333' },
    cornerSquares: { shape: cs, color: '#ed457e' },
    cornerDots: { shape: cd, color: '#ed457e' },
    background: { color: '#ffffff' }
  }
}

export const SquareSquare: Story = { args: { config: make('square', 'square') } }
export const SquareDot: Story = { args: { config: make('square', 'dot') } }
export const ExtraRoundedSquare: Story = { args: { config: make('extra-rounded', 'square') } }
export const ExtraRoundedDot: Story = { args: { config: make('extra-rounded', 'dot') } }
export const DotSquare: Story = { args: { config: make('dot', 'square') } }
export const DotDot: Story = { args: { config: make('dot', 'dot') } }
