import { describe, it, expect } from 'vitest'
import {
  hexToRgb,
  relativeLuminance,
  contrastRatio,
  isPaperDarkerThanInk,
  hasInsufficientContrast
} from './contrast'

describe('hexToRgb', () => {
  it('parses 6-digit hex colors', () => {
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 })
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 })
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('parses 3-digit hex colors', () => {
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 })
    expect(hexToRgb('#000')).toEqual({ r: 0, g: 0, b: 0 })
  })

  it('is case-insensitive', () => {
    expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 })
  })

  it('returns null for invalid input', () => {
    expect(hexToRgb('white')).toBeNull()
    expect(hexToRgb('#ggg')).toBeNull()
    expect(hexToRgb('')).toBeNull()
  })
})

describe('relativeLuminance', () => {
  it('white is brighter than black', () => {
    expect(relativeLuminance('#ffffff')).toBe(1)
    expect(relativeLuminance('#000000')).toBe(0)
  })

  it('returns null for invalid input', () => {
    expect(relativeLuminance('not-a-color')).toBeNull()
  })
})

describe('contrastRatio', () => {
  it('is 21:1 for black on white', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 0)
  })

  it('is 1:1 for identical colors', () => {
    expect(contrastRatio('#808080', '#808080')).toBeCloseTo(1, 5)
  })

  it('is symmetric', () => {
    expect(contrastRatio('#ffffff', '#ff0000')).toBeCloseTo(contrastRatio('#ff0000', '#ffffff')!, 5)
  })

  it('returns null for invalid input', () => {
    expect(contrastRatio('#fff', 'invalid')).toBeNull()
  })
})

describe('isPaperDarkerThanInk', () => {
  it('is false for standard black-on-white', () => {
    expect(isPaperDarkerThanInk('#ffffff', '#000000')).toBe(false)
  })

  it('is true for white-on-black (paper darker than ink)', () => {
    expect(isPaperDarkerThanInk('#000000', '#ffffff')).toBe(true)
  })

  it('is false when paper and ink are equally light', () => {
    expect(isPaperDarkerThanInk('#808080', '#808080')).toBe(false)
  })

  it('returns false for invalid input', () => {
    expect(isPaperDarkerThanInk('invalid', '#000000')).toBe(false)
  })
})

describe('hasInsufficientContrast', () => {
  it('is false for black on white', () => {
    expect(hasInsufficientContrast('#ffffff', '#000000')).toBe(false)
  })

  it('is true for similar colors', () => {
    expect(hasInsufficientContrast('#ffffff', '#f0f0f0')).toBe(true)
  })

  it('returns false for invalid input', () => {
    expect(hasInsufficientContrast('invalid', '#000000')).toBe(false)
  })
})
