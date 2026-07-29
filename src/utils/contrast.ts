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

/**
 * ISO/IEC 18004 expects the foreground (ink) to be darker than the
 * background (paper). Readers aren't guaranteed to support the inverse.
 */
export function isPaperDarkerThanInk(
  paperColor: string | undefined,
  inkColor: string | undefined
): boolean {
  const paperLuminance = relativeLuminance(paperColor)
  const inkLuminance = relativeLuminance(inkColor)
  if (paperLuminance === null || inkLuminance === null) {
    return false
  }

  return paperLuminance < inkLuminance
}

export function hasInsufficientContrast(
  colorA: string | undefined,
  colorB: string | undefined
): boolean {
  const ratio = contrastRatio(colorA, colorB)
  return ratio !== null && ratio < MIN_QR_CONTRAST_RATIO
}
