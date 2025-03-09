<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import LanguageSelector from '@/components/LanguageSelector.vue'
import QRCodeCapture from '@/components/QRCodeCapture.vue'
import QRCodeCreate from '@/components/QRCodeCreate.vue'
import useDarkModePreference from '@/utils/useDarkModePreference'

const { t } = useI18n()
const { isDarkMode, isDarkModePreferenceSetBySystem, toggleDarkModePreference } =
  useDarkModePreference()

enum AppMode {
  Create = 'create',
  Capture = 'capture'
}

const appMode = ref<AppMode>(AppMode.Create)
const capturedData = ref<string>('')

const toggleAppMode = () => {
  if (appMode.value === AppMode.Capture && qrCodeCaptureRef.value?.capturedData) {
    capturedData.value = qrCodeCaptureRef.value.capturedData
  }

  appMode.value = appMode.value === AppMode.Create ? AppMode.Capture : AppMode.Create
}

const qrCodeCaptureRef = ref<InstanceType<typeof QRCodeCapture> | null>(null)

const useCapturedDataInCreateMode = (data: string) => {
  capturedData.value = data
  appMode.value = AppMode.Create
}

const isModeToggleDisabled = computed(() => {
  return (
    appMode.value === AppMode.Capture &&
    !!qrCodeCaptureRef.value &&
    !!(qrCodeCaptureRef.value.isLoading || qrCodeCaptureRef.value.isCapturing)
  )
})
</script>

<template>
  <main>
    <div
      class="relative grid min-h-screen place-items-center items-start bg-white p-8 dark:bg-zinc-900 md:px-6"
    >
      <div
        id="header"
        class="mb-8 flex w-full flex-row flex-wrap justify-between gap-4 md:mb-4 md:w-5/6 md:ps-4"
      >
        <div class="flex items-center gap-2">
          <h1 class="text-3xl text-gray-700 dark:text-gray-100">MiniQR</h1>
        </div>
        <div class="flex flex-row items-center justify-end gap-4">
          <div class="flex flex-row items-center gap-2">
            <!-- Mode toggle button -->
            <button
              class="icon-button flex flex-row items-center gap-1"
              @click="toggleAppMode"
              :disabled="isModeToggleDisabled"
              :aria-label="
                appMode === AppMode.Create
                  ? t('Switch to Capture Mode')
                  : t('Switch to Create Mode')
              "
            >
              <span v-if="appMode === AppMode.Create">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
                  <path
                    fill="#abcbca"
                    d="M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6m0 8a5 5 0 1 1 0-10a5 5 0 0 1 0 10m0-12a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m4.5 1.5a1.5 1.5 0 0 1 1.5 1.5a1.5 1.5 0 0 1-1.5 1.5a1.5 1.5 0 0 1-1.5-1.5a1.5 1.5 0 0 1 1.5-1.5M20 4h-3.17l-1.24-1.35A1.99 1.99 0 0 0 14.12 2H9.88c-.56 0-1.1.24-1.48.65L7.17 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2"
                  />
                </svg>
              </span>
              <span v-else>
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
                  <path
                    fill="#abcbca"
                    d="M3 11h8V3H3zm2-6h4v4H5zM3 21h8v-8H3zm2-6h4v4H5zm8-12v8h8V3zm6 6h-4V5h4zm-6 12h8v-8h-8zm2-6h4v4h-4z"
                  />
                </svg>
              </span>
              <span class="hidden text-sm text-zinc-700 dark:text-zinc-300 md:inline">
                {{ appMode === AppMode.Create ? t('Capture QR') : t('Create QR') }}
              </span>
            </button>
            <div class="vertical-border"></div>
            <a
              class="icon-button"
              href="https://github.com/lyqht/styled-qr-code-generator"
              target="_blank"
              :aria-label="t('GitHub repository for this project')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
                <path
                  fill="#abcbca"
                  d="M12.001 2c-5.525 0-10 4.475-10 10a9.994 9.994 0 0 0 6.837 9.488c.5.087.688-.213.688-.476c0-.237-.013-1.024-.013-1.862c-2.512.463-3.162-.612-3.362-1.175c-.113-.288-.6-1.175-1.025-1.413c-.35-.187-.85-.65-.013-.662c.788-.013 1.35.725 1.538 1.025c.9 1.512 2.337 1.087 2.912.825c.088-.65.35-1.087.638-1.337c-2.225-.25-4.55-1.113-4.55-4.938c0-1.088.387-1.987 1.025-2.688c-.1-.25-.45-1.275.1-2.65c0 0 .837-.262 2.75 1.026a9.28 9.28 0 0 1 2.5-.338c.85 0 1.7.112 2.5.337c1.913-1.3 2.75-1.024 2.75-1.024c.55 1.375.2 2.4.1 2.65c.637.7 1.025 1.587 1.025 2.687c0 3.838-2.337 4.688-4.563 4.938c.363.312.676.912.676 1.85c0 1.337-.013 2.412-.013 2.75c0 .262.188.574.688.474A10.016 10.016 0 0 0 22 12c0-5.525-4.475-10-10-10Z"
                />
              </svg>
            </a>
            <div class="vertical-border"></div>
            <button
              class="icon-button"
              @click="toggleDarkModePreference"
              :aria-label="t('Toggle dark mode')"
            >
              <span v-if="isDarkModePreferenceSetBySystem">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
                  <g fill="#abcabc">
                    <path d="M12 16a4 4 0 0 0 0-8z" />
                    <path
                      fill-rule="evenodd"
                      d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2m0 2v4a4 4 0 1 0 0 8v4a8 8 0 1 0 0-16"
                      clip-rule="evenodd"
                    />
                  </g>
                </svg>
              </span>

              <span v-else-if="isDarkMode">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#abcbca"
                  stroke-width="2"
                  width="36"
                  height="36"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </span>
              <span v-else>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  width="36"
                  height="36"
                >
                  <path
                    fill="#abcbca"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              </span>
            </button>
            <LanguageSelector />
          </div>
        </div>
      </div>

      <!-- Main content area with conditional rendering based on app mode -->
      <div class="w-full md:w-5/6">
        <div v-if="appMode === AppMode.Create" class="create-mode">
          <QRCodeCreate :initial-data="capturedData" />
        </div>
        <div v-else class="flex flex-col items-center justify-center py-8">
          <QRCodeCapture ref="qrCodeCaptureRef" @create-qr="useCapturedDataInCreateMode" />
        </div>
      </div>
    </div>
  </main>
</template>

<style lang="postcss" scoped>
.vertical-border {
  @apply h-8 bg-slate-300 dark:bg-slate-700 w-1;
}

.icon-button {
  @apply p-1;
  @apply outline-none focus-visible:ring-1 focus-visible:ring-zinc-700 dark:focus-visible:ring-zinc-200 hover:shadow rounded-sm;
  @apply text-zinc-900 dark:text-zinc-100 dark:bg-zinc-800;
}

.button {
  @apply bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-200;
  @apply shadow-sm hover:shadow p-2 focus-visible:shadow-md rounded-lg;
  @apply outline-none focus-visible:ring-1 focus-visible:ring-zinc-700 dark:focus-visible:ring-zinc-200;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
