export interface FrameStyle {
  textColor: string
  backgroundColor: string
  borderColor: string
  borderWidth: string
  borderRadius: string
  padding: string
  fontFamily?: string
}

export type FontCategory = 'sans' | 'serif' | 'monospace' | 'display'

export interface FontOption {
  label: string
  value: string
  googleFontName?: string
  // Omitted on the "Default" entry; everything else is categorised so the UI
  // can render an <optgroup> per category.
  category?: FontCategory
}

/**
 * Curated font list: web-safe fonts (no loading) + top Google Fonts.
 *
 * Sources:
 *  - Google Fonts popularity rankings (sans/serif/display picks).
 *  - Programming-font catalogues + Wikipedia "Slashed zero" article
 *    (monospace picks — all have a slashed 0 to disambiguate from O,
 *    requested in lyqht/mini-qr#203 for WiFi-password QR codes).
 */
export const FONT_OPTIONS: FontOption[] = [
  { label: 'Default', value: '' },
  // Sans-serif
  { label: 'Arial', value: 'Arial, sans-serif', category: 'sans' },
  { label: 'Verdana', value: 'Verdana, sans-serif', category: 'sans' },
  { label: 'Roboto', value: "'Roboto', sans-serif", googleFontName: 'Roboto', category: 'sans' },
  { label: 'Inter', value: "'Inter', sans-serif", googleFontName: 'Inter', category: 'sans' },
  {
    label: 'Open Sans',
    value: "'Open Sans', sans-serif",
    googleFontName: 'Open+Sans',
    category: 'sans'
  },
  { label: 'Lato', value: "'Lato', sans-serif", googleFontName: 'Lato', category: 'sans' },
  {
    label: 'Montserrat',
    value: "'Montserrat', sans-serif",
    googleFontName: 'Montserrat',
    category: 'sans'
  },
  {
    label: 'Poppins',
    value: "'Poppins', sans-serif",
    googleFontName: 'Poppins',
    category: 'sans'
  },
  { label: 'Oswald', value: "'Oswald', sans-serif", googleFontName: 'Oswald', category: 'sans' },
  {
    label: 'Raleway',
    value: "'Raleway', sans-serif",
    googleFontName: 'Raleway',
    category: 'sans'
  },
  { label: 'Nunito', value: "'Nunito', sans-serif", googleFontName: 'Nunito', category: 'sans' },
  // Serif
  { label: 'Georgia', value: 'Georgia, serif', category: 'serif' },
  { label: 'Times New Roman', value: "'Times New Roman', serif", category: 'serif' },
  {
    label: 'Playfair Display',
    value: "'Playfair Display', serif",
    googleFontName: 'Playfair+Display',
    category: 'serif'
  },
  {
    label: 'Merriweather',
    value: "'Merriweather', serif",
    googleFontName: 'Merriweather',
    category: 'serif'
  },
  // Monospace — all Google entries below have a slashed 0
  { label: 'Courier New', value: "'Courier New', monospace", category: 'monospace' },
  {
    label: 'JetBrains Mono',
    value: "'JetBrains Mono', monospace",
    googleFontName: 'JetBrains+Mono',
    category: 'monospace'
  },
  {
    label: 'Fira Code',
    value: "'Fira Code', monospace",
    googleFontName: 'Fira+Code',
    category: 'monospace'
  },
  {
    label: 'Source Code Pro',
    value: "'Source Code Pro', monospace",
    googleFontName: 'Source+Code+Pro',
    category: 'monospace'
  },
  {
    label: 'IBM Plex Mono',
    value: "'IBM Plex Mono', monospace",
    googleFontName: 'IBM+Plex+Mono',
    category: 'monospace'
  },
  {
    label: 'Inconsolata',
    value: "'Inconsolata', monospace",
    googleFontName: 'Inconsolata',
    category: 'monospace'
  },
  // Display & cursive
  {
    label: 'Pacifico',
    value: "'Pacifico', cursive",
    googleFontName: 'Pacifico',
    category: 'display'
  },
  {
    label: 'Bebas Neue',
    value: "'Bebas Neue', sans-serif",
    googleFontName: 'Bebas+Neue',
    category: 'display'
  }
]

export function loadGoogleFont(fontName: string): Promise<void> {
  const id = `gfont-${fontName}`
  if (!document.getElementById(id)) {
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.crossOrigin = 'anonymous'
    link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;600&display=swap`
    document.head.appendChild(link)
  }
  // Wait for the font to be available for rendering
  const displayName = fontName.replace(/\+/g, ' ')
  return document.fonts.load(`400 1em "${displayName}"`).then(() => {})
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
