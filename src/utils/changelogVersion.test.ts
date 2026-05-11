import { describe, expect, it } from 'vitest'
import { getDisplayVersion } from './changelogVersion'

describe('getDisplayVersion', () => {
  it('returns the provided app version when it is valid', () => {
    expect(getDisplayVersion('## v0.26.3 (2025-08-01)', 'v0.28.0')).toBe('v0.28.0')
  })

  it('normalizes app version without a leading "v"', () => {
    expect(getDisplayVersion('## v0.26.3 (2025-08-01)', '0.28.0')).toBe('v0.28.0')
  })

  it('falls back to changelog version when app version is missing or invalid', () => {
    expect(getDisplayVersion('## v0.26.3 (2025-08-01)', undefined)).toBe('v0.26.3')
    expect(getDisplayVersion('## v0.26.3 (2025-08-01)', 'main')).toBe('v0.26.3')
  })

  it('returns N/A when no valid version is available', () => {
    expect(getDisplayVersion('# Changelog', 'main')).toBe('N/A')
  })
})
