import { describe, expect, it } from 'vitest'
import { computeImagePlacement, resolveEffectiveErrorCorrectionLevel } from './image'
import { buildMatrix } from '../matrix'

describe('resolveEffectiveErrorCorrectionLevel', () => {
  it('leaves the level untouched when no image is set', () => {
    expect(resolveEffectiveErrorCorrectionLevel(false, 'L')).toBe('L')
    expect(resolveEffectiveErrorCorrectionLevel(false, 'M')).toBe('M')
  })

  it('boosts L and M up to Q when an image is set (#309: L/M have too little redundancy for a logo)', () => {
    expect(resolveEffectiveErrorCorrectionLevel(true, 'L')).toBe('Q')
    expect(resolveEffectiveErrorCorrectionLevel(true, 'M')).toBe('Q')
  })

  it('leaves Q and H untouched when an image is set — they already meet the floor', () => {
    expect(resolveEffectiveErrorCorrectionLevel(true, 'Q')).toBe('Q')
    expect(resolveEffectiveErrorCorrectionLevel(true, 'H')).toBe('H')
  })
})

describe('computeImagePlacement safety cap (#309)', () => {
  // Regression guard for a real generated-and-scanned failure: a short URL at
  // level Q with sizeRatio 0.7 hid enough of the matrix that a real QR
  // decoder (jsQR) could no longer read the exported PNG, even though the
  // pre-fix formula allowed sizeRatio up to 1.0.
  it('never hides more than 30% of the matrix width, regardless of sizeRatio', () => {
    const { count } = buildMatrix('https://a.co', 'Q')
    for (const sizeRatio of [0.4, 0.6, 0.8, 1.0]) {
      const placement = computeImagePlacement({
        image: { href: 'logo.png', sizeRatio },
        count,
        moduleSize: 1,
        offset: 0,
        totalSize: count,
        errorCorrectionLevel: 'Q'
      })
      const hiddenAxisDots = placement.size // moduleSize is 1, so size === axis dot count
      expect(hiddenAxisDots / count).toBeLessThanOrEqual(0.3)
    }
  })

  it('does not shrink the previous default (sizeRatio 0.4) footprint for typical data', () => {
    const { count } = buildMatrix('https://mercyhill.managedmissions.com/MyTrip/shanereichart', 'Q')
    const placement = computeImagePlacement({
      image: { href: 'logo.png', sizeRatio: 0.4 },
      count,
      moduleSize: 1,
      offset: 0,
      totalSize: count,
      errorCorrectionLevel: 'Q'
    })
    // Pre-fix this was 11/37 (~29.7%) — comfortably under the new 30% cap,
    // so the default experience is unaffected by the safety clamp.
    expect(placement.size).toBe(11)
  })
})

describe('computeImagePlacement aspect ratio (#329)', () => {
  const { count } = buildMatrix('https://mercyhill.managedmissions.com/MyTrip/shanereichart', 'Q')
  const place = (aspectRatio?: number) =>
    computeImagePlacement({
      image: { href: 'logo.png', sizeRatio: 0.4, aspectRatio },
      count,
      moduleSize: 1,
      offset: 0,
      totalSize: count,
      errorCorrectionLevel: 'Q'
    })
  const hiddenCells = (placement: ReturnType<typeof place>) => {
    let hidden = 0
    for (let r = 0; r < count; r++)
      for (let c = 0; c < count; c++) if (placement.hidesCell(r, c)) hidden++
    return hidden
  }

  it('keeps a wide logo wide and a tall logo tall, within the square limit', () => {
    const square = place()
    const wide = place(3)
    const tall = place(1 / 3)

    expect(wide.width).toBe(square.width)
    expect(wide.height).toBeLessThan(square.height)
    expect(tall.height).toBe(square.height)
    expect(tall.width).toBeLessThan(square.width)
    expect(hiddenCells(wide)).toBe(wide.width * wide.height)
    expect(hiddenCells(wide)).toBeLessThan(hiddenCells(square))
  })

  it('treats a missing or invalid ratio as square', () => {
    const square = place()
    for (const ratio of [undefined, 0, -2, Number.NaN, Number.POSITIVE_INFINITY]) {
      const placement = place(ratio)
      expect(placement.width).toBe(square.width)
      expect(placement.height).toBe(square.height)
    }
  })
})
