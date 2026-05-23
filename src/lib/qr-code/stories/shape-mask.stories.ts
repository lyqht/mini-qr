import type { Meta, StoryObj } from '@storybook/vue3'
import QRPreview from './QRPreview.vue'
import type { QRCodeConfig, ShapeMask } from '..'

const meta: Meta<typeof QRPreview> = {
  title: 'QR Lib / Shape masks',
  component: QRPreview,
  argTypes: {
    data: {
      control: 'text',
      description:
        'String encoded into the QR. Aggressive masks (circle, heart, star) auto-bump EC to H so the result stays scannable.'
    },
    config: { control: 'object' }
  },
  args: {
    data: 'https://github.com/lyqht/mini-qr'
  }
}
export default meta
type Story = StoryObj<typeof QRPreview>

function configFor(mask: ShapeMask): QRCodeConfig {
  return {
    data: 'https://github.com/lyqht/mini-qr',
    size: 280,
    dots: { shape: 'rounded', color: '#111111' },
    cornerSquares: { shape: 'extra-rounded', color: '#111111' },
    cornerDots: { shape: 'dot', color: '#111111' },
    background: { color: '#ffffff' },
    shapeMask: mask
  }
}

export const Circle: Story = { args: { config: configFor('circle') } }
export const RoundedSquare: Story = { args: { config: configFor('rounded-square') } }
export const Triangle: Story = { args: { config: configFor('triangle') } }
export const Heart: Story = { args: { config: configFor('heart') } }
export const Star: Story = { args: { config: configFor('star') } }

export const CustomDiamond: Story = {
  args: {
    config: configFor({ svgPath: 'M0.5 0 L1 0.5 L0.5 1 L0 0.5 Z' })
  }
}
