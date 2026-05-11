import type { Meta, StoryObj } from '@storybook/vue3'
import { defineComponent, h } from 'vue'
import QRPreview from './QRPreview.vue'
import type { QRCodeConfig } from '..'

const SAMPLES = [
  'https://example.com/a',
  'https://example.com/b',
  'https://example.com/c',
  'https://example.com/d',
  'https://example.com/e',
  'https://example.com/f'
]

function makeConfig(data: string): QRCodeConfig {
  return {
    data,
    size: 160,
    dots: { shape: 'extra-rounded', color: '#111' },
    background: { color: '#ffffff' }
  }
}

const BatchGrid = defineComponent({
  name: 'BatchGrid',
  setup() {
    return () =>
      h(
        'div',
        {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, auto)',
            gap: '24px',
            padding: '24px',
            background: '#f4f4f5'
          }
        },
        SAMPLES.map((url) => h(QRPreview, { config: makeConfig(url) }))
      )
  }
})

const meta: Meta<typeof BatchGrid> = {
  title: 'QR Lib / Batch grid',
  component: BatchGrid
}
export default meta
type Story = StoryObj<typeof BatchGrid>

export const Default: Story = {}
