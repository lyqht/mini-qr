import { describe, expect, it } from 'vitest'
import { renderFramed } from './frame'
import { DEFAULT_CONFIG, type ResolvedQRCodeConfig, type TextPosition } from './types'

function baseConfig(textPosition: TextPosition): ResolvedQRCodeConfig {
  return {
    data: 'https://example.com',
    size: 200,
    margin: 0,
    errorCorrectionLevel: 'Q',
    dots: { ...DEFAULT_CONFIG.dots },
    cornerSquares: { ...DEFAULT_CONFIG.cornerSquares },
    cornerDots: { ...DEFAULT_CONFIG.cornerDots },
    background: { ...DEFAULT_CONFIG.background },
    frame: { text: 'Scan me', textPosition }
  }
}

describe('renderFramed', () => {
  it('emits no frame chrome when frame is absent', () => {
    const { svg, width, height } = renderFramed({
      ...baseConfig('bottom'),
      frame: undefined
    })
    expect(width).toBe(200)
    expect(height).toBe(200)
    expect(svg).not.toContain('<text')
  })

  it('places the caption with text content preserved (UTF-8 safe)', () => {
    const utf8 = 'Xin chào — 你好 — 👋'
    const { svg } = renderFramed({
      ...baseConfig('bottom'),
      frame: { text: utf8, textPosition: 'bottom' }
    })
    expect(svg).toContain(utf8)
  })

  it.each(['top', 'bottom', 'left', 'right'] as const)(
    'composes a translated <g> for textPosition=%s',
    (position) => {
      const { svg } = renderFramed(baseConfig(position))
      expect(svg).toMatch(/<g transform="translate\([0-9.]+, [0-9.]+\)">/)
      expect(svg).toContain('<text')
      expect(svg).toContain('Scan me')
    }
  )

  it('grows outer dimensions when a frame is present', () => {
    const { width, height } = renderFramed(baseConfig('bottom'))
    expect(width).toBeGreaterThanOrEqual(200)
    expect(height).toBeGreaterThan(200) // caption pushes height
  })

  it('escapes special characters in caption text', () => {
    const { svg } = renderFramed({
      ...baseConfig('bottom'),
      frame: { text: '<not-a-tag>', textPosition: 'bottom' }
    })
    expect(svg).not.toContain('<not-a-tag>')
    expect(svg).toContain('&lt;not-a-tag&gt;')
  })

  it.each(['top', 'bottom', 'left', 'right'] as const)(
    'reserves border width on every side for textPosition=%s',
    (position) => {
      const { svg, width, height } = renderFramed({
        ...baseConfig(position),
        frame: {
          text: 'SCAN ME',
          textPosition: position,
          borderWidth: 20,
          padding: 0
        }
      })
      // QR translate offset must be at least borderWidth on the QR-side axes.
      const m = /<g transform="translate\(([0-9.]+), ([0-9.]+)\)">/.exec(svg)
      expect(m).not.toBeNull()
      const tx = Number(m![1])
      const ty = Number(m![2])
      if (position === 'top') {
        // QR is below caption; top inset is caption + bw, left inset is bw
        expect(tx).toBeGreaterThanOrEqual(20)
      } else if (position === 'bottom') {
        expect(tx).toBeGreaterThanOrEqual(20)
        expect(ty).toBeGreaterThanOrEqual(20)
      } else if (position === 'left') {
        expect(ty).toBeGreaterThanOrEqual(20)
      } else {
        // right: QR sits on the left, caption on the right
        expect(tx).toBeGreaterThanOrEqual(20)
        expect(ty).toBeGreaterThanOrEqual(20)
      }
      // Outer canvas grew to accommodate borders on both perpendicular sides.
      if (position === 'top' || position === 'bottom') {
        expect(width).toBeGreaterThanOrEqual(200 + 40)
      } else {
        expect(height).toBeGreaterThanOrEqual(200 + 40)
      }
    }
  )
})

describe('caption wrapping', () => {
  // Mirrors the preview (QRCodeFrame.vue): side captions render in a fixed
  // column (captionWidth px, defaulting to the QR size), top/bottom captions
  // wrap within the QR width. Default frame padding is 12, border width 2 (the
  // border is reserved on every side, hence the +4 in exact-width asserts).
  const LONG = 'The quick brown fox jumps over the lazy dog and keeps on running far away'

  function framed(position: TextPosition, text: string, captionWidth?: number) {
    return renderFramed({
      ...baseConfig(position),
      frame: { text, textPosition: position, captionWidth }
    })
  }

  function tspanCount(svg: string): number {
    return (svg.match(/<tspan/g) || []).length
  }

  it('wraps a long side caption into the column instead of growing the frame width', () => {
    const { svg, width } = framed('right', LONG)
    // default column = QR size: outerW = size + 200 + 3 × padding + 2 × bw
    expect(width).toBe(440)
    expect(tspanCount(svg)).toBeGreaterThan(1)
  })

  it('sizes the side caption column by captionWidth (px)', () => {
    const { width } = framed('right', LONG, 300)
    // outerW = 200 + 300 + 36 + 4
    expect(width).toBe(540)
  })

  it('grows the frame height when a wrapped side caption is taller than the QR', () => {
    const tall = 'word '.repeat(60).trim()
    const { height } = framed('right', tall, 100)
    expect(height).toBeGreaterThan(200 + 24 + 4)
  })

  it('wraps top/bottom captions within the QR width without widening the frame', () => {
    const { svg, width } = framed('bottom', LONG)
    // outerW = size + 2 × padding + 2 × bw, regardless of caption length
    expect(width).toBe(228)
    expect(tspanCount(svg)).toBeGreaterThan(1)
  })

  it('keeps short captions on a single line', () => {
    const { svg } = framed('bottom', 'Scan me')
    expect(tspanCount(svg)).toBe(1)
  })

  it('gives a single over-long word its own line without hanging', () => {
    const word = 'a'.repeat(80)
    const { svg } = framed('right', word)
    expect(svg).toContain(word)
    expect(tspanCount(svg)).toBe(1)
  })

  it('preserves explicit blank lines between paragraphs', () => {
    const { svg } = framed('bottom', 'one\n\ntwo')
    expect(tspanCount(svg)).toBe(3)
  })
})
