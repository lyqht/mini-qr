import type { Meta, StoryObj } from '@storybook/vue3'
import QRPreview from './QRPreview.vue'
import type { FrameConfig, QRCodeConfig, TextPosition } from '..'

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

/* ---------- Frame background image ---------- */

// Inline data URI so stories render offline and deterministically — same
// shape as an uploaded file, which the app stores as a data:image URI.
const GRADIENT_BG = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="#0f8b4c"/><stop offset="1" stop-color="#bfe8d2"/>` +
    `</linearGradient></defs>` +
    `<rect width="200" height="200" fill="url(#g)"/></svg>`
)}`

function makeWithBackgroundImage(
  textPosition: TextPosition,
  frameOverrides: Partial<FrameConfig> = {}
): QRCodeConfig {
  const config = make(textPosition)
  return {
    ...config,
    frame: {
      ...config.frame!,
      backgroundImage: GRADIENT_BG,
      textColor: '#ffffff',
      borderColor: '#0f8b4c',
      ...frameOverrides
    }
  }
}

/** Image covers the frame; the QR keeps its own background so it stays scannable. */
export const BackgroundImage: Story = {
  args: { config: makeWithBackgroundImage('bottom') }
}

/** The background image is clipped to the frame's border radius. */
export const BackgroundImageRoundedCorners: Story = {
  args: { config: makeWithBackgroundImage('bottom', { borderRadius: 32 }) }
}

/** Side captions size the image to the wider frame. */
export const BackgroundImageSideCaption: Story = {
  args: { config: makeWithBackgroundImage('right') }
}

/** Background image + centre logo — two <image> elements in one SVG. */
export const BackgroundImageWithLogo: Story = {
  args: {
    config: {
      ...makeWithBackgroundImage('bottom'),
      errorCorrectionLevel: 'H',
      image: {
        href: 'https://api.iconify.design/logos:vue.svg',
        sizeRatio: 0.35,
        hideBackgroundDots: true
      }
    }
  }
}
