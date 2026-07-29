const HEX_COLOR_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

export const MIN_QR_CONTRAST_RATIO = 3

export function hexToRgb(hex: string | undefined): { r: number; g: number; b: number } | null {
  if (!hex || !HEX_COLOR_PATTERN.test(hex)) {
    return null
  }

  let normalized = hex.slice(1)
  if (normalized.length === 3) {
    normalized = normalized
      .split('')
      .map((char) => char + char)
      .join('')
  }

  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16)
  }
}

function toLinearChannel(channel: number): number {
  const normalized = channel / 255
  return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4)
}

export function relativeLuminance(hex: string | undefined): number | null {
  const rgb = hexToRgb(hex)
  if (!rgb) {
    return null
  }

  const r = toLinearChannel(rgb.r)
  const g = toLinearChannel(rgb.g)
  const b = toLinearChannel(rgb.b)

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(
  colorA: string | undefined,
  colorB: string | undefined
): number | null {
  const luminanceA = relativeLuminance(colorA)
  const luminanceB = relativeLuminance(colorB)
  if (luminanceA === null || luminanceB === null) {
    return null
  }

  const lighter = Math.max(luminanceA, luminanceB)
  const darker = Math.min(luminanceA, luminanceB)

  return (lighter + 0.05) / (darker + 0.05)
}

function hslLightnessAndSaturation(hex: string | undefined): { l: number; s: number } | null {
  const rgb = hexToRgb(hex)
  if (!rgb) {
    return null
  }

  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (max === min) {
    return { l, s: 0 }
  }

  const delta = max - min
  const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)

  return { l, s }
}

const NEAR_BLACK_LIGHTNESS = 0.3
const NEAR_WHITE_LIGHTNESS = 0.7
const NEAR_GRAYSCALE_SATURATION = 0.15

/**
 * ISO/IEC 18004 expects the foreground (ink) to be darker than the
 * background (paper). Readers aren't guaranteed to support the inverse,
 * but that risk is really only associated with a near-monochrome
 * white-on-black style swap — not with colorful/branded combinations
 * that merely happen to have a darker background than dots color.
 */
export function isNearWhiteOnBlackInversion(
  paperColor: string | undefined,
  inkColor: string | undefined
): boolean {
  const paper = hslLightnessAndSaturation(paperColor)
  const ink = hslLightnessAndSaturation(inkColor)
  if (!paper || !ink) {
    return false
  }

  return (
    paper.l <= NEAR_BLACK_LIGHTNESS &&
    paper.s <= NEAR_GRAYSCALE_SATURATION &&
    ink.l >= NEAR_WHITE_LIGHTNESS &&
    ink.s <= NEAR_GRAYSCALE_SATURATION
  )
}

export function hasInsufficientContrast(
  colorA: string | undefined,
  colorB: string | undefined
): boolean {
  const ratio = contrastRatio(colorA, colorB)
  return ratio !== null && ratio < MIN_QR_CONTRAST_RATIO
}

/**
 * Self-hosted/Docker deployments default this warning off (see the Dockerfile's
 * VITE_DISABLE_COLOR_CONTRAST_WARNING build arg) since they're more likely to be
 * fixed kiosk-style setups where nobody is around to dismiss a warning.
 */
export function isColorContrastWarningEnabled(): boolean {
  return import.meta.env?.VITE_DISABLE_COLOR_CONTRAST_WARNING !== 'true'
}
