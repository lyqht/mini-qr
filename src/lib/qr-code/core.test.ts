import { describe, expect, it } from 'vitest'
import { mergeConfig } from './core'
import { DEFAULT_CONFIG, type ResolvedQRCodeConfig } from './types'

function makeCurrent(overrides: Partial<ResolvedQRCodeConfig> = {}): ResolvedQRCodeConfig {
  return {
    data: 'hi',
    size: DEFAULT_CONFIG.size,
    margin: DEFAULT_CONFIG.margin,
    errorCorrectionLevel: DEFAULT_CONFIG.errorCorrectionLevel,
    dots: { ...DEFAULT_CONFIG.dots },
    cornerSquares: { ...DEFAULT_CONFIG.cornerSquares },
    cornerDots: { ...DEFAULT_CONFIG.cornerDots },
    background: { ...DEFAULT_CONFIG.background },
    ...overrides
  }
}

describe('mergeConfig', () => {
  it('clears the image when partial explicitly sets image to undefined', () => {
    const current = makeCurrent({
      image: { href: 'https://example.com/logo.png', sizeRatio: 0.4 }
    })

    const merged = mergeConfig(current, { image: undefined })

    expect(merged.image).toBeUndefined()
  })

  it('keeps the current image when partial omits the image key', () => {
    const current = makeCurrent({
      image: { href: 'https://example.com/logo.png', sizeRatio: 0.4 }
    })

    const merged = mergeConfig(current, { data: 'new data' })

    expect(merged.image?.href).toBe('https://example.com/logo.png')
  })

  it('replaces the current image when partial provides a new image', () => {
    const current = makeCurrent({
      image: { href: 'https://old.example.com/logo.png', sizeRatio: 0.4 }
    })

    const merged = mergeConfig(current, {
      image: { href: 'https://new.example.com/logo.png', sizeRatio: 0.5 }
    })

    expect(merged.image?.href).toBe('https://new.example.com/logo.png')
    expect(merged.image?.sizeRatio).toBe(0.5)
  })
})
