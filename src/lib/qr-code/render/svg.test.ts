import { describe, expect, it } from 'vitest'
import { renderQrFragment, wrapAsSvg } from './svg'
import { buildMatrix } from '../matrix'
import { DEFAULT_CONFIG, type ResolvedQRCodeConfig } from '../types'

function baseConfig(overrides: Partial<ResolvedQRCodeConfig> = {}): ResolvedQRCodeConfig {
  return {
    data: 'https://example.com',
    size: 200,
    margin: 0,
    errorCorrectionLevel: 'Q',
    dots: { ...DEFAULT_CONFIG.dots },
    cornerSquares: { ...DEFAULT_CONFIG.cornerSquares },
    cornerDots: { ...DEFAULT_CONFIG.cornerDots },
    background: { ...DEFAULT_CONFIG.background },
    ...overrides
  }
}

describe('renderQrFragment + wrapAsSvg', () => {
  it('produces an SVG document with a viewBox', () => {
    const { fragment } = renderQrFragment(baseConfig())
    const svg = wrapAsSvg(fragment, 200, 200)
    expect(svg).toMatch(/^<svg /)
    expect(svg).toContain('viewBox="0 0 200 200"')
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
  })

  it('emits vector path elements for the dots', () => {
    const { fragment } = renderQrFragment(baseConfig())
    const pathMatches = fragment.match(/<path /g) ?? []
    expect(pathMatches.length).toBeGreaterThanOrEqual(2) // dots + corner-squares at minimum
  })

  it('never embeds a raster image for the matrix itself', () => {
    const { fragment } = renderQrFragment(baseConfig())
    // No `<image>` for the matrix — only the optional centre logo may use it.
    expect(fragment).not.toContain('<image')
  })

  it('embeds a centre logo as <image> when image is provided', () => {
    const { fragment } = renderQrFragment(
      baseConfig({
        image: { href: 'https://example.com/logo.png', sizeRatio: 0.3 }
      })
    )
    expect(fragment).toContain('<image')
    expect(fragment).toContain('href="https://example.com/logo.png"')
  })

  it('respects background.color when set to a concrete value', () => {
    const { fragment } = renderQrFragment(baseConfig({ background: { color: '#fffaee' } }))
    expect(fragment).toContain('class="qr-bg"')
    expect(fragment).toContain('fill="#fffaee"')
  })

  it('omits the background rect for transparent backgrounds', () => {
    const { fragment } = renderQrFragment(baseConfig({ background: { color: 'transparent' } }))
    expect(fragment).not.toContain('class="qr-bg"')
  })

  it('survives an XSS-y image href without breaking attribute quoting', () => {
    const { fragment } = renderQrFragment(
      baseConfig({ image: { href: 'a"><script>alert(1)</script>' } })
    )
    expect(fragment).not.toContain('<script>')
    expect(fragment).toContain('&quot;')
  })

  it('boosts a low error-correction level to Q for matrix generation when an image is set (#309)', () => {
    const data = 'https://a.co'
    const { count: countAtL } = buildMatrix(data, 'L')
    const { count: countAtQ } = buildMatrix(data, 'Q')

    const { matrixCount } = renderQrFragment(
      baseConfig({
        data,
        errorCorrectionLevel: 'L',
        image: { href: 'logo.png', sizeRatio: 0.4 }
      })
    )

    expect(matrixCount).not.toBe(countAtL)
    expect(matrixCount).toBe(countAtQ)
  })

  it('leaves the error-correction level alone when no image is set', () => {
    const data = 'https://a.co'
    const { count: countAtL } = buildMatrix(data, 'L')

    const { matrixCount } = renderQrFragment(baseConfig({ data, errorCorrectionLevel: 'L' }))

    expect(matrixCount).toBe(countAtL)
  })

  it('honours an explicit margin=0 verbatim — no quiet zone is forced onto the renderer (#308)', () => {
    // The ISO/IEC 18004 quiet-zone minimum is applied as a *default*
    // (DEFAULT_CONFIG.margin, see core.ts/svg-export.ts's resolveConfig) for
    // configs that omit margin entirely — never as a floor here. Forcing it
    // unconditionally at this layer would shrink module pixel density for
    // every caller, including small/high-density exports where that breaks
    // real-world scanning (confirmed while investigating #308: a stylised
    // 200px export with moderate-length data stopped decoding once its
    // modules were forced to shrink for an unwanted quiet zone).
    const zero = renderQrFragment(baseConfig({ margin: 0 }))
    const four = renderQrFragment(baseConfig({ margin: 4 }))
    expect(zero.fragment).not.toBe(four.fragment)
  })
})
