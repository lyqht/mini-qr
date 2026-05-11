import { describe, expect, it } from 'vitest'
import { buildMatrix } from './matrix'

describe('buildMatrix', () => {
  it('produces a square matrix', () => {
    const { matrix, count } = buildMatrix('hello', 'Q')
    expect(matrix.length).toBe(count)
    for (const row of matrix) expect(row.length).toBe(count)
  })

  it('is deterministic for the same input + EC level', () => {
    const a = buildMatrix('https://example.com', 'M')
    const b = buildMatrix('https://example.com', 'M')
    expect(b.count).toBe(a.count)
    for (let r = 0; r < a.count; r++) {
      for (let c = 0; c < a.count; c++) expect(b.matrix[r][c]).toBe(a.matrix[r][c])
    }
  })

  it('rejects empty input with a helpful error', () => {
    expect(() => buildMatrix('', 'Q')).toThrow(/non-empty/)
  })

  describe('UTF-8 multibyte input', () => {
    const cases = [
      ['Vietnamese', 'Xin chào, thế giới'],
      ['Japanese', 'こんにちは世界'],
      ['Arabic', 'مرحبا بالعالم'],
      ['Emoji', '👋🌍🎉'],
      ['Mixed', 'Hello مرحبا 你好 👋']
    ] as const

    for (const [label, input] of cases) {
      it(`builds a non-empty matrix for ${label}`, () => {
        const { matrix, count } = buildMatrix(input, 'Q')
        expect(count).toBeGreaterThan(0)
        const anyDark = matrix.some((row) => row.some((cell) => cell))
        expect(anyDark).toBe(true)
      })
    }

    it('produces different matrices for input differing only in accent', () => {
      const a = buildMatrix('cafe', 'Q')
      const b = buildMatrix('café', 'Q')
      // Different bytes → different module count or different cells; either is enough.
      const same =
        a.count === b.count &&
        a.matrix.every((row, r) => row.every((cell, c) => cell === b.matrix[r][c]))
      expect(same).toBe(false)
    })
  })

  it('throws a typed error when input exceeds capacity at the chosen EC level', () => {
    const huge = 'x'.repeat(10_000)
    expect(() => buildMatrix(huge, 'H')).toThrow(/Failed to build QR matrix/)
  })
})
