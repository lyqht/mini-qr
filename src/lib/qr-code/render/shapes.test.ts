import { describe, expect, it } from 'vitest'
import { buildShapeMaskPredicate, recommendedECForShape } from './shapes'

describe('recommendedECForShape', () => {
  it('returns undefined for no mask', () => {
    expect(recommendedECForShape(undefined)).toBeUndefined()
  })

  it('recommends H for high-loss shapes', () => {
    expect(recommendedECForShape('circle')).toBe('H')
    expect(recommendedECForShape('heart')).toBe('H')
    expect(recommendedECForShape('triangle')).toBe('H')
    expect(recommendedECForShape('star')).toBe('H')
  })

  it('recommends Q for rounded-square (lower loss)', () => {
    expect(recommendedECForShape('rounded-square')).toBe('Q')
  })

  it('assumes worst case (H) for unknown custom paths', () => {
    expect(recommendedECForShape({ svgPath: 'M0 0 L1 0 L1 1 L0 1 Z' })).toBe('H')
  })
})

describe('buildShapeMaskPredicate', () => {
  const count = 21 // smallest QR matrix

  it('circle: hides corners, keeps centre', () => {
    const hide = buildShapeMaskPredicate('circle', count)
    expect(hide(0, 0)).toBe(true) // top-left corner cell
    expect(hide(count - 1, count - 1)).toBe(true) // bottom-right corner cell
    expect(hide(10, 10)).toBe(false) // centre cell
  })

  it('triangle: hides top corners, keeps base and apex centre', () => {
    const hide = buildShapeMaskPredicate('triangle', count)
    // Apex at top-centre — top corners are outside the triangle.
    expect(hide(0, 0)).toBe(true)
    expect(hide(0, count - 1)).toBe(true)
    // Base of triangle — centre of bottom row is inside.
    expect(hide(count - 1, 10)).toBe(false)
    // Centre column near the apex is inside.
    expect(hide(2, 10)).toBe(false)
  })

  it('star: hides notches between points', () => {
    const hide = buildShapeMaskPredicate('star', count)
    // Corner of the bounding square — must be hidden (a star never fills corners).
    expect(hide(0, 0)).toBe(true)
    // Dead centre — always inside.
    expect(hide(10, 10)).toBe(false)
  })

  it('rounded-square: hides only at corners, not at edges or middle', () => {
    const hide = buildShapeMaskPredicate('rounded-square', count)
    expect(hide(0, 0)).toBe(true) // tight corner
    expect(hide(0, 10)).toBe(false) // mid-top edge
    expect(hide(10, 10)).toBe(false) // dead centre
  })

  it('custom svgPath: a diamond hides square corners', () => {
    const hide = buildShapeMaskPredicate(
      { svgPath: 'M0.5 0 L1 0.5 L0.5 1 L0 0.5 Z' },
      count
    )
    expect(hide(0, 0)).toBe(true) // outside the diamond
    expect(hide(10, 10)).toBe(false) // inside
  })

  it('falls back to no hiding when the custom path is unparseable', () => {
    const hide = buildShapeMaskPredicate({ svgPath: 'not a path at all' }, count)
    expect(hide(0, 0)).toBe(false)
    expect(hide(10, 10)).toBe(false)
  })
})
