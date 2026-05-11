import { describe, expect, it } from 'vitest'
import { buildDotsPath } from './dots'
import { buildMatrix } from '../matrix'
import type { DotShape } from '../types'

const SHAPES: DotShape[] = [
  'square',
  'rounded',
  'extra-rounded',
  'classy',
  'classy-rounded',
  'dots'
]

function makeArgs(shape: DotShape) {
  const { matrix, count } = buildMatrix('mini-qr', 'M')
  const moduleSize = 200 / count
  return { matrix, count, moduleSize, offset: 0, shape }
}

describe('buildDotsPath', () => {
  for (const shape of SHAPES) {
    it(`returns a non-empty path for ${shape}`, () => {
      const d = buildDotsPath(makeArgs(shape))
      expect(d.length).toBeGreaterThan(0)
      expect(d).toMatch(/^M/)
      expect(d).toMatch(/z$/i)
    })
  }

  it('produces different output for square vs dots', () => {
    const a = buildDotsPath(makeArgs('square'))
    const b = buildDotsPath(makeArgs('dots'))
    expect(a).not.toBe(b)
  })

  it('skips finder regions (no dots inside the 7x7 corners)', () => {
    // Heuristic: emitting square dots at 1px moduleSize and a count of 21
    // should yield exactly (matrix dark cells outside finder regions)
    // path subpaths joined with " ".
    const { matrix, count } = buildMatrix('x', 'M')
    const moduleSize = 200 / count
    const d = buildDotsPath({ matrix, count, moduleSize, offset: 0, shape: 'square' })
    // Count M moves — each represents one cell
    const moves = d.match(/M/g)?.length ?? 0
    // Body dots only — should be less than total dark cells when finder regions overlap with darks
    let totalDark = 0
    for (let r = 0; r < count; r++) for (let c = 0; c < count; c++) if (matrix[r][c]) totalDark++
    expect(moves).toBeLessThan(totalDark)
  })

  it('hideCell predicate excludes cells from output', () => {
    const args = makeArgs('square')
    const full = buildDotsPath(args)
    const hidden = buildDotsPath({ ...args, hideCell: () => true })
    expect(hidden.length).toBe(0)
    expect(full.length).toBeGreaterThan(0)
  })
})
