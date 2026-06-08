import { describe, it, expect } from 'vitest'
import {
  SIMPLE_MODE_FIELD_KEYS,
  SIMPLE_MODE_FIELD_GROUPS,
  isValidSimpleFieldKey,
  sanitizeSimpleFields,
  isFieldVisibleInMode,
  type SimpleFieldKey
} from './simpleModeFields'

describe('simple mode field registry', () => {
  it('exposes the expected set of field keys', () => {
    expect([...SIMPLE_MODE_FIELD_KEYS].sort()).toEqual(
      [
        'preset',
        'logoImage',
        'logoBackground',
        'backgroundColor',
        'dotsColor',
        'cornersSquareColor',
        'cornersDotColor',
        'width',
        'height',
        'borderRadius',
        'margin',
        'imageMargin',
        'imageSize',
        'dotsType',
        'cornersSquareType',
        'cornersDotType',
        'errorCorrectionLevel',
        'frame'
      ].sort()
    )
  })

  it('groups cover every field key exactly once', () => {
    const grouped = SIMPLE_MODE_FIELD_GROUPS.flatMap((g) => g.fields.map((f) => f.key))
    expect([...grouped].sort()).toEqual([...SIMPLE_MODE_FIELD_KEYS].sort())
    expect(new Set(grouped).size).toBe(grouped.length)
  })

  it('every field has a translation label key', () => {
    for (const group of SIMPLE_MODE_FIELD_GROUPS) {
      expect(group.labelKey.length).toBeGreaterThan(0)
      for (const field of group.fields) {
        expect(field.labelKey.length).toBeGreaterThan(0)
      }
    }
  })
})

describe('isValidSimpleFieldKey', () => {
  it('accepts known keys', () => {
    expect(isValidSimpleFieldKey('dotsColor')).toBe(true)
  })

  it('rejects unknown keys', () => {
    expect(isValidSimpleFieldKey('not-a-field')).toBe(false)
    expect(isValidSimpleFieldKey('')).toBe(false)
  })
})

describe('sanitizeSimpleFields', () => {
  it('keeps only known keys', () => {
    expect(sanitizeSimpleFields(['dotsColor', 'bogus', 'frame'])).toEqual(['dotsColor', 'frame'])
  })

  it('removes duplicates', () => {
    expect(sanitizeSimpleFields(['width', 'width'])).toEqual(['width'])
  })

  it('returns [] for non-array input', () => {
    expect(sanitizeSimpleFields('nope' as unknown as string[])).toEqual([])
    expect(sanitizeSimpleFields(null as unknown as string[])).toEqual([])
  })
})

describe('isFieldVisibleInMode', () => {
  const pinned: SimpleFieldKey[] = ['dotsColor']

  it('shows every field in full mode regardless of pins', () => {
    expect(isFieldVisibleInMode('full', [], 'errorCorrectionLevel')).toBe(true)
    expect(isFieldVisibleInMode('full', pinned, 'width')).toBe(true)
  })

  it('in simple mode shows only pinned fields', () => {
    expect(isFieldVisibleInMode('simple', pinned, 'dotsColor')).toBe(true)
    expect(isFieldVisibleInMode('simple', pinned, 'width')).toBe(false)
  })

  it('in simple mode with no pins shows nothing', () => {
    expect(isFieldVisibleInMode('simple', [], 'preset')).toBe(false)
  })
})
