import { describe, it, expect, beforeEach } from 'vitest'
import {
  isLocalStorageEnabled,
  hasStoredQRConfig,
  serializeQRConfig,
  saveQRConfig,
  loadQRConfig,
  QR_CODE_STORAGE_KEY,
  LAST_LOADED_LOCALLY_PRESET_KEY,
  LOADED_FROM_FILE_PRESET_KEY,
  CUSTOM_LOADED_PRESET_KEYS,
  type QRCodeConfig
} from './useQRCodeStorage'

const sampleConfig: QRCodeConfig = {
  props: {
    data: 'https://example.com',
    width: 200,
    height: 200,
    margin: 0,
    dotsOptions: { color: '#000000', type: 'square' },
    cornersSquareOptions: { color: '#000000', type: 'square' },
    cornersDotOptions: { color: '#000000', type: 'square' },
    imageOptions: { margin: 0 },
    backgroundOptions: { color: 'transparent' }
  },
  style: { borderRadius: '8px', background: '#ffffff' },
  frame: null
}

const sampleConfigWithFrame: QRCodeConfig = {
  ...sampleConfig,
  frame: {
    text: 'Scan me',
    position: 'bottom',
    style: {
      textColor: '#000000',
      backgroundColor: '#ffffff',
      borderColor: '#000000',
      borderWidth: '1px',
      borderRadius: '8px',
      padding: '16px'
    }
  }
}

const sampleConfigWithFrameFont: QRCodeConfig = {
  ...sampleConfig,
  frame: {
    text: 'Scan me',
    position: 'bottom',
    style: {
      textColor: '#000000',
      backgroundColor: '#ffffff',
      borderColor: '#000000',
      borderWidth: '1px',
      borderRadius: '8px',
      padding: '16px',
      fontFamily: "'Roboto', sans-serif"
    }
  }
}

describe('Constants', () => {
  it('exports the correct storage key', () => {
    expect(QR_CODE_STORAGE_KEY).toBe('qrCodeConfig')
  })

  it('exports the correct preset keys', () => {
    expect(LAST_LOADED_LOCALLY_PRESET_KEY).toBe('Last saved locally')
    expect(LOADED_FROM_FILE_PRESET_KEY).toBe('Loaded from file')
    expect(CUSTOM_LOADED_PRESET_KEYS).toContain(LAST_LOADED_LOCALLY_PRESET_KEY)
    expect(CUSTOM_LOADED_PRESET_KEYS).toContain(LOADED_FROM_FILE_PRESET_KEY)
  })
})

describe('isLocalStorageEnabled', () => {
  it('returns true in the test environment (VITE_DISABLE_LOCAL_STORAGE is not set to "true")', () => {
    expect(isLocalStorageEnabled()).toBe(true)
  })
})

describe('serializeQRConfig', () => {
  it('returns a config with the provided props, style, and frame', () => {
    const config = serializeQRConfig(sampleConfig.props, sampleConfig.style, null)
    expect(config.props).toEqual(sampleConfig.props)
    expect(config.style).toEqual(sampleConfig.style)
    expect(config.frame).toBeNull()
  })

  it('includes frame config when provided', () => {
    const config = serializeQRConfig(
      sampleConfigWithFrame.props,
      sampleConfigWithFrame.style,
      sampleConfigWithFrame.frame!
    )
    expect(config.frame).toEqual(sampleConfigWithFrame.frame)
  })
})

describe('saveQRConfig and loadQRConfig', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves config to localStorage as JSON', () => {
    saveQRConfig(sampleConfig)
    const stored = localStorage.getItem(QR_CODE_STORAGE_KEY)
    expect(stored).not.toBeNull()
    expect(JSON.parse(stored!)).toEqual(sampleConfig)
  })

  it('loads a previously saved config from localStorage', () => {
    saveQRConfig(sampleConfig)
    const loaded = loadQRConfig()
    expect(loaded).toEqual(sampleConfig)
  })

  it('loads config with frame data correctly', () => {
    saveQRConfig(sampleConfigWithFrame)
    const loaded = loadQRConfig()
    expect(loaded?.frame?.text).toBe('Scan me')
    expect(loaded?.frame?.position).toBe('bottom')
    expect(loaded?.frame?.style.textColor).toBe('#000000')
  })

  it('returns null when nothing is stored', () => {
    const loaded = loadQRConfig()
    expect(loaded).toBeNull()
  })

  it('returns null when stored value is invalid JSON', () => {
    localStorage.setItem(QR_CODE_STORAGE_KEY, 'not-valid-json{')
    const loaded = loadQRConfig()
    expect(loaded).toBeNull()
  })

  it('returns null when stored config is missing props', () => {
    localStorage.setItem(QR_CODE_STORAGE_KEY, JSON.stringify({ style: { borderRadius: '8px' } }))
    expect(loadQRConfig()).toBeNull()
  })

  it('returns null when stored config is missing style.borderRadius', () => {
    localStorage.setItem(
      QR_CODE_STORAGE_KEY,
      JSON.stringify({ props: {}, style: { background: '#fff' } })
    )
    expect(loadQRConfig()).toBeNull()
  })

  it('returns null when frame has an invalid position', () => {
    const bad = {
      ...sampleConfig,
      frame: { ...sampleConfigWithFrame.frame, position: 'diagonal' }
    }
    localStorage.setItem(QR_CODE_STORAGE_KEY, JSON.stringify(bad))
    expect(loadQRConfig()).toBeNull()
  })

  it('returns null when frame style is missing required fields', () => {
    const bad = {
      ...sampleConfig,
      frame: { text: 'hi', position: 'bottom', style: { textColor: '#000' } }
    }
    localStorage.setItem(QR_CODE_STORAGE_KEY, JSON.stringify(bad))
    expect(loadQRConfig()).toBeNull()
  })

  it('persists and restores fontFamily in frame style', () => {
    saveQRConfig(sampleConfigWithFrameFont)
    const loaded = loadQRConfig()
    expect(loaded?.frame?.style.fontFamily).toBe("'Roboto', sans-serif")
  })

  it('loads config with fontFamily absent in frame style', () => {
    saveQRConfig(sampleConfigWithFrame)
    const loaded = loadQRConfig()
    expect(loaded?.frame?.style.fontFamily).toBeUndefined()
  })

  it('returns null when fontFamily in frame style is not a string', () => {
    const bad = {
      ...sampleConfigWithFrame,
      frame: {
        ...sampleConfigWithFrame.frame,
        style: { ...sampleConfigWithFrame.frame!.style, fontFamily: 42 }
      }
    }
    localStorage.setItem(QR_CODE_STORAGE_KEY, JSON.stringify(bad))
    expect(loadQRConfig()).toBeNull()
  })

  it('returns the config when frame is null', () => {
    saveQRConfig(sampleConfig)
    expect(loadQRConfig()).toEqual(sampleConfig)
  })

  it('overwrites previous config when saved again', () => {
    saveQRConfig(sampleConfig)
    const updated: QRCodeConfig = { ...sampleConfig, style: { borderRadius: '0px' } }
    saveQRConfig(updated)
    const loaded = loadQRConfig()
    expect(loaded?.style.borderRadius).toBe('0px')
  })
})

describe('hasStoredQRConfig', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns false when nothing is stored', () => {
    expect(hasStoredQRConfig()).toBe(false)
  })

  it('returns true after saving a config', () => {
    saveQRConfig(sampleConfig)
    expect(hasStoredQRConfig()).toBe(true)
  })
})
