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

  describe('gradients', () => {
    it('emits a <linearGradient> def when dots.gradient is linear', () => {
      const { fragment } = renderQrFragment(
        baseConfig({
          dots: {
            shape: 'square',
            color: '#000000',
            gradient: {
              type: 'linear',
              rotation: 0,
              colorStops: [
                { offset: 0, color: '#ff0000' },
                { offset: 1, color: '#0000ff' }
              ]
            }
          }
        })
      )
      expect(fragment).toContain('<defs>')
      expect(fragment).toContain('<linearGradient ')
      expect(fragment).toContain('stop-color="#ff0000"')
      expect(fragment).toContain('stop-color="#0000ff"')
      // dots path must reference the gradient by URL
      expect(fragment).toMatch(/class="qr-dots"[^>]*fill="url\(#qr-dots-grad-\d+\)"/)
    })

    it('emits a <radialGradient> def when background.gradient is radial', () => {
      const { fragment } = renderQrFragment(
        baseConfig({
          background: {
            color: '#ffffff',
            gradient: {
              type: 'radial',
              colorStops: [
                { offset: 0, color: '#ffffff' },
                { offset: 1, color: '#444444' }
              ]
            }
          }
        })
      )
      expect(fragment).toContain('<radialGradient ')
      expect(fragment).toMatch(/class="qr-bg"[^>]*fill="url\(#qr-bg-grad-\d+\)"/)
    })

    it('gives each gradient a unique id across multiple renders', () => {
      const gradient = {
        type: 'linear' as const,
        colorStops: [
          { offset: 0, color: '#000000' },
          { offset: 1, color: '#ffffff' }
        ]
      }
      const a = renderQrFragment(
        baseConfig({ dots: { shape: 'square', color: '#000000', gradient } })
      ).fragment
      const b = renderQrFragment(
        baseConfig({ dots: { shape: 'square', color: '#000000', gradient } })
      ).fragment
      const idA = a.match(/qr-dots-grad-(\d+)/)?.[1]
      const idB = b.match(/qr-dots-grad-(\d+)/)?.[1]
      expect(idA).toBeDefined()
      expect(idB).toBeDefined()
      expect(idA).not.toBe(idB)
    })

    it('falls back to solid color when gradient.colorStops is empty', () => {
      const { fragment } = renderQrFragment(
        baseConfig({
          dots: {
            shape: 'square',
            color: '#abcdef',
            gradient: { type: 'linear', colorStops: [] }
          }
        })
      )
      expect(fragment).not.toContain('<defs>')
      expect(fragment).toContain('fill="#abcdef"')
    })
  })
})
