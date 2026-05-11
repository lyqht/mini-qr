import type { FrameConfig, ResolvedQRCodeConfig } from './types'
import { escapeAttr, escapeText, renderQrFragment, wrapAsSvg } from './render/svg'

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
  let outerW: number
  let outerH: number
  let qrX: number
  let qrY: number
  let textX: number
  let textY: number
  let textAnchor: 'start' | 'middle' | 'end'

  switch (f.textPosition) {
    case 'top':
      outerW = size + 2 * padding
      outerH = size + textBlockHeight + 3 * padding
      qrX = padding
      qrY = textBlockHeight + 2 * padding
      textX = outerW / 2
      textY = padding + f.fontSize
      textAnchor = 'middle'
      break
    case 'bottom':
      outerW = size + 2 * padding
      outerH = size + textBlockHeight + 3 * padding
      qrX = padding
      qrY = padding
      textX = outerW / 2
      textY = size + 2 * padding + f.fontSize
      textAnchor = 'middle'
      break
    case 'left':
      outerW = size + textBlockWidth + 3 * padding
      outerH = size + 2 * padding
      qrX = textBlockWidth + 2 * padding
      qrY = padding
      textX = padding + textBlockWidth / 2
      textY = (outerH - textBlockHeight) / 2 + f.fontSize
      textAnchor = 'middle'
      break
    case 'right':
      outerW = size + textBlockWidth + 3 * padding
      outerH = size + 2 * padding
      qrX = padding
      qrY = padding
      textX = size + 2 * padding + textBlockWidth / 2
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

  const qrGroup = `<g transform="translate(${qrX}, ${qrY})">${fragment}</g>`

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ` +
    `viewBox="0 0 ${outerW} ${outerH}" width="${outerW}" height="${outerH}">` +
    borderRect +
    qrGroup +
    textNode +
    `</svg>`

  return { svg, width: outerW, height: outerH, matrixCount }
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
