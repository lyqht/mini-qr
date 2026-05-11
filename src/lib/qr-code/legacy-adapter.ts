import type { CornerDotType, CornerSquareType, DotType, Options } from './legacy-types'
import type { CornerDotShape, CornerSquareShape, DotShape, ECLevel, QRCodeConfig } from './types'

const DOT_SHAPE_FALLBACK: DotShape = 'square'
const CORNER_SQUARE_FALLBACK: CornerSquareShape = 'extra-rounded'
const CORNER_DOT_FALLBACK: CornerDotShape = 'square'

const DOT_SHAPES = new Set<DotShape>([
  'square',
  'rounded',
  'extra-rounded',
  'classy',
  'classy-rounded',
  'dots'
])

const CORNER_SQUARE_SHAPES = new Set<CornerSquareShape>([
  'square',
  'rounded',
  'extra-rounded',
  'dot'
])
const CORNER_DOT_SHAPES = new Set<CornerDotShape>(['square', 'rounded', 'dot'])

function clampDotShape(value: DotType | undefined): DotShape {
  if (!value) return DOT_SHAPE_FALLBACK
  return DOT_SHAPES.has(value as DotShape) ? (value as DotShape) : DOT_SHAPE_FALLBACK
}

function clampCornerSquareShape(value: CornerSquareType | undefined): CornerSquareShape {
  if (!value) return CORNER_SQUARE_FALLBACK
  return CORNER_SQUARE_SHAPES.has(value as CornerSquareShape)
    ? (value as CornerSquareShape)
    : CORNER_SQUARE_FALLBACK
}

function clampCornerDotShape(value: CornerDotType | undefined): CornerDotShape {
  if (!value) return CORNER_DOT_FALLBACK
  return CORNER_DOT_SHAPES.has(value as CornerDotShape)
    ? (value as CornerDotShape)
    : CORNER_DOT_FALLBACK
}

/**
 * Translate the `qr-code-styling`-shaped Options used by mini-qr's UI into a
 * QRCodeConfig the new lib understands. Square-only in v1: if width != height,
 * we take the smaller and warn so a developer notices.
 *
 * @param legacy options shape used by StyledQRCode.vue, presets, and storage
 */
export function fromLegacyOptions(legacy: Options): QRCodeConfig {
  const width = legacy.width
  const height = legacy.height
  let size: number | undefined
  if (typeof width === 'number' && typeof height === 'number') {
    size = Math.min(width, height)
    if (width !== height && typeof console !== 'undefined') {
      console.warn(
        `[mini-qr] non-square width=${width} height=${height} requested; rendering as ${size}x${size}`
      )
    }
  } else if (typeof width === 'number') {
    size = width
  } else if (typeof height === 'number') {
    size = height
  }

  const ec = legacy.qrOptions?.errorCorrectionLevel as ECLevel | undefined

  return {
    data: legacy.data ?? '',
    size,
    margin: legacy.margin,
    errorCorrectionLevel: ec,
    dots: legacy.dotsOptions
      ? {
          shape: clampDotShape(legacy.dotsOptions.type),
          color: legacy.dotsOptions.color
        }
      : undefined,
    cornerSquares: legacy.cornersSquareOptions
      ? {
          shape: clampCornerSquareShape(legacy.cornersSquareOptions.type),
          color: legacy.cornersSquareOptions.color
        }
      : undefined,
    cornerDots: legacy.cornersDotOptions
      ? {
          shape: clampCornerDotShape(legacy.cornersDotOptions.type),
          color: legacy.cornersDotOptions.color
        }
      : undefined,
    background: legacy.backgroundOptions ? { color: legacy.backgroundOptions.color } : undefined,
    image: legacy.image
      ? {
          href: legacy.image,
          sizeRatio: legacy.imageOptions?.imageSize ?? 0.4,
          margin: legacy.imageOptions?.margin,
          hideBackgroundDots: legacy.imageOptions?.hideBackgroundDots ?? true,
          crossOrigin: normalizeCrossOrigin(legacy.imageOptions?.crossOrigin)
        }
      : undefined
  }
}

function normalizeCrossOrigin(v: string | undefined): 'anonymous' | 'use-credentials' | undefined {
  if (v === 'anonymous' || v === 'use-credentials') return v
  return undefined
}
