const VERSION_PATTERN = /^v\d+\.\d+\.\d+$/
const CHANGELOG_VERSION_PATTERN = /^##\s+(v\d+\.\d+\.\d+)/m

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

  const versionMatch = markdown.match(CHANGELOG_VERSION_PATTERN)
  if (versionMatch && versionMatch[1]) {
    return versionMatch[1]
  }

  return 'N/A'
}
