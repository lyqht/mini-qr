import { describe, it, expect } from 'vitest'
import { hexToHsl, hslToHex, createComplementaryScheme } from './color'

describe('color utilities', () => {
  it('converts hex to hsl and back', () => {
    const hex = '#336699'
    const { h, s, l } = hexToHsl(hex)
    const converted = hslToHex(h, s, l)
    expect(converted.toLowerCase()).toBe(hex)
  })

  it('creates a complementary color scheme', () => {
    const scheme = createComplementaryScheme('#123456')
    expect(Object.keys(scheme)).toHaveLength(4)
  })
})
