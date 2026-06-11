import { describe, it, expect } from 'vitest'
import {
  SIMPLE_MODE_FIELD_KEYS,
  SIMPLE_MODE_FIELD_GROUPS,
  FRAME_FIELD_KEYS,
  isValidSimpleFieldKey,
  sanitizeSimpleFields,
  isFieldVisibleInMode,
  parseVisibleFields,
  hasFrameField,
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
        'framePreset',
        'frameText',
        'framePosition',
        'frameWidth',
        'frameTextColor',
        'frameBackground',
        'frameBorderColor',
        'frameBorderWidth',
        'frameBorderRadius',
        'framePadding',
        'frameFontFamily'
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

  it('groups the frame fields behind an enable toggle', () => {
    const frameGroup = SIMPLE_MODE_FIELD_GROUPS.find((g) => g.labelKey === 'Frame settings')
    expect(frameGroup?.enableToggleLabelKey).toBe('Add frame')
    expect(frameGroup?.fields.map((f) => f.key).sort()).toEqual([...FRAME_FIELD_KEYS].sort())
  })

  it('only the frame group is gated by an enable toggle', () => {
    const gated = SIMPLE_MODE_FIELD_GROUPS.filter((g) => g.enableToggleLabelKey)
    expect(gated).toHaveLength(1)
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
    expect(sanitizeSimpleFields(['dotsColor', 'bogus', 'framePreset'])).toEqual([
      'dotsColor',
      'framePreset'
    ])
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

describe('parseVisibleFields', () => {
  it('returns [] for empty/undefined input', () => {
    expect(parseVisibleFields(undefined)).toEqual([])
    expect(parseVisibleFields('')).toEqual([])
    expect(parseVisibleFields('   ')).toEqual([])
  })

  it('splits on commas and whitespace, keeping known keys', () => {
    expect(parseVisibleFields('dotsColor, width')).toEqual(['dotsColor', 'width'])
    expect(parseVisibleFields('dotsColor width\nframeText')).toEqual([
      'dotsColor',
      'width',
      'frameText'
    ])
  })

  it('drops unknown keys and duplicates', () => {
    expect(parseVisibleFields('dotsColor,bogus,dotsColor,framePreset')).toEqual([
      'dotsColor',
      'framePreset'
    ])
  })
})

describe('hasFrameField', () => {
  it('detects frame keys', () => {
    expect(hasFrameField(['dotsColor', 'frameText'])).toBe(true)
    expect(hasFrameField(['framePreset'])).toBe(true)
  })

  it('is false when no frame keys present', () => {
    expect(hasFrameField(['dotsColor', 'width'])).toBe(false)
    expect(hasFrameField([])).toBe(false)
  })
})
