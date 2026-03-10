export interface FrameStyle {
  textColor: string
  backgroundColor: string
  borderColor: string
  borderWidth: string
  borderRadius: string
  padding: string
}

export interface FramePreset {
  name: string
  style: FrameStyle
  text?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export const plainFramePreset: FramePreset = {
  name: 'Default Frame',
  style: {
    textColor: '#000000',
    backgroundColor: '#ffffff',
    borderColor: '#000000',
    borderWidth: '1px',
    borderRadius: '8px',
    padding: '16px'
  }
}

export const darkFramePreset: FramePreset = {
  name: 'Dark Frame',
  style: {
    textColor: '#ffffff',
    backgroundColor: '#000000',
    borderColor: '#ffffff',
    borderWidth: '1px',
    borderRadius: '8px',
    padding: '16px'
  }
}

export const borderlessFramePreset: FramePreset = {
  name: 'Borderless Frame',
  style: {
    textColor: '#000000',
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
    borderWidth: '0px',
    borderRadius: '0px',
    padding: '16px'
  }
}

export const builtInFramePresets: FramePreset[] = [
  plainFramePreset,
  darkFramePreset,
  borderlessFramePreset
]

function parseFramePresetsFromEnv(envVal?: string): FramePreset[] | undefined {
  if (!envVal) return undefined
  try {
    return JSON.parse(envVal) as FramePreset[]
  } catch (err) {
    console.error('Failed to parse VITE_FRAME_PRESETS', err)
    return undefined
  }
}

const envFramePresets = parseFramePresetsFromEnv(import.meta.env.VITE_FRAME_PRESETS)
export const allFramePresets: FramePreset[] = envFramePresets ?? builtInFramePresets

export const defaultFramePreset: FramePreset =
  allFramePresets.find((p) => p.name === import.meta.env.VITE_FRAME_PRESET) ?? allFramePresets[0]

export const VALID_FRAME_POSITIONS = ['top', 'bottom', 'left', 'right'] as const

import { isValidCSSColor, isValidCSSLength } from './css'

export function isValidFrameStyle(value: unknown): value is FrameStyle {
  if (!value || typeof value !== 'object') return false
  const s = value as Record<string, unknown>
  return (
    typeof s.textColor === 'string' &&
    isValidCSSColor(s.textColor) &&
    typeof s.backgroundColor === 'string' &&
    isValidCSSColor(s.backgroundColor) &&
    typeof s.borderColor === 'string' &&
    isValidCSSColor(s.borderColor) &&
    typeof s.borderWidth === 'string' &&
    isValidCSSLength(s.borderWidth) &&
    typeof s.borderRadius === 'string' &&
    isValidCSSLength(s.borderRadius) &&
    typeof s.padding === 'string' &&
    isValidCSSLength(s.padding)
  )
}

export function isValidFrameConfig(value: unknown): value is FramePreset {
  if (!value || typeof value !== 'object') return false
  const f = value as Record<string, unknown>
  return (
    typeof f.text === 'string' &&
    VALID_FRAME_POSITIONS.includes(f.position as (typeof VALID_FRAME_POSITIONS)[number]) &&
    isValidFrameStyle(f.style)
  )
}
