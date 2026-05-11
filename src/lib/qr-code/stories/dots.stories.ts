import type { Meta, StoryObj } from '@storybook/vue3'
import QRPreview from './QRPreview.vue'
import type { DotShape, QRCodeConfig } from '..'

const meta: Meta<typeof QRPreview> = {
  title: 'QR Lib / Dot shapes',
  component: QRPreview,
  argTypes: {
    config: { control: 'object' }
  }
}
export default meta
type Story = StoryObj<typeof QRPreview>

function make(shape: DotShape, color = '#111111'): QRCodeConfig {
  return {
    data: 'https://github.com/lyqht/mini-qr',
    size: 240,
    dots: { shape, color },
    background: { color: '#ffffff' }
  }
}

export const Square: Story = { args: { config: make('square') } }
export const Dots: Story = { args: { config: make('dots') } }
export const Rounded: Story = { args: { config: make('rounded') } }
export const ExtraRounded: Story = { args: { config: make('extra-rounded') } }
export const Classy: Story = { args: { config: make('classy') } }
export const ClassyRounded: Story = { args: { config: make('classy-rounded') } }
