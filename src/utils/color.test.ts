import { describe, expect, it } from 'vitest'
import { createRandomColor, generateComplementaryQRPalette, getRandomItemInArray } from './color'

describe('createRandomColor', () => {
  it('always returns a fully zero-padded 6-digit hex color', () => {
    for (let i = 0; i < 200; i++) {
      expect(createRandomColor()).toMatch(/^#[0-9a-f]{6}$/)
    }
  })
})

describe('getRandomItemInArray', () => {
  it('returns an item that belongs to the array', () => {
    const array = ['a', 'b', 'c']
    expect(array).toContain(getRandomItemInArray(array))
  })
})

describe('generateComplementaryQRPalette', () => {
  it('derives distinct, valid hex colors from a seed color', () => {
    const palette = generateComplementaryQRPalette('#6750a4')

    for (const color of Object.values(palette)) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/)
    }
    // The whole point of mini-qr#26: colors should relate to each other via
    // the seed, not be independently random — so foreground tones must
    // differ from each other and from the background.
    const values = Object.values(palette)
    expect(new Set(values).size).toBe(values.length)
  })

  it('is deterministic for the same seed color', () => {
    const first = generateComplementaryQRPalette('#2e7d32')
    const second = generateComplementaryQRPalette('#2e7d32')
    expect(second).toEqual(first)
  })

  it('produces a different palette for a different seed color', () => {
    const violet = generateComplementaryQRPalette('#8e24aa')
    const ocean = generateComplementaryQRPalette('#0061a4')
    expect(violet).not.toEqual(ocean)
  })
})
