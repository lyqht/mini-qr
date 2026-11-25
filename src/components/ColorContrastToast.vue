<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(
  defineProps<{
    /** Warning to show, or null when the colors are fine. */
    message: string | null
    /** How long the toast stays up, in milliseconds. */
    duration?: number
  }>(),
  { duration: 6000 }
)

const { t } = useI18n()

const visible = ref(false)
const shownMessage = ref('')
// Wait for the color picker to settle so dragging through a bad color
// doesn't flash a toast for every intermediate value.
const SETTLE_DELAY_MS = 400
let settleTimer: ReturnType<typeof setTimeout> | undefined
let hideTimer: ReturnType<typeof setTimeout> | undefined

function hide() {
  clearTimeout(hideTimer)
  visible.value = false
}

watch(
  () => props.message,
  (message) => {
    clearTimeout(settleTimer)
    if (!message) {
      // Colors are fine again: drop the toast so the next bad combo shows anew.
      shownMessage.value = ''
      hide()
      return
    }
    settleTimer = setTimeout(() => {
      // Only show once per warning; staying on the same bad combo doesn't re-toast.
      if (message === shownMessage.value) return
      shownMessage.value = message
      visible.value = true
      clearTimeout(hideTimer)
      hideTimer = setTimeout(hide, props.duration)
    }, SETTLE_DELAY_MS)
  }
)

onUnmounted(() => {
  clearTimeout(settleTimer)
  clearTimeout(hideTimer)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div
        v-if="visible"
        role="status"
        aria-live="polite"
        data-testid="color-contrast-toast"
        class="fixed inset-x-4 top-20 z-[60] mx-auto flex max-w-md items-start gap-3 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-lg dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200 md:inset-x-auto md:bottom-6 md:right-6 md:top-auto"
      >
        <p class="m-0 flex-1 text-sm">{{ shownMessage }}</p>
        <button
          type="button"
          class="-m-1 shrink-0 rounded p-1 text-amber-900 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-900"
          :aria-label="t('Close')"
          @click="hide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"
            />
          </svg>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>
