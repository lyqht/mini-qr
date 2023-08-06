import PLACEHOLDER_IMAGE_URL from '@/assets/placeholder_image.png'
import type { StyledQRCodeProps } from '@/components/StyledQRCode.vue'
import type { CornerDotType, DrawType } from 'qr-code-styling'

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
  name: 'Default Preset',
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
  name: 'Basic Blue Preset',
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
  name: 'Basic Red Preset',
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
  name: 'Basic Green Preset',
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
  name: 'Padlet Preset',
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
  name: 'Vercel Light Preset',
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
  name: 'Vercel Dark Preset',
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
  name: 'Supabase Preset',
  data: 'https://supabase.com',
  image: 'https://api.iconify.design/logos:supabase-icon.svg',
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
    margin: 8
  },
  style: {
    borderRadius: '12px',
    background: '#000000'
  }
}

export const uiliciousPreset = {
  ...defaultPresetOptions,
  name: 'UIlicious Preset',
  data: 'https://uilicious.com/',
  image:
    'data:image/svg+xml;base64,PHN2ZyAKIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIgogd2lkdGg9IjE0NW1tIiBoZWlnaHQ9IjE1MG1tIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiAgZmlsbD0icmdiKDM3LCAzNywgMzcpIgogZD0iTTIwNi4wMDAsNDQzLjAwMCBMMjA2LjAwMCw1NjEuMDAwIEwwLjAwMCwzOTguMDAwIEwwLjAwMCwyODAuMDAwIEwyMDYuMDAwLDQ0My4wMDAgWiIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiICBmaWxsPSJyZ2IoMTcsIDE3LCAxNykiCiBkPSJNNTQ1LjAwMCwyMzYuMDAwIEwyMDYuMDAwLDU2MS4wMDAgTDIwNi4wMDAsNDQzLjAwMCBMNTQ1LjAwMCwxMTguMDAwIEw1NDUuMDAwLDIzNi4wMDAgWiIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiICBmaWxsPSJyZ2IoMCwgMTY2LCA4MSkiCiBkPSJNMjA2LjAwMCwzMjYuMDAwIEwyMDYuMDAwLDQ0NC4wMDAgTDAuMDAwLDI4MS4wMDAgTDAuMDAwLDE2My4wMDAgTDIwNi4wMDAsMzI2LjAwMCBaIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgIGZpbGw9InJnYigxNiwgMTM5LCA3NikiCiBkPSJNNTQ1LjAwMCwxMTkuMDAwIEwyMDYuMDAwLDQ0NC4wMDAgTDIwNi4wMDAsMzI2LjAwMCBMNTQ1LjAwMCwxLjAwMCBMNTQ1LjAwMCwxMTkuMDAwIFoiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiAgZmlsbD0icmdiKDEzOCwgMjEzLCAxNjUpIgogZD0iTTU0Ni4wMDAsMC4wMDAgTDIwNi4wMDAsMzI3LjAwMCBMMC4wMDAsMTYzLjAwMCBMNTQ2LjAwMCwwLjAwMCBaIi8+Cjwvc3ZnPg==',
  dotsOptions: {
    color: '#0f8b4c',
    type: 'extra-rounded'
  },
  cornersSquareOptions: {
    color: '#0f8b4c',
    type: 'extra-rounded'
  },
  cornersDotOptions: {
    color: '#111111',
    type: 'square'
  },
  imageOptions: {
    margin: 0
  },
  style: {
    borderRadius: '24px',
    background: '#ffffff'
  }
}

export const allPresets = [
  defaultPreset,
  padletPreset,
  supabasePreset,
  vercelLightPreset,
  vercelDarkPreset,
  uiliciousPreset,
  presetBlue,
  presetRed,
  presetGreen
]
