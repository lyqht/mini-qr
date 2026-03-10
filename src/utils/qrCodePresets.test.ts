import { describe, it, expect } from 'vitest'
import { isValidQRCodeConfig } from './qrCodePresets'

const validStyle = {
  textColor: '#000000',
  backgroundColor: '#ffffff',
  borderColor: '#000000',
  borderWidth: '1px',
  borderRadius: '8px',
  padding: '16px'
}

const validConfig = {
  props: { data: 'https://example.com', width: 200, height: 200 },
  style: { borderRadius: '8px', background: '#ffffff' },
  frame: null
}

describe('isValidQRCodeConfig', () => {
  it('returns true for a valid config without a frame', () => {
    expect(isValidQRCodeConfig(validConfig)).toBe(true)
  })

  it('returns true for a valid config with a frame', () => {
    const withFrame = {
      ...validConfig,
      frame: { text: 'Scan me', position: 'bottom', style: validStyle }
    }
    expect(isValidQRCodeConfig(withFrame)).toBe(true)
  })

  it('returns true when frame is explicitly null', () => {
    expect(isValidQRCodeConfig({ ...validConfig, frame: null })).toBe(true)
  })

  it('returns false for null or non-object', () => {
    expect(isValidQRCodeConfig(null)).toBe(false)
    expect(isValidQRCodeConfig('string')).toBe(false)
    expect(isValidQRCodeConfig(42)).toBe(false)
  })

  it('returns false when props is missing', () => {
    const { props: _omitted, ...withoutProps } = validConfig
    expect(isValidQRCodeConfig(withoutProps)).toBe(false)
  })

  it('returns false when props is not an object', () => {
    expect(isValidQRCodeConfig({ ...validConfig, props: 'bad' })).toBe(false)
  })

  it('returns false when style is missing', () => {
    const { style: _omitted, ...withoutStyle } = validConfig
    expect(isValidQRCodeConfig(withoutStyle)).toBe(false)
  })

  it('returns false when style.borderRadius is not a string', () => {
    expect(isValidQRCodeConfig({ ...validConfig, style: { borderRadius: 8 } })).toBe(false)
  })

  it('returns false when frame has an invalid position', () => {
    const withBadFrame = {
      ...validConfig,
      frame: { text: 'hi', position: 'diagonal', style: validStyle }
    }
    expect(isValidQRCodeConfig(withBadFrame)).toBe(false)
  })

  it('returns false when frame style is incomplete', () => {
    const withBadFrame = {
      ...validConfig,
      frame: { text: 'hi', position: 'bottom', style: { textColor: '#000' } }
    }
    expect(isValidQRCodeConfig(withBadFrame)).toBe(false)
  })
})
