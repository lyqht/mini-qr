import PLACEHOLDER_IMAGE_URL from '@/assets/placeholder_image.png'
import type { StyledQRCodeProps } from '@/components/StyledQRCode.vue'
import type { CornerDotType, DrawType } from 'qr-code-styling'
import { i18n } from './i18n'

export interface CustomStyleProps {
  borderRadius?: string
  background?: string
}

export type PresetAttributes = {
  style: CustomStyleProps
  name: string
}

type Preset = Required<StyledQRCodeProps> & PresetAttributes

const defaultPresetOptions = {
  backgroundOptions: {
    color: 'transparent'
  },
  imageOptions: {
    margin: 0
  },
  width: 200,
  height: 200,
  margin: 0,
  type: 'svg' as DrawType
}

export const defaultPreset: Preset = {
  ...defaultPresetOptions,
  name: i18n.global.t('Default Preset'),
  data: 'https://github.com/lyqht',
  image: PLACEHOLDER_IMAGE_URL,
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
  style: {
    borderRadius: '24px',
    background: '#697d80'
  }
}

export const presetBlue: Preset = {
  ...defaultPreset,
  name: i18n.global.t('Basic Blue Preset'),
  dotsOptions: {
    color: '#0000ff',
    type: 'square'
  },
  cornersSquareOptions: {
    color: '#0000ff',
    type: 'square'
  },
  cornersDotOptions: {
    color: '#0000ff',
    type: 'extra-rounded' as CornerDotType
  },
  style: {
    borderRadius: '16px',
    background: '#a0a0f0'
  }
}

export const presetRed: Preset = {
  ...defaultPreset,
  name: i18n.global.t('Basic Red Preset'),
  dotsOptions: {
    color: '#ff0000',
    type: 'dots'
  },
  cornersSquareOptions: {
    color: '#ff0000',
    type: 'dot'
  },
  cornersDotOptions: {
    color: '#ff0000',
    type: 'extra-rounded' as CornerDotType
  },
  style: {
    borderRadius: '10px',
    background: '#f0a0a0'
  }
}

export const presetGreen: Preset = {
  ...defaultPreset,
  name: i18n.global.t('Basic Green Preset'),
  dotsOptions: {
    color: '#385E1C',
    type: 'square'
  },
  cornersSquareOptions: {
    color: '#385E1C',
    type: 'square'
  },
  cornersDotOptions: {
    color: '#385E1C',
    type: 'dot'
  },
  style: {
    borderRadius: '20px',
    background: '#a0f0a0'
  }
}

// Custom presets

export const padletPreset: Preset = {
  ...defaultPresetOptions,
  name: i18n.global.t('Padlet Preset'),
  data: 'https://padlet.com/',
  image:
    'https://v1.padlet.pics/3/image.webp?t=c_limit%2Cdpr_2%2Ch_665%2Cw_835&url=https%3A%2F%2Fugc.padletcdn.com%2Fuploads%2Fpadlet-uploads%2F80961422%2Fe899b39fcf2f3e705ccfa017cdb49c26%2FCrane.svg%3Fexpiry_token%3D5WaHZRdGG3LkUVQGy3SZ-zdRtq89aJeottSBaF_Hii8EGDVBG-vnLc5ZfL_2GiKosWMOCkHArMcc8LorETHcZyy8t7O3lxfMxdmHX_xkMWI2Az-OSmg73voj8ousyfUWoclzpPE-oHXzShXlf3VmK_rLSohun5uc1D8yzsF1tGma3N8COdaM4Dt-URPZL9mx2qyW6KqLKUV8DrMHU1usGw%3D%3D',
  width: 200,
  height: 200,
  margin: 0,
  dotsOptions: { color: '#7ABE4A', type: 'extra-rounded' },
  cornersSquareOptions: { color: '#ed457e', type: 'extra-rounded' },
  cornersDotOptions: { color: '#ed457e', type: 'square' },
  style: { borderRadius: '24px', background: '#000000' }
}

export const vercelLightPreset: Preset = {
  ...defaultPresetOptions,
  name: i18n.global.t('Vercel Light Preset'),
  data: 'https://vercel.com',
  image: 'https://api.iconify.design/ion:logo-vercel.svg?color=%23000',
  dotsOptions: { color: '#000000', type: 'classy' },
  cornersSquareOptions: { color: '#000000', type: 'square' },
  cornersDotOptions: { color: '#000000', type: 'square' },
  style: { borderRadius: '0px', background: '#FFFFFF' },
  margin: 8,
  imageOptions: {
    margin: 8
  }
}

export const vercelDarkPreset: Preset = {
  ...defaultPresetOptions,
  name: i18n.global.t('Vercel Dark Preset'),
  data: 'https://vercel.com',
  image: 'https://api.iconify.design/ion:logo-vercel.svg?color=%23FFF',
  dotsOptions: { color: '#FFFFFF', type: 'classy' },
  cornersSquareOptions: { color: '#FFFFFF', type: 'square' },
  cornersDotOptions: { color: '#FFFFFF', type: 'square' },
  style: { borderRadius: '0px', background: '#000000' },
  margin: 8,
  imageOptions: {
    margin: 8
  }
}

export const supabasePreset: Preset = {
  ...defaultPresetOptions,
  name: i18n.global.t('Supabase Preset'),
  data: 'https://supabase.com',
  image:
    'https://supabase.com/_next/image?url=https%3A%2F%2Favatars.githubusercontent.com%2Fu%2F54469796&w=3840&q=75',
  dotsOptions: {
    color: '#3ecf8e',
    type: 'classy-rounded'
  },
  cornersSquareOptions: {
    color: '#3ecf8e',
    type: 'square'
  },
  cornersDotOptions: {
    color: '#3ecf8e',
    type: 'square'
  },
  imageOptions: {
    margin: 0
  },
  style: {
    borderRadius: '12px',
    background: '#000000'
  }
}

export const allPresets = [
  defaultPreset,
  padletPreset,
  supabasePreset,
  vercelLightPreset,
  vercelDarkPreset,
  presetBlue,
  presetRed,
  presetGreen
]
