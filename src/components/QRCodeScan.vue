<script setup lang="ts">
import jsQR from 'jsqr'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import QRCodeCameraScanner from './QRCodeCameraScanner.vue'

defineEmits<{
  'create-qr': [data: string]
}>()

const { t } = useI18n()
const capturedData = ref<string>('')
const errorMessage = ref<string | null>(null)
const canvasElement = ref<HTMLCanvasElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const isLoading = ref(false)
const copySuccess = ref(false)
const showCameraScanner = ref(false)
const isDraggingOver = ref(false)

// Function to copy captured data to clipboard
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

// Handle QR code detected from camera
const onQRDetected = (data: string) => {
  capturedData.value = data
  showCameraScanner.value = false
}

// Handle camera scanner cancel
const onCameraScannerCancel = () => {
  showCameraScanner.value = false
}

// Start camera scanning
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
  const reader = new FileReader()

  reader.onload = (e) => {
    if (!e.target || !e.target.result) {
      isLoading.value = false
      return
    }

    const img = new Image()
    img.onload = () => {
      if (!canvasElement.value) {
        isLoading.value = false
        return
      }

      const canvas = canvasElement.value
      const context = canvas.getContext('2d')

      if (!context) {
        isLoading.value = false
        return
      }

      canvas.width = img.width
      canvas.height = img.height

      context.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Try with original image first
      let imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      let code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth'
      })

      // If no code found, try with preprocessed image
      if (!code) {
        // Save original image
        const originalData = context.getImageData(0, 0, canvas.width, canvas.height)

        // Try preprocessing
        imageData = preprocessImage(context, canvas.width, canvas.height)
        code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth'
        })

        // Restore original image
        context.putImageData(originalData, 0, 0)
      }

      if (code) {
        capturedData.value = code.data
      } else {
        errorMessage.value = t('No QR code found in the image.')
      }

      isLoading.value = false
    }

    img.src = e.target.result as string
  }

  reader.onerror = () => {
    isLoading.value = false
    errorMessage.value = t('Error reading file')
  }

  reader.readAsDataURL(file)
}

// Preprocessing function for image enhancement
const preprocessImage = (context: CanvasRenderingContext2D, width: number, height: number) => {
  const imageData = context.getImageData(0, 0, width, height)
  const data = imageData.data

  // First pass: find min and max values
  let minVal = 255
  let maxVal = 0

  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    minVal = Math.min(minVal, gray)
    maxVal = Math.max(maxVal, gray)
  }

  // Avoid division by zero
  const range = maxVal - minVal || 1

  // Second pass: normalize and apply threshold
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]

    // Normalize to full range
    const normalized = ((gray - minVal) / range) * 255

    // Apply threshold
    const threshold = 128
    const newValue = normalized < threshold ? 0 : 255

    data[i] = data[i + 1] = data[i + 2] = newValue
  }

  // Put the modified data back
  context.putImageData(imageData, 0, 0)

  return context.getImageData(0, 0, width, height)
}

// Reset the component state
const resetCapture = () => {
  capturedData.value = ''
  errorMessage.value = null
  copySuccess.value = false
  showCameraScanner.value = false
}

// Handle dragover event
const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDraggingOver.value = true
}

// Handle dragleave event
const handleDragLeave = () => {
  isDraggingOver.value = false
}

// Handle drop event
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
      <p class="mb-2 text-xl font-semibold">{{ t('QR Code Content') }}</p>
      <button
        class="relative mb-1 w-full cursor-pointer overflow-auto rounded-lg bg-zinc-100 p-4 ps-6 text-left transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
        @click="copyToClipboard"
      >
        <pre class="whitespace-pre-wrap break-words ps-6">{{ capturedData }}</pre>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          class="absolute start-2 top-1/2 -translate-y-1/2"
        >
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
      </button>
      <div v-if="copySuccess" class="mb-4 text-center text-sm text-green-600">
        {{ t('Data copied to clipboard') }}
      </div>

      <div class="mt-8 flex flex-col justify-center gap-4 md:mt-16">
        <button
          class="flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
          @click="resetCapture"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 16q1.875 0 3.188-1.313T16.5 11.5q0-1.875-1.313-3.188T12 7q-1.875 0-3.188 1.313T7.5 11.5q0 1.875 1.313 3.188T12 16m0-1.8q-1.125 0-1.913-.788T9.3 11.5q0-1.125.788-1.913T12 8.8q1.125 0 1.913.788T14.7 11.5q0 1.125-.788 1.913T12 14.2M12 22q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12q0-3.35-2.325-5.675T12 4Q8.65 4 6.325 6.325T4 12q0 3.35 2.325 5.675T12 20m0-8"
            />
          </svg>
          {{ t('Scan Another') }}
        </button>
        <button
          class="flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
          @click="$emit('create-qr', capturedData)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M3 11h8V3H3zm2-6h4v4H5zM3 21h8v-8H3zm2-6h4v4H5zM13 3v8h8V3zm6 6h-4V5h4zM13 13h2v2h-2zm0 4h2v2h-2zm4-4h2v2h-2zm0 4h2v2h-2z"
            />
          </svg>
          {{ t('Create QR Code with this data') }}
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

      <canvas ref="canvasElement" class="hidden"></canvas>

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

          <!-- TODO: add this back when camera feature is more stable -->
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
