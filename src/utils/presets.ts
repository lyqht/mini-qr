import type { StyledQRCodeProps } from '@/components/StyledQRCode.vue'
import PLACEHOLDER_IMAGE_URL from '@/assets/placeholder_image.png'

export interface CustomStyleProps {
  borderRadius?: string
  background?: string
}

export const defaultPreset: Required<StyledQRCodeProps> & { style: CustomStyleProps } = {
  data: 'https://github.com/lyqht',
  image: PLACEHOLDER_IMAGE_URL,
  width: 200,
  height: 200,
  margin: 0,
  type: 'svg',
  dotsOptions: {
    color: '#abcbca',
    type: 'extra-rounded'
  },
  cornersSquareOptions: {
    color: '#abcbca',
    type: 'extra-rounded'
  },
  cornersDotOptions: {
    color: '#abcbca',
    type: 'square'
  },
  backgroundOptions: {
    color: 'transparent'
  },
  imageOptions: {
    margin: 0
  },
  style: {
    borderRadius: '24px',
    background: '#697d80'
  }
}
