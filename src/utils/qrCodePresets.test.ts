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

  describe('props.image (logo) validation', () => {
    function withImage(image: unknown) {
      return { ...validConfig, props: { ...validConfig.props, image } }
    }

    it('returns true when image is absent', () => {
      expect(isValidQRCodeConfig(validConfig)).toBe(true)
    })

    it('returns true when image is an empty string', () => {
      expect(isValidQRCodeConfig(withImage(''))).toBe(true)
    })

    it('returns true when image is an http(s) URL', () => {
      expect(isValidQRCodeConfig(withImage('https://api.iconify.design/logos:vue.svg'))).toBe(true)
      expect(isValidQRCodeConfig(withImage('http://example.com/logo.png'))).toBe(true)
    })

    it('returns true when image is a data:image URI (uploaded logo)', () => {
      expect(isValidQRCodeConfig(withImage('data:image/png;base64,iVBORw0KGgo='))).toBe(true)
    })

    it('returns true when image is a same-origin asset path (preset placeholder)', () => {
      // Vite asset imports resolve to paths like this at runtime.
      expect(isValidQRCodeConfig(withImage('/assets/placeholder_image-DZ2mUx9p.png'))).toBe(true)
      expect(isValidQRCodeConfig(withImage('./assets/placeholder_image.png'))).toBe(true)
    })

    it('returns false when image has a non-http(s), non-image scheme', () => {
      expect(isValidQRCodeConfig(withImage('javascript:alert(1)'))).toBe(false)
      expect(isValidQRCodeConfig(withImage('data:text/html,<script>alert(1)</script>'))).toBe(false)
      expect(isValidQRCodeConfig(withImage('file:///etc/passwd'))).toBe(false)
      expect(isValidQRCodeConfig(withImage('vbscript:msgbox(1)'))).toBe(false)
    })

    it('returns false when image is not a string', () => {
      expect(isValidQRCodeConfig(withImage(42))).toBe(false)
      expect(isValidQRCodeConfig(withImage({ href: 'https://example.com/x.png' }))).toBe(false)
    })
  })
})
