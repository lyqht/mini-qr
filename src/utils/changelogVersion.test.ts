import { describe, expect, it } from 'vitest'
import { extractChangelogVersion, getDisplayVersion } from './changelogVersion'

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

  it('parses a release-please linked header and normalizes to a v-prefixed version', () => {
    const md =
      '## [0.31.0](https://github.com/lyqht/mini-qr/compare/v0.30.2...v0.31.0) (2026-06-10)'
    expect(getDisplayVersion(md, undefined)).toBe('v0.31.0')
  })

  it('still parses the legacy v-prefixed header', () => {
    expect(getDisplayVersion('## v0.30.2 (2026-05-25)', undefined)).toBe('v0.30.2')
  })

  it('parses a plain (unlinked) release-please header without a v prefix', () => {
    expect(getDisplayVersion('## 0.31.0 (2026-06-10)', undefined)).toBe('v0.31.0')
  })
})

describe('extractChangelogVersion', () => {
  it('returns the first version from a release-please linked header', () => {
    const md = [
      '# Changelog',
      '',
      '## [0.32.0](https://github.com/lyqht/mini-qr/compare/v0.31.0...v0.32.0) (2026-07-01)',
      '',
      '## [0.31.0](https://github.com/lyqht/mini-qr/compare/v0.30.2...v0.31.0) (2026-06-10)'
    ].join('\n')
    expect(extractChangelogVersion(md)).toBe('v0.32.0')
  })

  it('parses a plain release-please header without a v prefix', () => {
    expect(extractChangelogVersion('## 0.31.0 (2026-06-10)')).toBe('v0.31.0')
  })

  it('parses a legacy v-prefixed header', () => {
    expect(extractChangelogVersion('## v0.30.2 (2026-05-25)')).toBe('v0.30.2')
  })

  it('returns null when no version header is present', () => {
    expect(extractChangelogVersion('# Changelog\n\nNo releases yet.')).toBeNull()
  })
})
