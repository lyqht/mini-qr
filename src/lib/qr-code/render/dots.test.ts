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

  // A logo with a margin clears central cells. Neighbour-aware shapes must treat
  // those cleared cells as empty so dots bordering the logo round the corner
  // facing it instead of being sharply cut along the margin.
  describe('logo-cleared cells round bordering dots (regression)', () => {
    // 15x15 matrix (large enough for a centre outside the 7x7 finder regions).
    // Exactly one body dot renders: (7,6). Its only filled neighbour is (6,6),
    // which sits inside the top-left finder region, so it is never drawn as its
    // own dot but still counts as a present neighbour for corner rounding. That
    // lets us measure the surviving dot's rounding in isolation, mirroring a dot
    // bordering the logo-cleared region.
    const count = 15
    const makeMatrix = () =>
      Array.from({ length: count }, () => Array.from({ length: count }, () => false))
    const matrix = makeMatrix()
    matrix[7][6] = true
    matrix[6][6] = true
    const base = { matrix, count, moduleSize: 10, offset: 0 } as const
    const arcs = (d: string) => (d.match(/a/g) ?? []).length

    it('extra-rounded: a cleared neighbour rounds the dot facing it', () => {
      // (6,6) present -> top edge stays flat: only the 2 bottom corners round.
      const noHide = buildDotsPath({ ...base, shape: 'extra-rounded' })
      // Clearing (6,6) (as a logo margin would) -> dot is now exposed on all
      // sides: all 4 corners round, just like the hand-fixed sample.
      const withHide = buildDotsPath({
        ...base,
        shape: 'extra-rounded',
        hideCell: (r, c) => r === 6 && c === 6
      })
      expect(arcs(noHide)).toBe(2)
      expect(arcs(withHide)).toBe(4)
    })

    it('square: unaffected by cleared neighbours (no rounding by design)', () => {
      const withHide = buildDotsPath({
        ...base,
        shape: 'square',
        hideCell: (r, c) => r === 6 && c === 6
      })
      expect(arcs(withHide)).toBe(0)
    })
  })
})
