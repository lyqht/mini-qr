import type { GradientConfig, ResolvedQRCodeConfig } from '../types'
import { buildMatrix } from '../matrix'
import { buildDotsPath } from './dots'
import { buildCornerDotsPath, buildCornerSquaresPath } from './corners'
import { computeImagePlacement } from './image'

export interface RenderedQR {
  svg: string
  width: number
  height: number
  matrixCount: number
}

const SVG_NS = 'http://www.w3.org/2000/svg'
const XLINK_NS = 'http://www.w3.org/1999/xlink'

let gradientCounter = 0
function nextGradientId(prefix: string): string {
  gradientCounter = (gradientCounter + 1) % Number.MAX_SAFE_INTEGER
  return `${prefix}-${gradientCounter}`
}

/**
 * Build the QR portion of an SVG (matrix + corners + logo) at viewBox
 * `0 0 size size`. Returned as a fragment string so the caller can either
 * wrap it in a frame or emit as a standalone SVG.
 */
export function renderQrFragment(config: ResolvedQRCodeConfig): {
  fragment: string
  size: number
  matrixCount: number
} {
  const { matrix, count } = buildMatrix(config.data, config.errorCorrectionLevel)
  const totalModules = count + 2 * config.margin
  const moduleSize = config.size / totalModules
  const offset = config.margin * moduleSize

  const parts: string[] = []
  const defs: string[] = []

  const bgFill = resolveFill(config.background.color, config.background.gradient, 'qr-bg-grad', defs)
  if (bgFill.shouldEmit) {
    parts.push(
      `<rect class="qr-bg" x="0" y="0" width="${config.size}" height="${config.size}" fill="${bgFill.attr}"/>`
    )
  }

  const placement = config.image
    ? computeImagePlacement({
        image: config.image,
        count,
        moduleSize,
        offset,
        totalSize: config.size,
        errorCorrectionLevel: config.errorCorrectionLevel
      })
    : undefined

  const dotsPath = buildDotsPath({
    matrix,
    count,
    moduleSize,
    offset,
    shape: config.dots.shape,
    hideCell: placement?.hidesCell
  })
  if (dotsPath) {
    const fill = resolveFill(config.dots.color, config.dots.gradient, 'qr-dots-grad', defs)
    parts.push(
      `<path class="qr-dots" fill-rule="evenodd" fill="${fill.attr}" d="${dotsPath}"/>`
    )
  }

  const cornerSquaresPath = buildCornerSquaresPath({
    count,
    moduleSize,
    offset,
    shape: config.cornerSquares.shape
  })
  if (cornerSquaresPath) {
    const fill = resolveFill(
      config.cornerSquares.color,
      config.cornerSquares.gradient,
      'qr-corner-square-grad',
      defs
    )
    parts.push(
      `<path class="qr-corner-square" fill-rule="evenodd" fill="${fill.attr}" d="${cornerSquaresPath}"/>`
    )
  }

  const cornerDotsPath = buildCornerDotsPath({
    count,
    moduleSize,
    offset,
    shape: config.cornerDots.shape
  })
  if (cornerDotsPath) {
    const fill = resolveFill(
      config.cornerDots.color,
      config.cornerDots.gradient,
      'qr-corner-dot-grad',
      defs
    )
    parts.push(
      `<path class="qr-corner-dot" fill="${fill.attr}" d="${cornerDotsPath}"/>`
    )
  }

  if (placement && config.image) {
    const innerSize = placement.size - 2 * placement.margin
    const innerX = placement.x + placement.margin
    const innerY = placement.y + placement.margin
    if (innerSize > 0) {
      const crossOrigin = config.image.crossOrigin
        ? ` crossorigin="${config.image.crossOrigin}"`
        : ''
      parts.push(
        `<image class="qr-logo" href="${escapeAttr(config.image.href)}" xlink:href="${escapeAttr(
          config.image.href
        )}" x="${innerX}" y="${innerY}" width="${innerSize}" height="${innerSize}" preserveAspectRatio="xMidYMid meet"${crossOrigin}/>`
      )
    }
  }

  const defsBlock = defs.length ? `<defs>${defs.join('')}</defs>` : ''
  return { fragment: defsBlock + parts.join(''), size: config.size, matrixCount: count }
}

/**
 * Compose the QR fragment into a complete `<svg>` document. No frame applied.
 */
export function wrapAsSvg(fragment: string, width: number, height: number): string {
  return (
    `<svg xmlns="${SVG_NS}" xmlns:xlink="${XLINK_NS}" viewBox="0 0 ${width} ${height}" ` +
    `width="${width}" height="${height}">${fragment}</svg>`
  )
}

export function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function escapeText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

interface ResolvedFill {
  attr: string
  shouldEmit: boolean
}

function resolveFill(
  color: string | undefined,
  gradient: GradientConfig | undefined,
  idPrefix: string,
  defs: string[]
): ResolvedFill {
  if (gradient && gradient.colorStops.length > 0) {
    const id = nextGradientId(idPrefix)
    defs.push(buildGradientDef(id, gradient))
    return { attr: `url(#${id})`, shouldEmit: true }
  }
  if (!color || color === 'transparent') {
    return { attr: 'none', shouldEmit: false }
  }
  return { attr: escapeAttr(color), shouldEmit: true }
}

function buildGradientDef(id: string, gradient: GradientConfig): string {
  const stops = gradient.colorStops
    .slice()
    .sort((a, b) => a.offset - b.offset)
    .map((s) => `<stop offset="${clamp01(s.offset)}" stop-color="${escapeAttr(s.color)}"/>`)
    .join('')

  if (gradient.type === 'radial') {
    return `<radialGradient id="${id}" cx="0.5" cy="0.5" r="0.5">${stops}</radialGradient>`
  }
  // Linear: rotate around the centre. Default vector is left → right (0 rad).
  const rotation = gradient.rotation ?? 0
  const { x1, y1, x2, y2 } = linearVector(rotation)
  return (
    `<linearGradient id="${id}" gradientUnits="objectBoundingBox" ` +
    `x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops}</linearGradient>`
  )
}

function linearVector(rotation: number): { x1: number; y1: number; x2: number; y2: number } {
  const cos = Math.cos(rotation)
  const sin = Math.sin(rotation)
  // Endpoints on the unit circle around (0.5, 0.5), then clamped to the bbox.
  return {
    x1: round(0.5 - cos * 0.5),
    y1: round(0.5 - sin * 0.5),
    x2: round(0.5 + cos * 0.5),
    y2: round(0.5 + sin * 0.5)
  }
}

function round(n: number): number {
  return Math.round(n * 10000) / 10000
}

function clamp01(v: number): number {
  if (Number.isNaN(v)) return 0
  if (v < 0) return 0
  if (v > 1) return 1
  return v
}
