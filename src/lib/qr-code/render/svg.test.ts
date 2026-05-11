import { describe, expect, it } from 'vitest'
import { renderQrFragment, wrapAsSvg } from './svg'
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
})
