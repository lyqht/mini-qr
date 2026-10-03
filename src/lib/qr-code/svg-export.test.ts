import { describe, expect, it } from 'vitest'
import { buildSvgExportString, type SvgExportInput } from './svg-export'

function viewBoxOf(svg: string): { width: number; height: number } {
  const m = /viewBox="0 0 ([0-9.]+) ([0-9.]+)"/.exec(svg)
  if (!m) throw new Error('SVG has no viewBox')
  return { width: Number(m[1]), height: Number(m[2]) }
}

function numberAttr(source: string, name: string): number {
  const match = new RegExp(`\\b${name}="([0-9.]+)"`).exec(source)
  if (!match) throw new Error(`Missing ${name} attribute`)
  return Number(match[1])
}

function frameBorderRect(svg: string): string {
  const match = /<rect\b[^>]*\/>/.exec(svg)
  if (!match) throw new Error('SVG has no frame border rect')
  return match[0]
}

function frameText(svg: string): string {
  const match = /<text\b[^>]*>/.exec(svg)
  if (!match) throw new Error('SVG has no frame text')
  return match[0]
}

function qrTranslateX(svg: string): number {
  const match = /<g transform="translate\(([0-9.]+), ([0-9.]+)\)"/.exec(svg)
  if (!match) throw new Error('SVG has no translated QR group')
  return Number(match[1])
}

function clipRectForSize(svg: string, size: number): string {
  const clipPaths = svg.match(/<clipPath\b[^>]*>.*?<\/clipPath>/g) ?? []
  const match = clipPaths.find(
    (clipPath) => clipPath.includes(`width="${size}"`) && clipPath.includes(`height="${size}"`)
  )
  if (!match) throw new Error(`SVG has no ${size}x${size} clip rect`)
  return match
}

type SvgExportInputWithQrRadius = SvgExportInput & { qrBorderRadius?: string }

describe('buildSvgExportString frame plumbing', () => {
  const base = {
    options: { data: 'https://example.com', width: 200, height: 200 },
    size: { width: 200, height: 200 }
  }

  it('defaults the side caption column to the QR size', () => {
    const svg = buildSvgExportString({
      ...base,
      frame: { text: 'Scan me', position: 'right', style: { padding: '12px' } }
    })
    // outerW = size + column(200) + 3 × padding + 2 × borderWidth(default 2)
    expect(viewBoxOf(svg).width).toBe(440)
  })

  it('passes captionWidth through to the frame renderer', () => {
    const svg = buildSvgExportString({
      ...base,
      frame: {
        text: 'Scan me',
        position: 'right',
        style: { padding: '12px' },
        captionWidth: 300
      }
    })
    // outerW = size + column(300) + 3 × padding + 2 × borderWidth(default 2)
    expect(viewBoxOf(svg).width).toBe(540)
  })

  it('passes the frame backgroundImage through to the frame renderer', () => {
    const href = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg=='
    const svg = buildSvgExportString({
      ...base,
      frame: {
        text: 'Scan me',
        position: 'bottom',
        style: { padding: '12px', backgroundImage: href }
      }
    })
    expect(svg).toContain(`<image href="${href}"`)
  })

  it('emits no frame background <image> when the style has none', () => {
    const svg = buildSvgExportString({
      ...base,
      frame: { text: 'Scan me', position: 'bottom', style: { padding: '12px' } }
    })
    expect(svg).not.toContain('<image')
  })
})

describe('export scaling (#333)', () => {
  function framedExport(size: number): string {
    return buildSvgExportString({
      options: { data: 'https://example.com', width: size, height: size },
      size: { width: size, height: size },
      frame: {
        text: 'Scan me',
        position: 'right',
        style: { borderWidth: '1px', borderRadius: '8px', padding: '16px' },
        captionWidth: 200
      }
    })
  }

  it('scales frame caption text with the QR export size', () => {
    const previewScale = framedExport(200)
    const largeExport = framedExport(1000)

    expect(numberAttr(frameText(largeExport), 'font-size')).toBe(
      numberAttr(frameText(previewScale), 'font-size') * 5
    )
  })

  it('scales frame chrome with the QR export size', () => {
    const previewScale = framedExport(200)
    const largeExport = framedExport(1000)
    const scale = 5

    expect(numberAttr(frameBorderRect(largeExport), 'rx')).toBe(
      numberAttr(frameBorderRect(previewScale), 'rx') * scale
    )
    expect(numberAttr(frameBorderRect(largeExport), 'stroke-width')).toBe(
      numberAttr(frameBorderRect(previewScale), 'stroke-width') * scale
    )
    expect(qrTranslateX(largeExport)).toBe(qrTranslateX(previewScale) * scale)
    expect(viewBoxOf(largeExport).width).toBe(viewBoxOf(previewScale).width * scale)
  })

  it('scales the QR border radius with unframed exports', () => {
    const exportAt = (size: number) =>
      buildSvgExportString({
        options: { data: 'https://example.com', width: size, height: size },
        size: { width: size, height: size },
        borderRadius: '15px'
      })

    const previewScale = clipRectForSize(exportAt(200), 200)
    const largeExport = clipRectForSize(exportAt(1000), 1000)

    expect(numberAttr(largeExport, 'rx')).toBe(numberAttr(previewScale, 'rx') * 5)
  })

  it('preserves and scales the QR border radius when a frame is present', () => {
    const input: SvgExportInputWithQrRadius = {
      options: { data: 'https://example.com', width: 1000, height: 1000 },
      size: { width: 1000, height: 1000 },
      qrBorderRadius: '15px',
      frame: {
        text: 'Scan me',
        position: 'bottom',
        style: { borderWidth: '1px', borderRadius: '8px', padding: '16px' }
      }
    }

    const svg = buildSvgExportString(input)
    const qrClip = clipRectForSize(svg, 1000)

    expect(numberAttr(qrClip, 'rx')).toBe(75)
  })
})

describe('quiet-zone default (#308)', () => {
  it('omitting margin defaults to the ISO/IEC 18004 minimum of 4 modules', () => {
    const omitted = buildSvgExportString({ options: { data: 'https://example.com' } })
    const explicitFour = buildSvgExportString({
      options: { data: 'https://example.com', margin: 4 }
    })
    expect(omitted).toBe(explicitFour)
  })

  it('an explicit margin of 0 is honoured verbatim, not floored to 4', () => {
    const omitted = buildSvgExportString({ options: { data: 'https://example.com' } })
    const explicitZero = buildSvgExportString({
      options: { data: 'https://example.com', margin: 0 }
    })
    expect(explicitZero).not.toBe(omitted)
  })
})
