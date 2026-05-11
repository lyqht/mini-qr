<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Bump this when announcing a new round of QR-lib changes — older
// dismissals won't suppress the new banner.
const BANNER_KEY = 'miniqr.banner.qr-lib-v1.dismissed'

// Pre-filled body for the report link. Keep it short and structured so
// users (and triage) can scan it; the URL gets percent-encoded below.
const REPORT_TITLE = '[QR lib] '
const REPORT_BODY = `Found an issue after the QR rendering engine update? Please fill in below.

**What were you doing?**
(e.g. typed Vietnamese text, then exported as SVG)

**What did you expect?**

**What actually happened?**
(include a screenshot if a render looks off, or the input string if scanning fails)

**Browser + OS:**
`

const isDismissed = ref(true)

onMounted(() => {
  try {
    isDismissed.value = localStorage.getItem(BANNER_KEY) === '1'
  } catch {
    // localStorage unavailable (private mode etc.) — show the banner.
    isDismissed.value = false
  }
})

const isVisible = computed(() => !isDismissed.value)

function dismiss() {
  isDismissed.value = true
  try {
    localStorage.setItem(BANNER_KEY, '1')
  } catch {
    /* ignore — banner stays dismissed for this session via state */
  }
}

const reportIssueHref = computed(() => {
  const params = new URLSearchParams({
    title: REPORT_TITLE,
    body: REPORT_BODY,
    labels: 'bug,qr-lib'
  })
  return `https://github.com/lyqht/mini-qr/issues/new?${params.toString()}`
})
</script>

<template>
  <div
    v-if="isVisible"
    role="status"
    class="mx-auto mb-4 flex w-5/6 flex-col items-start gap-3 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100 sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="flex items-start gap-3">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="mt-0.5 shrink-0"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
      <p class="m-0 leading-relaxed">
        {{ t("MiniQR's QR rendering engine has been updated.") }}
        {{ t('Vector SVG export and full UTF-8 input are now supported.') }}
        <span class="block sm:inline">
          {{ t('Spot a regression?') }}
        </span>
      </p>
    </div>
    <div class="flex w-full shrink-0 items-center gap-2 sm:w-auto">
      <a
        :href="reportIssueHref"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white outline-none hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 sm:text-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
        {{ t('Report an issue') }}
      </a>
      <button
        type="button"
        @click="dismiss"
        :aria-label="t('Dismiss banner')"
        class="rounded-md p-1.5 text-emerald-900 outline-none hover:bg-emerald-100 focus-visible:ring-2 focus-visible:ring-emerald-700 dark:text-emerald-100 dark:hover:bg-emerald-900/50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  </div>
</template>
