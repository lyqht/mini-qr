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
