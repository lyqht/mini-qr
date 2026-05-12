import { describe, expect, it } from 'vitest'
import { getAsciiText, getMarkdownText } from './convertToText'

const matrix = [
  [true, false],
  [false, true]
]

describe('convertToText — getAsciiText', () => {
  it('returns the raw qrMatrixToText output (ASCII uses inverted polarity)', () => {
    const out = getAsciiText({ matrix, format: 'ascii', quietZone: 0 })
    expect(out).toBe(['  ##', '##  '].join('\n'))
  })
})

describe('convertToText — getMarkdownText', () => {
  it('wraps the body in a triple-backtick fence with no language tag', () => {
    const out = getMarkdownText({ matrix, format: 'ascii', quietZone: 0 })
    expect(out.startsWith('```\n')).toBe(true)
    expect(out.endsWith('\n```\n')).toBe(true)
    expect(out).toContain('  ##\n##  ')
  })

  it('does not include a language tag after the opening fence', () => {
    const out = getMarkdownText({ matrix, format: 'ascii', quietZone: 0 })
    const firstLine = out.split('\n')[0]
    expect(firstLine).toBe('```')
  })
})
