import { describe, expect, it } from 'vitest'
import { getAverageColorFromImage } from './color'

function solidColorDataUrl(hex: string, opts: { withTransparentBorder?: boolean } = {}): string {
  const canvas = document.createElement('canvas')
  canvas.width = 8
  canvas.height = 8
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, 8, 8)
  const inset = opts.withTransparentBorder ? 2 : 0
  ctx.fillStyle = hex
  ctx.fillRect(inset, inset, 8 - inset * 2, 8 - inset * 2)
  return canvas.toDataURL('image/png')
}

describe('getAverageColorFromImage', () => {
  it('returns the color of a solid-fill image', async () => {
    const dataUrl = solidColorDataUrl('#ff0000')
    const result = await getAverageColorFromImage(dataUrl)
    expect(result).toBe('#ff0000')
  })

  it('ignores fully transparent pixels when averaging', async () => {
    // A colored square inset within a transparent border — the average of
    // only the opaque pixels should still be the fill color, not muddied by
    // the transparent (default-black) surrounding pixels.
    const dataUrl = solidColorDataUrl('#00ff00', { withTransparentBorder: true })
    const result = await getAverageColorFromImage(dataUrl)
    expect(result).toBe('#00ff00')
  })

  it('returns null for a fully transparent image', async () => {
    const canvas = document.createElement('canvas')
    canvas.width = 8
    canvas.height = 8
    const dataUrl = canvas.toDataURL('image/png')
    const result = await getAverageColorFromImage(dataUrl)
    expect(result).toBeNull()
  })

  it('returns null for an unloadable image source', async () => {
    const result = await getAverageColorFromImage('data:image/png;base64,not-a-real-image')
    expect(result).toBeNull()
  })
})
