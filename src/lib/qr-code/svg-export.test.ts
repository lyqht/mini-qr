import { describe, expect, it } from 'vitest'
import { buildSvgExportString } from './svg-export'

function viewBoxOf(svg: string): { width: number; height: number } {
  const m = /viewBox="0 0 ([0-9.]+) ([0-9.]+)"/.exec(svg)
  if (!m) throw new Error('SVG has no viewBox')
  return { width: Number(m[1]), height: Number(m[2]) }
}

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
})
