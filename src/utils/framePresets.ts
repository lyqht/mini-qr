export interface FrameStyle {
  textColor: string
  backgroundColor: string
  borderColor: string
  borderWidth: string
  borderRadius: string
  padding: string
  fontFamily?: string
}

export interface FontOption {
  label: string
  value: string
  googleFontName?: string
}

/**
 * Curated font list: system/web-safe fonts (no loading) + top Google Fonts by popularity.
 * Sources: Google Fonts popularity rankings, web typography best practices.
 */
export const FONT_OPTIONS: FontOption[] = [
  { label: 'Default', value: '' },
  // Web-safe fonts — no external loading needed
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Courier New', value: "'Courier New', monospace" },
  { label: 'Times New Roman', value: "'Times New Roman', serif" },
  // Google Fonts — loaded dynamically on selection
  { label: 'Roboto', value: "'Roboto', sans-serif", googleFontName: 'Roboto' },
  { label: 'Open Sans', value: "'Open Sans', sans-serif", googleFontName: 'Open+Sans' },
  { label: 'Lato', value: "'Lato', sans-serif", googleFontName: 'Lato' },
  { label: 'Montserrat', value: "'Montserrat', sans-serif", googleFontName: 'Montserrat' },
  { label: 'Poppins', value: "'Poppins', sans-serif", googleFontName: 'Poppins' },
  { label: 'Oswald', value: "'Oswald', sans-serif", googleFontName: 'Oswald' },
  { label: 'Raleway', value: "'Raleway', sans-serif", googleFontName: 'Raleway' },
  { label: 'Nunito', value: "'Nunito', sans-serif", googleFontName: 'Nunito' },
  {
    label: 'Playfair Display',
    value: "'Playfair Display', serif",
    googleFontName: 'Playfair+Display'
  },
  { label: 'Pacifico', value: "'Pacifico', cursive", googleFontName: 'Pacifico' }
]

export function loadGoogleFont(fontName: string): void {
  const id = `gfont-${fontName}`
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.crossOrigin = 'anonymous'
  link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;600&display=swap`
  document.head.appendChild(link)
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
    isValidCSSLength(s.padding) &&
    (s.fontFamily === undefined || typeof s.fontFamily === 'string')
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
