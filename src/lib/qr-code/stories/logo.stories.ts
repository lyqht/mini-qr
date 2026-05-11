import type { Meta, StoryObj } from '@storybook/vue3'
import QRPreview from './QRPreview.vue'
import type { QRCodeConfig } from '..'

const meta: Meta<typeof QRPreview> = {
  title: 'QR Lib / Logo overlay',
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

const base = (overrides: Partial<QRCodeConfig['image']> & { href: string }): QRCodeConfig => ({
  data: 'https://github.com/lyqht/mini-qr',
  size: 240,
  errorCorrectionLevel: 'H',
  dots: { shape: 'extra-rounded', color: '#000' },
  background: { color: '#ffffff' },
  image: { sizeRatio: 0.4, hideBackgroundDots: true, ...overrides }
})

export const SvgLogoHidingBackground: Story = {
  args: {
    config: base({
      href: 'https://api.iconify.design/logos:vue.svg',
      crossOrigin: 'anonymous'
    })
  }
}

export const SvgLogoOverlayingDots: Story = {
  args: {
    config: base({
      href: 'https://api.iconify.design/logos:vue.svg',
      crossOrigin: 'anonymous',
      hideBackgroundDots: false
    })
  }
}

export const SmallerLogo: Story = {
  args: {
    config: base({
      href: 'https://api.iconify.design/logos:vue.svg',
      crossOrigin: 'anonymous',
      sizeRatio: 0.18
    })
  }
}
