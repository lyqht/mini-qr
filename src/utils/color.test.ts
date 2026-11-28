import { describe, expect, it } from 'vitest'
import { createHarmoniousPalette } from './color'
import { contrastRatio } from './contrast'

function seededRandom(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

describe('createHarmoniousPalette', () => {
  it('always gives valid colours that are readable on the background', () => {
    for (let seed = 1; seed <= 500; seed++) {
      const palette = createHarmoniousPalette(seededRandom(seed))
      for (const ink of [palette.dots, palette.cornersSquare, palette.cornersDot]) {
        expect(ink).toMatch(/^#[0-9a-f]{6}$/)
        expect(contrastRatio(ink, palette.background)).toBeGreaterThanOrEqual(4.5)
      }
      expect(palette.background).toMatch(/^#[0-9a-f]{6}$/)
    }
  })
})
