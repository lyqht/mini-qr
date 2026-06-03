import { describe, expect, it } from 'vitest'
import { rasterizeSvg } from './canvas'

const SIMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50" height="50">
  <rect x="0" y="0" width="50" height="50" fill="#ffffff"/>
  <rect x="10" y="10" width="30" height="30" fill="#000000"/>
</svg>`

function makeSolidPngDataUri(color: string, size = 8): string {
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')!
  ctx.fillStyle = color
  ctx.fillRect(0, 0, size, size)
  return c.toDataURL('image/png')
}

const SVG_WITH_BROKEN_LOGO = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 50 50" width="50" height="50">
  <rect x="0" y="0" width="50" height="50" fill="#ffffff"/>
  <image href="https://invalid.example.invalid/does-not-exist.png" x="20" y="20" width="10" height="10"/>
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

  it('rasterises the centre logo onto the canvas when the SVG references one', async () => {
    const width = 100
    const height = 100
    const red = makeSolidPngDataUri('#ff0000')
    const svgWithLogo = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 50 50" width="50" height="50">
      <rect x="0" y="0" width="50" height="50" fill="#ffffff"/>
      <image href="${red}" xlink:href="${red}" x="20" y="20" width="10" height="10"/>
    </svg>`
    const blob = await rasterizeSvg({
      svgString: svgWithLogo,
      width,
      height,
      mimeType: 'image/png'
    })
    expect(blob.type).toBe('image/png')

    // Decode the rasterised PNG and verify the centre is red — i.e. the
    // <image> was drawn onto the canvas after the SVG, not lost.
    const bitmap = await createImageBitmap(blob)
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(bitmap, 0, 0)
    // Logo is at viewBox (20,20) size 10x10 in a 50x50 viewBox scaled to
    // 100x100, so it covers canvas pixels (40,40)..(60,60). Sample the centre.
    const { data } = ctx.getImageData(50, 50, 1, 1)
    const [r, g, b] = data
    expect(r).toBeGreaterThan(200)
    expect(g).toBeLessThan(40)
    expect(b).toBeLessThan(40)
  })

  it('accounts for parent <g transform="translate(...)"> when placing the logo', async () => {
    // Simulates the framed layout: QR fragment (with <image>) wrapped in a
    // translate group, then the whole thing inside a larger outer SVG.
    const red = makeSolidPngDataUri('#ff0000')
    const framedSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 80" width="60" height="80">
      <rect x="0" y="0" width="60" height="80" fill="#ffffff"/>
      <g transform="translate(5, 5)">
        <rect x="0" y="0" width="50" height="50" fill="#dddddd"/>
        <image href="${red}" xlink:href="${red}" x="20" y="20" width="10" height="10"/>
      </g>
    </svg>`
    const width = 120
    const height = 160
    const blob = await rasterizeSvg({
      svgString: framedSvg,
      width,
      height,
      mimeType: 'image/png'
    })
    const bitmap = await createImageBitmap(blob)
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(bitmap, 0, 0)
    // Logo is at viewBox (25, 25) size 10x10 (after translate(5,5) + x=20,y=20).
    // ViewBox 60x80 → canvas 120x160, so scale 2x. Logo centre at viewBox (30, 30) → canvas (60, 60).
    const { data } = ctx.getImageData(60, 60, 1, 1)
    const [r, g, b] = data
    expect(r).toBeGreaterThan(200)
    expect(g).toBeLessThan(40)
    expect(b).toBeLessThan(40)
  })

  it('still draws an external centre logo when a data: frame background <image> precedes it', async () => {
    // Frame background images are inlined data: URIs and render fine inside
    // the sandboxed SVG; the centre logo may still be an external URL that the
    // sandbox refuses to fetch. The overlay extraction must skip past the
    // data: image and lift the external one. A blob: URL stands in for an
    // external URL here — like http(s), it is blocked inside an SVG loaded
    // via <img> but loads fine as a direct Image.
    const redBg = makeSolidPngDataUri('#ff0000')
    const greenLogoBlob = await (await fetch(makeSolidPngDataUri('#00ff00'))).blob()
    const greenLogoUrl = URL.createObjectURL(greenLogoBlob)
    try {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 50 50" width="50" height="50">
        <rect x="0" y="0" width="50" height="50" fill="#ffffff"/>
        <image href="${redBg}" x="0" y="0" width="50" height="50"/>
        <image href="${greenLogoUrl}" x="20" y="20" width="10" height="10"/>
      </svg>`
      const blob = await rasterizeSvg({
        svgString: svg,
        width: 100,
        height: 100,
        mimeType: 'image/png'
      })
      const bitmap = await createImageBitmap(blob)
      const canvas = document.createElement('canvas')
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(bitmap, 0, 0)
      // Logo covers canvas (40,40)..(60,60); centre must be the logo's green,
      // not the background image's red.
      const { data } = ctx.getImageData(50, 50, 1, 1)
      const [r, g, b] = data
      expect(g).toBeGreaterThan(200)
      expect(r).toBeLessThan(40)
      expect(b).toBeLessThan(40)
    } finally {
      URL.revokeObjectURL(greenLogoUrl)
    }
  })

  it('still produces a blob when the centre logo URL fails to load', async () => {
    const blob = await rasterizeSvg({
      svgString: SVG_WITH_BROKEN_LOGO,
      width: 100,
      height: 100,
      mimeType: 'image/png'
    })
    expect(blob.type).toBe('image/png')
    expect(blob.size).toBeGreaterThan(0)
  })
})
