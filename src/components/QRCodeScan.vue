<script setup lang="ts">
import { Html5Qrcode } from 'html5-qrcode'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import QRCodeCameraScanner from './QRCodeCameraScanner.vue'

defineEmits<{
  'create-qr': [data: string]
}>()

const { t } = useI18n()
const capturedData = ref<string>('')
const errorMessage = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const isLoading = ref(false)
const copySuccess = ref(false)
const showCameraScanner = ref(false)
const isDraggingOver = ref(false)
const isCapturedDataLink = computed(() => {
  return capturedData.value.startsWith('http')
})

const copyToClipboard = async () => {
  if (!capturedData.value) return

  try {
    await navigator.clipboard.writeText(capturedData.value)
    copySuccess.value = true

    // Clear the success message after 3 seconds
    setTimeout(() => {
      copySuccess.value = false
    }, 3000)
  } catch (err) {
    errorMessage.value = t('Failed to copy to clipboard')
  }
}

const onQRDetected = (data: string) => {
  capturedData.value = data
  showCameraScanner.value = false
}

const onCameraScannerCancel = () => {
  showCameraScanner.value = false
}

const startCameraScanning = () => {
  errorMessage.value = null
  showCameraScanner.value = true
}

const handleFileUpload = (event: Event) => {
  let file: File | null = null

  // Handle drag and drop event
  if (event.type === 'drop') {
    const dt = (event as DragEvent).dataTransfer
    if (dt?.files && dt.files.length > 0) {
      file = dt.files[0]
    }
  }
  // Handle file input change event
  else {
    const target = event.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
      file = target.files[0]
    }
  }

  if (!file) return

  isLoading.value = true
  errorMessage.value = null

  const html5QrCode = new Html5Qrcode('file-qr-reader')
  html5QrCode
    .scanFile(file, false)
    .then((decodedText) => {
      capturedData.value = decodedText
      isLoading.value = false
    })
    .catch((err) => {
      console.error('Error scanning file:', err)
      errorMessage.value = t('No QR code found in the image.')
      isLoading.value = false
    })
}

const resetCapture = () => {
  capturedData.value = ''
  errorMessage.value = null
  copySuccess.value = false
  showCameraScanner.value = false
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDraggingOver.value = true
}

const handleDragLeave = () => {
  isDraggingOver.value = false
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDraggingOver.value = false
  handleFileUpload(event)
}

defineExpose({
  capturedData,
  isLoading,
  resetCapture,
  copyToClipboard
})
</script>

<template>
  <div class="relative mx-auto w-full max-w-[500px]">
    <div v-if="capturedData" class="capture-result">
      <p class="mb-8 text-xl font-semibold">{{ t('QR Code Content') }}</p>
      <component
        :is="isCapturedDataLink ? 'a' : 'span'"
        :href="isCapturedDataLink ? capturedData : undefined"
        :target="isCapturedDataLink ? '_blank' : undefined"
        class="flex w-full flex-row items-center justify-center gap-1 text-center"
      >
        {{ capturedData }}
      </component>
      <div class="mt-8 flex flex-col items-center justify-center gap-4 md:mt-16">
        <button
          class="button flex w-full flex-row items-center justify-start gap-4"
          @click="copyToClipboard"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            >
              <path d="M8 10a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2z" />
              <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
            </g>
          </svg>
          <span>{{ t('Copy to clipboard') }}</span>
        </button>
        <button
          class="button flex w-full flex-row items-center justify-start gap-4"
          @click="resetCapture"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 16q1.875 0 3.188-1.313T16.5 11.5q0-1.875-1.313-3.188T12 7q-1.875 0-3.188 1.313T7.5 11.5q0 1.875 1.313 3.188T12 16m0-1.8q-1.125 0-1.913-.788T9.3 11.5q0-1.125.788-1.913T12 8.8q1.125 0 1.913.788T14.7 11.5q0 1.125-.788 1.913T12 14.2M12 22q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12q0-3.35-2.325-5.675T12 4Q8.65 4 6.325 6.325T4 12q0 3.35 2.325 5.675T12 20m0-8"
            />
          </svg>
          <span>{{ t('Scan Another') }}</span>
        </button>
        <button
          class="button flex w-full flex-row items-center justify-start gap-4"
          @click="$emit('create-qr', capturedData)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M3 11h8V3H3zm2-6h4v4H5zM3 21h8v-8H3zm2-6h4v4H5zM13 3v8h8V3zm6 6h-4V5h4zM13 13h2v2h-2zm0 4h2v2h-2zm4-4h2v2h-2zm0 4h2v2h-2z"
            />
          </svg>
          <span>{{ t('Create QR Code with this data') }}</span>
        </button>
      </div>
    </div>

    <div v-else-if="showCameraScanner" class="mb-4 w-full">
      <QRCodeCameraScanner @qr-detected="onQRDetected" @cancel="onCameraScannerCancel" />
    </div>

    <div v-else class="capture-controls">
      <div v-if="isLoading" class="mb-4 flex flex-col items-center justify-center">
        <div
          class="mb-2 size-10 animate-spin rounded-full border-4 border-solid border-gray-100 border-t-blue-500 dark:border-gray-800 dark:border-t-blue-500"
        ></div>
        <p>{{ t('Processing...') }}</p>
      </div>

      <!-- Hidden div for file QR reader -->
      <div id="file-qr-reader" class="hidden"></div>

      <div class="flex flex-col items-center gap-4" v-if="!isLoading">
        <!-- Upload QR Code Image option -->
        <div class="mb-4 text-center">
          <h3 class="mb-4 text-lg font-medium">{{ t('Scan a QR Code') }}</h3>

          <button
            :class="[
              'flex w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-4 py-6 text-center transition-colors',
              isDraggingOver
                ? 'border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
            ]"
            @click="fileInput?.click()"
            @keyup.enter="fileInput?.click()"
            @keyup.space="fileInput?.click()"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
            @drop="handleDrop"
          >
            <div class="flex flex-col items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm4 18H6V4h7v5h5z"
                />
              </svg>
              <p>{{ t('Upload QR Code Image') }}</p>
              <p class="text-sm text-gray-500">{{ t('or drag and drop an image here') }}</p>
            </div>
          </button>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileUpload"
          />

          <!-- Error message -->
          <p v-if="errorMessage" class="mt-4 text-red-500">
            {{ errorMessage }}
          </p>

          <!-- Helpful tip -->
          <p class="mt-2 text-sm text-gray-500">
            {{ t('Tip: For best results, use a clear image with good lighting.') }}
          </p>

          <!-- Camera option -->
          <div class="mt-4 flex flex-col items-center gap-2">
            <p class="mb-2">{{ t('or') }}</p>
            <button
              class="z-40 flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
              @click="startCameraScanning"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6m0 8a5 5 0 1 1 0-10a5 5 0 0 1 0 10m0-12a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m4.5 1.5a1.5 1.5 0 0 1 1.5 1.5a1.5 1.5 0 0 1-1.5 1.5a1.5 1.5 0 0 1-1.5-1.5a1.5 1.5 0 0 1 1.5-1.5M20 4h-3.17l-1.24-1.35A1.99 1.99 0 0 0 14.12 2H9.88c-.56 0-1.1.24-1.48.65L7.17 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2"
                />
              </svg>
              {{ t('Scan with Camera') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
