import { describe, expect, it } from 'vitest'
import { rasterizeSvg } from './canvas'

const SIMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50" height="50">
  <rect x="0" y="0" width="50" height="50" fill="#ffffff"/>
  <rect x="10" y="10" width="30" height="30" fill="#000000"/>
</svg>`

describe('rasterizeSvg', () => {
  it('returns a PNG blob with image/png mime', async () => {
    const blob = await rasterizeSvg({
      svgString: SIMPLE_SVG,
      width: 100,
      height: 100,
      mimeType: 'image/png'
    })
    expect(blob.type).toBe('image/png')
    expect(blob.size).toBeGreaterThan(0)
  })

  it('returns a JPEG blob with image/jpeg mime and white background applied', async () => {
    const blob = await rasterizeSvg({
      svgString: SIMPLE_SVG,
      width: 100,
      height: 100,
      mimeType: 'image/jpeg',
      quality: 0.9,
      background: '#ffffff'
    })
    expect(blob.type).toBe('image/jpeg')
    expect(blob.size).toBeGreaterThan(0)
  })
})
