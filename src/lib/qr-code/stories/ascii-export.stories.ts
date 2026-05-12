import type { Meta, StoryObj } from '@storybook/vue3'
import { defineComponent, h, computed } from 'vue'
import { buildMatrix, qrMatrixToText, type AsciiFormat } from '..'

const AsciiPreview = defineComponent({
  name: 'AsciiPreview',
  props: {
    data: { type: String, default: 'https://github.com/lyqht/mini-qr' },
    format: { type: String as () => AsciiFormat, default: 'ascii' as AsciiFormat },
    quietZone: { type: Number, default: 2 }
  },
  setup(props) {
    const text = computed(() => {
      try {
        const m = buildMatrix(props.data, 'Q').matrix
        return qrMatrixToText(m, props.format, { quietZone: props.quietZone })
      } catch (e) {
        return String(e)
      }
    })
    return () =>
      h(
        'pre',
        {
          style:
            'font-family: monospace; line-height: 1; white-space: pre; padding: 12px; background: #f8f8f8; overflow: auto;'
        },
        text.value
      )
  }
})

const meta: Meta<typeof AsciiPreview> = {
  title: 'QR Lib / ASCII export',
  component: AsciiPreview,
  argTypes: {
    data: { control: 'text' },
    format: {
      control: 'select',
      options: ['ascii', 'unicode-half', 'unicode-full']
    },
    quietZone: { control: { type: 'number', min: 0, max: 6 } }
  },
  args: { data: 'https://github.com/lyqht/mini-qr', quietZone: 2 }
}
export default meta
type Story = StoryObj<typeof AsciiPreview>

export const Ascii: Story = { args: { format: 'ascii' } }
export const UnicodeHalf: Story = { args: { format: 'unicode-half' } }
export const UnicodeFull: Story = { args: { format: 'unicode-full' } }
