import { describe, expect, it } from 'vitest'
import { renderQrFragment, resolveQuietZoneModules, wrapAsSvg } from './svg'
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
})

describe('resolveQuietZoneModules (#308)', () => {
  it('floors margin up to the ISO/IEC 18004 minimum of 4 modules', () => {
    expect(resolveQuietZoneModules(0)).toBe(4)
    expect(resolveQuietZoneModules(1)).toBe(4)
    expect(resolveQuietZoneModules(3)).toBe(4)
  })

  it('honours a margin already at or above the minimum', () => {
    expect(resolveQuietZoneModules(4)).toBe(4)
    expect(resolveQuietZoneModules(10)).toBe(10)
  })
})

describe('renderQrFragment quiet zone floor (#308)', () => {
  it('renders a margin=0 config with the same geometry as an explicit margin=4', () => {
    const zero = renderQrFragment(baseConfig({ margin: 0 }))
    const four = renderQrFragment(baseConfig({ margin: 4 }))
    expect(zero.fragment).toBe(four.fragment)
  })

  it('still expands the quiet zone further when margin exceeds the minimum', () => {
    const floored = renderQrFragment(baseConfig({ margin: 0 }))
    const wider = renderQrFragment(baseConfig({ margin: 10 }))
    expect(wider.fragment).not.toBe(floored.fragment)
  })
})
