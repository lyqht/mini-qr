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
  it('renders dark cells as "##" and light cells as "  "', () => {
    const matrix = [
      [true, false],
      [false, true]
    ]
    const out = qrMatrixToText(matrix, 'ascii', { quietZone: 0 })
    expect(out).toBe(['##  ', '  ##'].join('\n'))
  })

  it('produces count + 2*quietZone lines (default quiet zone = 2)', () => {
    const matrix = [
      [true, false],
      [false, true]
    ]
    const out = qrMatrixToText(matrix, 'ascii')
    expect(out.split('\n')).toHaveLength(2 + 2 * 2)
  })

  it('surrounds the QR with light quiet zone', () => {
    const matrix = [[true]]
    const out = qrMatrixToText(matrix, 'ascii', { quietZone: 1 })
    expect(out.split('\n')).toEqual(['      ', '  ##  ', '      '])
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

  it('produces count + 2*quietZone lines (default quiet zone = 2)', () => {
    const matrix = [
      [true, false],
      [false, true]
    ]
    const out = qrMatrixToText(matrix, 'unicode-full')
    expect(out.split('\n')).toHaveLength(2 + 2 * 2)
  })
})
