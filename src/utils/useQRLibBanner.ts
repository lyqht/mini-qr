import { onMounted, ref } from 'vue'

// Versioned key — bump the suffix when announcing a new round of QR-lib
// changes so older dismissals don't suppress the new banner.
const BANNER_KEY = 'miniqr.banner.qr-lib-v1.dismissed'

// Shared singleton state across every consumer of the composable so the
// desktop info button, the mobile-menu hamburger dot, and the banner
// itself stay in sync without prop drilling.
const isDismissed = ref(true)
let initialised = false

function readStorage() {
  try {
    isDismissed.value = localStorage.getItem(BANNER_KEY) === '1'
  } catch {
    // localStorage unavailable (private mode etc.) — show the banner.
    isDismissed.value = false
  }
}

function init() {
  if (initialised) return
  initialised = true
  readStorage()
}

function dismiss() {
  isDismissed.value = true
  try {
    localStorage.setItem(BANNER_KEY, '1')
  } catch {
    /* state still flips for this session */
  }
}

function reopen() {
  isDismissed.value = false
  try {
    localStorage.removeItem(BANNER_KEY)
  } catch {
    /* state still flips for this session */
  }
}

export function useQRLibBanner() {
  onMounted(init)
  return { isDismissed, dismiss, reopen }
}
