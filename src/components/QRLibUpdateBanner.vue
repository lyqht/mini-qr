<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQRLibBanner } from '@/utils/useQRLibBanner'

const { t } = useI18n()
const { isDismissed, dismiss } = useQRLibBanner()

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
    v-if="!isDismissed"
    role="status"
    class="mb-4 flex flex-col items-start gap-3 rounded-lg border border-zinc-300 bg-zinc-100 px-4 py-3 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="flex items-start gap-3">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="mt-0.5 shrink-0 text-[#abcbca]"
        width="20"
        height="20"
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
        class="inline-flex items-center gap-1 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 outline-none transition-colors hover:bg-zinc-50 focus-visible:ring-1 focus-visible:ring-zinc-700 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600 dark:focus-visible:ring-zinc-200 sm:text-sm"
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
        class="rounded-md p-1.5 text-zinc-600 outline-none transition-colors hover:bg-zinc-200 focus-visible:ring-1 focus-visible:ring-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:focus-visible:ring-zinc-200"
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
