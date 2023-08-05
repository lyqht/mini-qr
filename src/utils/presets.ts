import type { StyledQRCodeProps } from '@/components/StyledQRCode.vue'
import PLACEHOLDER_IMAGE_URL from '@/assets/placeholder_image.png'
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
  name: i18n.global.t('Blue Preset'),
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
  name: i18n.global.t('Red Preset'),
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
  name: i18n.global.t('Green Preset'),
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

export const padletPreset1: Preset = {
  ...defaultPresetOptions,
  name: i18n.global.t('Padlet Preset 1'),
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

export const allPresets = [defaultPreset, presetBlue, presetRed, presetGreen, padletPreset1]
