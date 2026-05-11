import type { Meta, StoryObj } from '@storybook/vue3'
import QRPreview from './QRPreview.vue'
import type { DotShape, QRCodeConfig } from '..'

const meta: Meta<typeof QRPreview> = {
  title: 'QR Lib / Dot shapes',
  component: QRPreview,
  argTypes: {
    data: {
      control: 'text',
      description: 'String encoded into the QR. Edit to see how density changes.'
    },
    config: { control: 'object' }
  },
  args: {
    data: 'https://github.com/lyqht/mini-qr'
  }
}
export default meta
type Story = StoryObj<typeof QRPreview>

function configFor(shape: DotShape, color = '#111111'): QRCodeConfig {
  return {
    data: 'https://github.com/lyqht/mini-qr',
    size: 240,
    dots: { shape, color },
    background: { color: '#ffffff' }
  }
}

export const Square: Story = { args: { config: configFor('square') } }
export const Dots: Story = { args: { config: configFor('dots') } }
export const Rounded: Story = { args: { config: configFor('rounded') } }
export const ExtraRounded: Story = { args: { config: configFor('extra-rounded') } }
export const Classy: Story = { args: { config: configFor('classy') } }
export const ClassyRounded: Story = { args: { config: configFor('classy-rounded') } }
