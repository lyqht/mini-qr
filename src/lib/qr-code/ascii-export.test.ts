import { describe, expect, it } from 'vitest'
import { qrMatrixToText } from './ascii-export'

describe('qrMatrixToText — validation', () => {
  it('throws on empty matrix', () => {
    expect(() => qrMatrixToText([], 'ascii')).toThrow(/non-empty/)
  })

  it('throws on matrix with zero-length rows', () => {
    expect(() => qrMatrixToText([[]], 'ascii')).toThrow(/non-empty/)
  })

  it('throws on ragged (non-square) matrix', () => {
    const ragged = [[true, false], [true]]
    expect(() => qrMatrixToText(ragged, 'ascii')).toThrow(/square/)
  })
})

describe('qrMatrixToText — ascii format', () => {
  it('uses inverted polarity: dark cells as "  " and light cells as "##"', () => {
    const matrix = [
      [true, false],
      [false, true]
    ]
    const out = qrMatrixToText(matrix, 'ascii', { quietZone: 0 })
    expect(out).toBe(['  ##', '##  '].join('\n'))
  })

  it('produces count + 2*quietZone lines (default quiet zone = 4)', () => {
    const matrix = [
      [true, false],
      [false, true]
    ]
    const out = qrMatrixToText(matrix, 'ascii')
    expect(out.split('\n')).toHaveLength(2 + 2 * 4)
  })

  it('surrounds the QR with light quiet zone (rendered as "##" under inverted polarity)', () => {
    const matrix = [[true]]
    const out = qrMatrixToText(matrix, 'ascii', { quietZone: 1 })
    expect(out.split('\n')).toEqual(['######', '##  ##', '######'])
  })
})

describe('qrMatrixToText — unicode-full format', () => {
  it('renders dark cells as "██" and light cells as "  "', () => {
    const matrix = [
      [true, false],
      [false, true]
    ]
    const out = qrMatrixToText(matrix, 'unicode-full', { quietZone: 0 })
    expect(out).toBe(['██  ', '  ██'].join('\n'))
  })

  it('produces count + 2*quietZone lines (default quiet zone = 4)', () => {
    const matrix = [
      [true, false],
      [false, true]
    ]
    const out = qrMatrixToText(matrix, 'unicode-full')
    expect(out.split('\n')).toHaveLength(2 + 2 * 4)
  })
})

describe('qrMatrixToText — unicode-half format', () => {
  it('packs two rows into one line with the four glyphs', () => {
    // (top, bottom): TT→█, TF→▀, FT→▄, FF→' '
    const matrix = [
      [true, true, false, false],
      [true, false, true, false],
      [false, false, false, false],
      [false, false, false, false]
    ]
    const out = qrMatrixToText(matrix, 'unicode-half', { quietZone: 0 })
    expect(out).toBe('█▀▄ \n    ')
  })

  it('pads an odd-row matrix with a light row at the bottom', () => {
    const matrix = [[true]]
    const out = qrMatrixToText(matrix, 'unicode-half', { quietZone: 0 })
    expect(out).toBe('▀')
  })

  it('line count is ceil((count + 2*quietZone) / 2)', () => {
    const matrix = [[true]]
    const out = qrMatrixToText(matrix, 'unicode-half', { quietZone: 2 })
    // (1 + 2*2) = 5, ceil(5/2) = 3
    expect(out.split('\n')).toHaveLength(3)
  })
})

describe('qrMatrixToText — glyph overrides', () => {
  it('uses custom glyphs for ascii', () => {
    const matrix = [
      [true, false],
      [false, true]
    ]
    const out = qrMatrixToText(matrix, 'ascii', {
      quietZone: 0,
      glyphs: { dark: '*', light: '.' }
    })
    expect(out).toBe(['*.', '.*'].join('\n'))
  })

  it('uses custom glyphs for unicode-full', () => {
    const matrix = [
      [true, false],
      [false, true]
    ]
    const out = qrMatrixToText(matrix, 'unicode-full', {
      quietZone: 0,
      glyphs: { dark: 'X', light: 'o' }
    })
    expect(out).toBe(['Xo', 'oX'].join('\n'))
  })

  it('ignores glyph overrides for unicode-half', () => {
    const matrix = [
      [true, false],
      [false, true]
    ]
    const out = qrMatrixToText(matrix, 'unicode-half', {
      quietZone: 0,
      glyphs: { dark: 'X', light: 'o' }
    })
    expect(out).toBe('▀▄')
  })
})

describe('qrMatrixToText — round-trip (ascii)', () => {
  it('text → matrix recovers the original', () => {
    const original: boolean[][] = [
      [true, false, true, false],
      [false, true, false, true],
      [true, true, false, false],
      [false, false, true, true]
    ]
    const text = qrMatrixToText(original, 'ascii', { quietZone: 0 })
    const recovered = text.split('\n').map((line) => {
      const cells: boolean[] = []
      for (let i = 0; i < line.length; i += 2) {
        // ASCII uses inverted polarity: '  ' = dark module, '##' = light module
        cells.push(line.slice(i, i + 2) === '  ')
      }
      return cells
    })
    expect(recovered).toEqual(original)
  })
})
