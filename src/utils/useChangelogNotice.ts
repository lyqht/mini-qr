import { computed, ref } from 'vue'
import { fetchWithBasePath } from './basePath'
import { extractChangelogVersion } from './changelogVersion'

// Versioned key — `v1` lets us re-trigger the dot for everyone in the
// future by bumping the suffix if needed (e.g. when the changelog format
// or the notice semantics change in a breaking way).
const LAST_SEEN_KEY = 'miniqr.changelog.lastSeen.v1'

const latestVersion = ref<string | null>(null)
const lastSeenVersion = ref<string | null>(null)
const isLoading = ref(false)
let initialised = false
let fetchPromise: Promise<void> | null = null

function readLastSeen() {
  try {
    lastSeenVersion.value = localStorage.getItem(LAST_SEEN_KEY)
  } catch {
    lastSeenVersion.value = null
  }
}

async function fetchLatest() {
  if (fetchPromise) return fetchPromise
  isLoading.value = true
  fetchPromise = (async () => {
    try {
      const res = await fetchWithBasePath('/CHANGELOG.md')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const md = await res.text()
      latestVersion.value = extractChangelogVersion(md)
    } catch (err) {
      console.error('Failed to read latest changelog version:', err)
      latestVersion.value = null
    } finally {
      isLoading.value = false
    }
  })()
  return fetchPromise
}

const hasUnseenChangelog = computed(
  () => !!latestVersion.value && lastSeenVersion.value !== latestVersion.value
)

function markAsSeen() {
  if (!latestVersion.value) return
  lastSeenVersion.value = latestVersion.value
  try {
    localStorage.setItem(LAST_SEEN_KEY, latestVersion.value)
  } catch {
    /* state still flips for this session */
  }
}

export function useChangelogNotice() {
  if (!initialised) {
    initialised = true
    readLastSeen()
    fetchLatest()
  }
  return { latestVersion, hasUnseenChangelog, markAsSeen, isLoading }
}
