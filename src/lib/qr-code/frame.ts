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
  fontSize: 18,
  captionWidth: 0 // 0 = auto: side caption column defaults to the QR size
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
  const isSide = f.textPosition === 'left' || f.textPosition === 'right'
  const captionWidth = f.captionWidth > 0 ? f.captionWidth : size
  // Wrap the caption the same way the preview (QRCodeFrame.vue) does: side
  // captions render in a fixed-width column (captionWidth px, defaulting to
  // the QR size), top/bottom captions wrap within the QR width. Without
  // wrapping, a long caption line inflates the frame far beyond the
  // preview's proportions.
  const wrapWidth = isSide ? captionWidth : size
  const lines = wrapLines(f.text, f.fontSize, wrapWidth)
  const lineHeight = f.fontSize * 1.2
  const textBlockHeight = lineHeight * lines.length
  const widestLine = approxTextWidth(lines, f.fontSize)
  const textBlockWidth = isSide ? wrapWidth : Math.max(widestLine, f.fontSize)

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

  // Side captions taller than the QR grow the frame (the preview's flexbox
  // does the same); the QR stays vertically centred. When the caption is
  // shorter than the QR this reduces to padding + bw, matching top/bottom.
  const sideOuterH = Math.max(size, textBlockHeight) + 2 * padding + 2 * bw
  const sideQrY = (sideOuterH - size) / 2

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
      outerH = sideOuterH
      qrX = textBlockWidth + 2 * padding + bw
      qrY = sideQrY
      textX = padding + bw + textBlockWidth / 2
      textY = (outerH - textBlockHeight) / 2 + f.fontSize
      textAnchor = 'middle'
      break
    case 'right':
      outerW = size + textBlockWidth + 3 * padding + 2 * bw
      outerH = sideOuterH
      qrX = padding + bw
      qrY = sideQrY
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

/**
 * Greedy word-wrap using the same char-width heuristic as approxTextWidth.
 * Explicit newlines are preserved (including blank lines); a single word
 * wider than the column gets its own line rather than being broken mid-word —
 * matching how the preview's CSS column treats unbreakable words.
 */
function wrapLines(text: string, fontSize: number, maxWidth: number): string[] {
  const charWidth = fontSize * 0.6
  const out: string[] = []
  for (const paragraph of text.split('\n')) {
    const words = paragraph.split(' ').filter((w) => w.length > 0)
    if (words.length === 0) {
      out.push('')
      continue
    }
    let line = ''
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word
      if (line && candidate.length * charWidth > maxWidth) {
        out.push(line)
        line = word
      } else {
        line = candidate
      }
    }
    out.push(line)
  }
  return out
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
