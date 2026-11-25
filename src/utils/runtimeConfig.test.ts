import { afterEach, describe, expect, it, vi } from 'vitest'
import { getBoolEnv, getEnv } from './runtimeConfig'

describe('getEnv', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('prefers the value set at container start over the build-time value', () => {
    vi.stubEnv('VITE_FIELDS_VISIBLE', 'dotsColor')
    vi.stubGlobal('window', {
      __MINI_QR_CONFIG__: { env: { VITE_FIELDS_VISIBLE: 'frameText' } }
    })
    expect(getEnv('VITE_FIELDS_VISIBLE')).toBe('frameText')
  })

  it('falls back to the build-time value when nothing is set at runtime', () => {
    vi.stubEnv('VITE_FIELDS_VISIBLE', 'dotsColor')
    vi.stubGlobal('window', { __MINI_QR_CONFIG__: {} })
    expect(getEnv('VITE_FIELDS_VISIBLE')).toBe('dotsColor')
  })

  it.each(['true', 'TRUE', '1'])('reads %s as true', (value) => {
    vi.stubGlobal('window', { __MINI_QR_CONFIG__: { env: { VITE_HIDE_CREDITS: value } } })
    expect(getBoolEnv('VITE_HIDE_CREDITS')).toBe(true)
  })
})
