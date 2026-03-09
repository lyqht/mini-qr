import { describe, it, expect } from 'vitest'
import { isValidFrameStyle, isValidFrameConfig } from './framePresets'

const validStyle = {
  textColor: '#000000',
  backgroundColor: '#ffffff',
  borderColor: '#000000',
  borderWidth: '1px',
  borderRadius: '8px',
  padding: '16px'
}

describe('isValidFrameStyle', () => {
  it('returns true for a valid FrameStyle object', () => {
    expect(isValidFrameStyle(validStyle)).toBe(true)
  })

  it('returns false for null or non-object', () => {
    expect(isValidFrameStyle(null)).toBe(false)
    expect(isValidFrameStyle('string')).toBe(false)
    expect(isValidFrameStyle(42)).toBe(false)
  })

  it('returns false when a field is missing', () => {
    const { padding: _omitted, ...withoutPadding } = validStyle
    expect(isValidFrameStyle(withoutPadding)).toBe(false)
  })

  it('returns false when a color field is not a valid CSS color', () => {
    expect(isValidFrameStyle({ ...validStyle, textColor: 'not-a-color-##' })).toBe(false)
  })

  it('returns false when a length field is not a valid CSS length', () => {
    expect(isValidFrameStyle({ ...validStyle, borderWidth: '1' })).toBe(false)
    expect(isValidFrameStyle({ ...validStyle, padding: 'abc' })).toBe(false)
  })
})

describe('isValidFrameConfig', () => {
  const validConfig = { text: 'Scan me', position: 'bottom', style: validStyle }

  it('returns true for a valid frame config', () => {
    expect(isValidFrameConfig(validConfig)).toBe(true)
  })

  it('returns true for all valid positions', () => {
    for (const pos of ['top', 'bottom', 'left', 'right']) {
      expect(isValidFrameConfig({ ...validConfig, position: pos })).toBe(true)
    }
  })

  it('returns false for an invalid position', () => {
    expect(isValidFrameConfig({ ...validConfig, position: 'diagonal' })).toBe(false)
    expect(isValidFrameConfig({ ...validConfig, position: '' })).toBe(false)
  })

  it('returns false when text is not a string', () => {
    expect(isValidFrameConfig({ ...validConfig, text: 42 })).toBe(false)
  })

  it('returns false when style is invalid', () => {
    expect(isValidFrameConfig({ ...validConfig, style: { textColor: '#000' } })).toBe(false)
  })

  it('returns false for null or non-object', () => {
    expect(isValidFrameConfig(null)).toBe(false)
    expect(isValidFrameConfig(undefined)).toBe(false)
  })
})
