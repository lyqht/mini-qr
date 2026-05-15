import { renderFramed } from './frame'
import { rasterizeSvg } from './render/canvas'
import {
  DEFAULT_CONFIG,
  type QRCodeConfig,
  type QRCodeInstance,
  type RasterOptions,
  type ResolvedQRCodeConfig
} from './types'

function resolveConfig(config: QRCodeConfig): ResolvedQRCodeConfig {
  if (!config || typeof config.data !== 'string') {
    throw new Error('createQRCode requires { data: string }')
  }
  return {
    data: config.data,
    size: config.size ?? DEFAULT_CONFIG.size,
    margin: config.margin ?? DEFAULT_CONFIG.margin,
    errorCorrectionLevel: config.errorCorrectionLevel ?? DEFAULT_CONFIG.errorCorrectionLevel,
    dots: {
      shape: config.dots?.shape ?? DEFAULT_CONFIG.dots.shape,
      color: config.dots?.color ?? DEFAULT_CONFIG.dots.color
    },
    cornerSquares: {
      shape: config.cornerSquares?.shape ?? DEFAULT_CONFIG.cornerSquares.shape,
      color: config.cornerSquares?.color ?? DEFAULT_CONFIG.cornerSquares.color
    },
    cornerDots: {
      shape: config.cornerDots?.shape ?? DEFAULT_CONFIG.cornerDots.shape,
      color: config.cornerDots?.color ?? DEFAULT_CONFIG.cornerDots.color
    },
    background: { color: config.background?.color ?? DEFAULT_CONFIG.background.color },
    image: config.image,
    frame: config.frame
  }
}

function parseSvg(svg: string): SVGSVGElement {
  if (typeof DOMParser === 'undefined') {
    throw new Error('createQRCode requires a browser environment with DOMParser')
  }
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
  const root = doc.documentElement as unknown as SVGSVGElement
  if (root.nodeName !== 'svg') {
    throw new Error('Failed to parse generated SVG')
  }
  return root
}

export function createQRCode(config: QRCodeConfig): QRCodeInstance {
  let resolved = resolveConfig(config)
  let cached = renderFramed(resolved)
  let element: SVGSVGElement = parseSvg(cached.svg)

  const replaceElement = (next: SVGSVGElement) => {
    if (element.parentNode) {
      element.parentNode.replaceChild(next, element)
    }
    element = next
  }

  const render = () => {
    cached = renderFramed(resolved)
    replaceElement(parseSvg(cached.svg))
  }

  return {
    get svgElement() {
      return element
    },
    update(partial: Partial<QRCodeConfig>) {
      resolved = resolveConfig({ ...mergeConfig(resolved, partial) })
      render()
    },
    toSVGString() {
      return cached.svg
    },
    async toPNGBlob(opts: RasterOptions = {}) {
      return rasterizeSvg({
        svgString: cached.svg,
        width: opts.width ?? cached.width,
        height: opts.height ?? cached.height,
        mimeType: 'image/png',
        quality: opts.quality,
        background: opts.background,
        fontFamily: resolved.frame?.fontFamily
      })
    },
    async toJPGBlob(opts: RasterOptions = {}) {
      return rasterizeSvg({
        svgString: cached.svg,
        width: opts.width ?? cached.width,
        height: opts.height ?? cached.height,
        mimeType: 'image/jpeg',
        quality: opts.quality ?? 0.92,
        background: opts.background ?? '#ffffff',
        fontFamily: resolved.frame?.fontFamily
      })
    },
    attachTo(el: HTMLElement) {
      if (!el) return
      while (el.firstChild) el.removeChild(el.firstChild)
      el.appendChild(element)
    },
    dispose() {
      if (element.parentNode) element.parentNode.removeChild(element)
    }
  }
}

export function mergeConfig(
  current: ResolvedQRCodeConfig,
  partial: Partial<QRCodeConfig>
): QRCodeConfig {
  return {
    data: partial.data ?? current.data,
    size: partial.size ?? current.size,
    margin: partial.margin ?? current.margin,
    errorCorrectionLevel: partial.errorCorrectionLevel ?? current.errorCorrectionLevel,
    dots: partial.dots ? { ...current.dots, ...partial.dots } : current.dots,
    cornerSquares: partial.cornerSquares
      ? { ...current.cornerSquares, ...partial.cornerSquares }
      : current.cornerSquares,
    cornerDots: partial.cornerDots
      ? { ...current.cornerDots, ...partial.cornerDots }
      : current.cornerDots,
    background: partial.background
      ? { ...current.background, ...partial.background }
      : current.background,
    image: 'image' in partial ? (partial.image ?? undefined) : current.image,
    frame: 'frame' in partial ? (partial.frame ?? undefined) : current.frame
  }
}
