import { fromLegacyOptions } from './legacy-adapter'
import { renderFramed } from './frame'
import { renderQrFragment, escapeAttr } from './render/svg'
import type { Options as LegacyOptions } from './legacy-types'
import type { FrameConfig, QRCodeConfig, ResolvedQRCodeConfig, TextPosition } from './types'
import { DEFAULT_CONFIG } from './types'

function resolve(config: QRCodeConfig): ResolvedQRCodeConfig {
  return {
    data: config.data,
    size: config.size ?? DEFAULT_CONFIG.size,
    margin: config.margin ?? DEFAULT_CONFIG.margin,
    errorCorrectionLevel: config.errorCorrectionLevel ?? DEFAULT_CONFIG.errorCorrectionLevel,
    dots: { ...DEFAULT_CONFIG.dots, ...config.dots },
    cornerSquares: { ...DEFAULT_CONFIG.cornerSquares, ...config.cornerSquares },
    cornerDots: { ...DEFAULT_CONFIG.cornerDots, ...config.cornerDots },
    background: { ...DEFAULT_CONFIG.background, ...config.background },
    image: config.image,
    frame: config.frame
  }
}

export interface LegacyFrameStyle {
  textColor?: string
  backgroundColor?: string
  borderColor?: string
  borderWidth?: string
  borderRadius?: string
  padding?: string
  fontFamily?: string
  backgroundImage?: string
}

export interface LegacyFrameInput {
  text: string
  position: TextPosition
  style: LegacyFrameStyle
  /** Side captions only: caption column width in px (0/absent = QR size). */
  captionWidth?: number
}

export interface SvgExportInput {
  options: LegacyOptions
  frame?: LegacyFrameInput | null
  /** Container background (preset.style.background) — only applies when no frame. */
  outerBackground?: string
  /** Outer container rounded corners as a CSS pixel string (e.g., "24px"). */
  borderRadius?: string
  /** Target export size — picks the smaller of width/height (square-only in v1). */
  size?: { width: number; height: number }
}

/**
 * Build a standalone SVG string ready for download. Pure DOM-free transform
 * over the QR options + Vue-side frame/background state. Replaces the older
 * dom-to-svg snapshot pipeline.
 */
export function buildSvgExportString(input: SvgExportInput): string {
  const baseConfig = fromLegacyOptions(input.options)
  const config: QRCodeConfig = {
    ...baseConfig,
    frame: input.frame ? toFrameConfig(input.frame) : undefined
  }
  if (input.size) {
    config.size = Math.min(input.size.width, input.size.height)
  }

  // Apply the preset's container background to the QR itself. The preview
  // (QRCodeCreate.vue) renders the QR inside a div that carries this
  // background even when a frame wraps it — without doing the same here, a
  // dark frame on a transparent-default QR makes black dots/corners
  // disappear against the frame backdrop.
  if (input.outerBackground) {
    config.background = { ...config.background, color: input.outerBackground }
  }

  const resolved = resolve(config)

  if (resolved.frame) {
    const { svg } = renderFramed(resolved)
    return svg
  }

  // No-frame path — render the QR portion and wrap in our own outer <svg> so
  // we can apply rounded corners via a clipPath without the lib's frame chrome.
  const size = resolved.size
  const radius = parsePxLength(input.borderRadius)
  const bgColor = input.outerBackground ?? resolved.background.color
  return renderStandalone(resolved, size, radius, bgColor)
}

function renderStandalone(
  config: ResolvedQRCodeConfig,
  size: number,
  radius: number,
  bgColor: string | undefined
): string {
  // Strip background from the fragment so the outer rounded rect owns it; this
  // prevents a square corner from peeking past the clipPath in some viewers.
  const fragmentConfig: ResolvedQRCodeConfig = {
    ...config,
    size,
    background: { color: 'transparent' }
  }
  const { fragment } = renderQrFragment(fragmentConfig)

  const clipId = 'qr-export-clip'
  const usesClip = radius > 0
  const bgRect =
    bgColor && bgColor !== 'transparent'
      ? `<rect x="0" y="0" width="${size}" height="${size}" fill="${escapeAttr(bgColor)}"/>`
      : ''
  const defs = usesClip
    ? `<defs><clipPath id="${clipId}"><rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}"/></clipPath></defs>`
    : ''
  const openGroup = usesClip ? `<g clip-path="url(#${clipId})">` : ''
  const closeGroup = usesClip ? '</g>' : ''

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ` +
    `viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">` +
    defs +
    openGroup +
    bgRect +
    fragment +
    closeGroup +
    `</svg>`
  )
}

function toFrameConfig(input: LegacyFrameInput): FrameConfig {
  const s = input.style
  // Build piecewise so undefined keys are absent (not present-with-undefined).
  // The frame renderer spreads defaults under config; setting fontFamily etc.
  // to undefined would otherwise replace the defaults with `undefined` and
  // break downstream escapeAttr calls.
  const out: FrameConfig = {
    text: input.text,
    textPosition: input.position
  }
  if (s.textColor) out.textColor = s.textColor
  if (s.backgroundColor) out.backgroundColor = s.backgroundColor
  if (s.borderColor) out.borderColor = s.borderColor
  if (s.borderWidth) out.borderWidth = parsePxLength(s.borderWidth)
  if (s.borderRadius) out.borderRadius = parsePxLength(s.borderRadius)
  if (s.padding) out.padding = parsePxLength(s.padding)
  if (s.fontFamily) out.fontFamily = s.fontFamily
  if (s.backgroundImage) out.backgroundImage = s.backgroundImage
  if (input.captionWidth && input.captionWidth > 0) {
    out.captionWidth = input.captionWidth
  }
  return out
}

function parsePxLength(value: string | undefined): number {
  if (!value) return 0
  const match = /([-\d.]+)/.exec(value)
  return match ? Number(match[1]) || 0 : 0
}
