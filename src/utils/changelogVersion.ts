const VERSION_PATTERN = /^v\d+\.\d+\.\d+$/
// Matches both legacy "## v0.30.0 (date)" and release-please
// "## [0.31.0](compare-url) (date)" / "## 0.31.0 (date)" headers.
const CHANGELOG_VERSION_PATTERN = /^##\s+\[?v?(\d+\.\d+\.\d+)/m

/**
 * Extracts the most recent version from changelog markdown, normalized to a
 * `v`-prefixed string (e.g. "v0.31.0"). Returns null when no version header is
 * found. Shared by the version badge and the unseen-changelog notice so the two
 * parsers can't drift apart.
 */
export function extractChangelogVersion(markdown: string): string | null {
  const versionMatch = markdown.match(CHANGELOG_VERSION_PATTERN)
  return versionMatch && versionMatch[1] ? `v${versionMatch[1]}` : null
}

export function getDisplayVersion(markdown: string, appVersion?: string): string {
  const normalizedAppVersion = appVersion?.trim()

  if (normalizedAppVersion) {
    if (VERSION_PATTERN.test(normalizedAppVersion)) {
      return normalizedAppVersion
    }

    if (VERSION_PATTERN.test(`v${normalizedAppVersion}`)) {
      return `v${normalizedAppVersion}`
    }
  }

  return extractChangelogVersion(markdown) ?? 'N/A'
}
