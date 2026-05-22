import { escapeAttr, escapeText, renderQrFragment, wrapAsSvg } from './render/svg'
import type { FrameConfig, ResolvedQRCodeConfig } from './types'

const DEFAULT_FRAME: Required<Omit<FrameConfig, 'text' | 'textPosition'>> = {
  textColor: '#000000',
  backgroundColor: '#ffffff',
  borderColor: '#000000',
  borderWidth: 2,
  borderRadius: 8,
  padding: 12,
  fontFamily: 'sans-serif',
  fontSize: 18
}

export interface FramedSvg {
  svg: string
  width: number
  height: number
  matrixCount: number
}

/**
 * Compose a frame (border + caption) around the QR fragment. Output is a
 * single SVG element so SVG-to-canvas rasterisation stays flat and
 * cross-browser safe.
 */
export function renderFramed(config: ResolvedQRCodeConfig): FramedSvg {
  const { fragment, size, matrixCount } = renderQrFragment(config)
  if (!config.frame) {
    return { svg: wrapAsSvg(fragment, size, size), width: size, height: size, matrixCount }
  }

  const f: Required<FrameConfig> = { ...DEFAULT_FRAME, ...config.frame }
  const lines = f.text.split('\n')
  const lineHeight = f.fontSize * 1.2
  const textBlockHeight = lineHeight * lines.length
  const widestLine = approxTextWidth(lines, f.fontSize)
  const textBlockWidth = Math.max(widestLine, f.fontSize)

  const padding = f.padding
  /**
   * Border sits OUTSIDE the QR + padding box — matches the CSS preview
   * (QRCodeFrame.vue) where the border element wraps a content box that
   * already includes the QR and padding. Without including borderWidth in
   * the outer dimensions and offsetting the QR by borderWidth, a thick
   * border with padding=0 would be painted in the same pixels the QR
   * occupies, leaving only the side opposite the caption visible.
   */
  const bw = f.borderWidth
  let outerW: number
  let outerH: number
  let qrX: number
  let qrY: number
  let textX: number
  let textY: number
  let textAnchor: 'start' | 'middle' | 'end'

  switch (f.textPosition) {
    case 'top':
      outerW = size + 2 * padding + 2 * bw
      outerH = size + textBlockHeight + 3 * padding + 2 * bw
      qrX = padding + bw
      qrY = textBlockHeight + 2 * padding + bw
      textX = outerW / 2
      textY = padding + bw + f.fontSize
      textAnchor = 'middle'
      break
    case 'bottom':
      outerW = size + 2 * padding + 2 * bw
      outerH = size + textBlockHeight + 3 * padding + 2 * bw
      qrX = padding + bw
      qrY = padding + bw
      textX = outerW / 2
      textY = size + 2 * padding + bw + f.fontSize
      textAnchor = 'middle'
      break
    case 'left':
      outerW = size + textBlockWidth + 3 * padding + 2 * bw
      outerH = size + 2 * padding + 2 * bw
      qrX = textBlockWidth + 2 * padding + bw
      qrY = padding + bw
      textX = padding + bw + textBlockWidth / 2
      textY = (outerH - textBlockHeight) / 2 + f.fontSize
      textAnchor = 'middle'
      break
    case 'right':
      outerW = size + textBlockWidth + 3 * padding + 2 * bw
      outerH = size + 2 * padding + 2 * bw
      qrX = padding + bw
      qrY = padding + bw
      textX = size + 2 * padding + bw + textBlockWidth / 2
      textY = (outerH - textBlockHeight) / 2 + f.fontSize
      textAnchor = 'middle'
      break
  }

  const halfBorder = f.borderWidth / 2
  const borderRect =
    `<rect x="${halfBorder}" y="${halfBorder}" width="${outerW - f.borderWidth}" ` +
    `height="${outerH - f.borderWidth}" rx="${f.borderRadius}" ry="${f.borderRadius}" ` +
    `fill="${escapeAttr(f.backgroundColor)}" stroke="${escapeAttr(f.borderColor)}" ` +
    `stroke-width="${f.borderWidth}"/>`

  const textNode =
    `<text x="${textX}" y="${textY}" font-family="${escapeAttr(f.fontFamily)}" ` +
    `font-size="${f.fontSize}" fill="${escapeAttr(f.textColor)}" text-anchor="${textAnchor}">` +
    lines
      .map(
        (line, i) =>
          `<tspan x="${textX}" dy="${i === 0 ? 0 : lineHeight}">${escapeText(line)}</tspan>`
      )
      .join('') +
    `</text>`

  // Lift the <image> (centre logo) out of the QR group with its x/y rewritten
  // to absolute viewBox coordinates. Reason: the raster export path needs to
  // strip the <image> and draw it separately on canvas to bypass SVG-img
  // sandboxing of external resources; that's much simpler when the image's
  // coordinates are already absolute and don't require composing a parent
  // transform. Visually identical to the original — same final position,
  // same z-order (still drawn after the QR fragment).
  const { fragment: qrInnerFragment, image: liftedImage } = liftImage(fragment, qrX, qrY)
  const qrGroup = `<g transform="translate(${qrX}, ${qrY})">${qrInnerFragment}</g>`

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ` +
    `viewBox="0 0 ${outerW} ${outerH}" width="${outerW}" height="${outerH}">` +
    borderRect +
    qrGroup +
    liftedImage +
    textNode +
    `</svg>`

  return { svg, width: outerW, height: outerH, matrixCount }
}

function liftImage(fragment: string, dx: number, dy: number): { fragment: string; image: string } {
  const match = fragment.match(/<image\b[^>]*\/>/)
  if (!match) return { fragment, image: '' }
  const adjusted = match[0]
    .replace(/\bx="([\d.]+)"/, (_, v) => `x="${parseFloat(v) + dx}"`)
    .replace(/\by="([\d.]+)"/, (_, v) => `y="${parseFloat(v) + dy}"`)
  return {
    fragment: fragment.replace(match[0], ''),
    image: adjusted
  }
}

function approxTextWidth(lines: string[], fontSize: number): number {
  let widest = 0
  for (const line of lines) {
    // Rough heuristic: width = chars * 0.6 * fontSize. Fine for layout sizing;
    // the SVG renderer kerns the real glyphs at draw time.
    const w = line.length * fontSize * 0.6
    if (w > widest) widest = w
  }
  return widest
}
