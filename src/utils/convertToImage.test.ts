import { describe, expect, it } from 'vitest'
import { getPngBlob, type ImageExportInput } from './convertToImage'
import { buildSvgExportString } from '@/lib/qr-code'

function readViewBox(svg: string): { width: number; height: number } {
  const m = /viewBox="0 0 ([0-9.]+) ([0-9.]+)"/.exec(svg)
  if (!m) throw new Error('SVG has no viewBox')
  return { width: Number(m[1]), height: Number(m[2]) }
}

async function blobDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(blob)
  return { width: bitmap.width, height: bitmap.height }
}

describe('getPngBlob with a side-text frame', () => {
  // Regression for https://github.com/lyqht/mini-qr/issues/290 — the QR was
  // squashed horizontally on export. Cause: the raster was stretched into a
  // DOM-measured `targetSize` whose aspect ratio differed from the SVG that
  // was actually drawn, distorting the (square) QR.
  it('preserves the SVG aspect ratio even when targetSize has a different ratio', async () => {
    const input: ImageExportInput = {
      options: { data: 'https://example.com', width: 300, height: 300 },
      frame: {
        text: 'Scan me',
        position: 'right',
        style: {}
      },
      size: { width: 300, height: 300 },
      // Deliberately wrong aspect ratio (very wide, short) — simulates the
      // DOM-measured dimensions diverging from the SVG's own layout.
      targetSize: { width: 900, height: 200 }
    }

    const naturalRatio = (() => {
      const vb = readViewBox(buildSvgExportString(input))
      return vb.width / vb.height
    })()

    const blob = await getPngBlob(input)
    const { width, height } = await blobDimensions(blob)
    const outputRatio = width / height

    // Output must keep the SVG's aspect ratio, not the squashing targetSize
    // ratio of 900/200 = 4.5.
    expect(outputRatio).toBeCloseTo(naturalRatio, 1)
  })

  it('keeps the no-frame square QR square when targetSize is non-square', async () => {
    const input: ImageExportInput = {
      options: { data: 'https://example.com', width: 300, height: 300 },
      frame: null,
      size: { width: 300, height: 300 },
      targetSize: { width: 600, height: 300 }
    }

    const blob = await getPngBlob(input)
    const { width, height } = await blobDimensions(blob)
    expect(width / height).toBeCloseTo(1, 1)
  })
})
