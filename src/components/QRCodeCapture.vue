<script setup lang="ts">
import jsQR from 'jsqr'
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

defineEmits<{
  'create-qr': [data: string]
}>()

const { t } = useI18n()
const capturedData = ref<string>('')
const isCapturing = ref(false)
const hasCamera = ref(false)
const errorMessage = ref<string | null>(null)
const videoElement = ref<HTMLVideoElement | null>(null)
const canvasElement = ref<HTMLCanvasElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const stream = ref<MediaStream | null>(null)
const isLoading = ref(false)
const copySuccess = ref(false)

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
    console.error('Failed to copy: ', err)
    errorMessage.value = t('Failed to copy to clipboard')
  }
}

const startCapture = async () => {
  errorMessage.value = null
  isLoading.value = true

  if (!videoElement.value || !canvasElement.value) {
    isLoading.value = false
    return
  }

  try {
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    })

    videoElement.value.srcObject = stream.value
    videoElement.value.play()

    hasCamera.value = true
    isCapturing.value = true
    isLoading.value = false

    requestAnimationFrame(scanQRCode)
  } catch (err) {
    console.error('Error accessing camera: ', err)
    errorMessage.value = t('Could not access camera')
    hasCamera.value = false
    isLoading.value = false
  }
}

// Function to stop camera capture
const stopCapture = () => {
  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop())
    stream.value = null
  }

  isCapturing.value = false

  if (videoElement.value) {
    videoElement.value.srcObject = null
  }
}

const scanQRCode = () => {
  if (!isCapturing.value || !videoElement.value || !canvasElement.value) return

  if (videoElement.value.readyState === videoElement.value.HAVE_ENOUGH_DATA) {
    const canvas = canvasElement.value
    const context = canvas.getContext('2d')

    if (!context) return

    canvas.width = videoElement.value.videoWidth
    canvas.height = videoElement.value.videoHeight

    context.drawImage(videoElement.value, 0, 0, canvas.width, canvas.height)

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
      stopCapture()
      return
    }
  }

  requestAnimationFrame(scanQRCode)
}

const preprocessImage = (context: CanvasRenderingContext2D, width: number, height: number) => {
  const imageData = context.getImageData(0, 0, width, height)
  const data = imageData.data

  // Enhance contrast
  for (let i = 0; i < data.length; i += 4) {
    // Convert to grayscale with weighted RGB
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]

    // Apply threshold to create high contrast black and white
    const threshold = 128
    const newValue = gray < threshold ? 0 : 255

    data[i] = data[i + 1] = data[i + 2] = newValue
  }

  // Put the modified data back
  context.putImageData(imageData, 0, 0)

  return context.getImageData(0, 0, width, height)
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement

  if (!target.files || target.files.length === 0) return

  isLoading.value = true
  const file = target.files[0]
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
        errorMessage.value = t(
          'No QR code found in the image. Stylized or custom QR codes may be difficult to scan. Try using a standard QR code or a dedicated scanning app.'
        )
        console.error(
          'QR code detection failed. Try using a standard QR code or a different scanner app.'
        )
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

// Reset the component state
const resetCapture = () => {
  capturedData.value = ''
  errorMessage.value = null
  copySuccess.value = false
}

onUnmounted(() => {
  stopCapture()
})

onMounted(() => {
  navigator.mediaDevices
    .enumerateDevices()
    .then((devices) => {
      hasCamera.value = devices.some((device) => device.kind === 'videoinput')
    })
    .catch((err) => {
      console.error('Error checking for camera: ', err)
      hasCamera.value = false
    })
})

defineExpose({
  capturedData,
  isLoading,
  isCapturing,
  hasCamera,
  startCapture,
  stopCapture,
  resetCapture,
  copyToClipboard
})
</script>

<template>
  <div class="qr-capture-container">
    <div v-if="capturedData" class="capture-result">
      <h3 class="mb-2 text-xl font-semibold">{{ t('QR Code Content') }}</h3>
      <button
        class="relative mb-1 max-h-60 w-full cursor-pointer overflow-auto rounded-lg bg-zinc-100 p-4 text-left transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
        @click="copyToClipboard"
      >
        <pre class="whitespace-pre-wrap break-words">{{ capturedData }}</pre>
      </button>
      <div v-if="copySuccess" class="mb-4 text-center text-sm text-green-600">
        {{ t('Data copied to clipboard') }}
      </div>
      <div class="flex justify-center">
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
      </div>

      <div class="mt-8 flex justify-center">
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

    <div v-else class="capture-controls">
      <div v-if="errorMessage" class="error-message mb-4 text-red-500">
        {{ errorMessage }}
      </div>

      <div
        v-if="isLoading"
        class="loading-indicator mb-4 flex flex-col items-center justify-center"
      >
        <div class="spinner mb-2"></div>
        <p>{{ t('Processing...') }}</p>
      </div>

      <div class="video-container mb-4" v-if="isCapturing && !isLoading">
        <video ref="videoElement" class="mx-auto w-full max-w-md rounded-lg"></video>
      </div>

      <canvas ref="canvasElement" class="hidden"></canvas>

      <div class="flex flex-col items-center gap-4" v-if="!isCapturing && !isLoading">
        <button v-if="hasCamera" class="button flex items-center gap-2" @click="startCapture">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6m0 8a5 5 0 1 1 0-10a5 5 0 0 1 0 10m0-12a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m4.5 1.5a1.5 1.5 0 0 1 1.5 1.5a1.5 1.5 0 0 1-1.5 1.5a1.5 1.5 0 0 1-1.5-1.5a1.5 1.5 0 0 1 1.5-1.5M20 4h-3.17l-1.24-1.35A1.99 1.99 0 0 0 14.12 2H9.88c-.56 0-1.1.24-1.48.65L7.17 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2"
            />
          </svg>
          {{ t('Scan with Camera') }}
        </button>

        <div class="text-center">
          <p class="mb-2">{{ t('or') }}</p>
          <button class="secondary-button flex items-center gap-2" @click="fileInput?.click()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm4 18H6V4h7v5h5z"
              />
            </svg>
            {{ t('Upload QR Code Image') }}
          </button>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileUpload"
          />
        </div>
      </div>

      <button v-if="isCapturing && !isLoading" class="button mt-4" @click="stopCapture">
        {{ t('Cancel') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.qr-capture-container {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.video-container {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #3498db;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.dark .spinner {
  border-color: rgba(255, 255, 255, 0.1);
  border-top-color: #3498db;
}
</style>
