<script setup lang="ts">
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode'
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const emit = defineEmits<{
  'qr-detected': [data: string]
  cancel: []
}>()

const { t } = useI18n()
const errorMessage = ref<string | null>(null)
const isLoading = ref(false)
const hasCamera = ref(false)
const scannerContainerId = 'html5-qrcode-scanner'
const html5QrCodeScanner = ref<Html5Qrcode | null>(null)
const isScanning = ref(false)
const CAMERA_PREFERENCE_KEY = 'qr-scanner-camera-preference'
const isFrontCamera = ref(localStorage.getItem(CAMERA_PREFERENCE_KEY) === 'front')
const hasMultipleCameras = ref(false)

const toggleCamera = () => {
  isFrontCamera.value = !isFrontCamera.value
  localStorage.setItem(CAMERA_PREFERENCE_KEY, isFrontCamera.value ? 'front' : 'back')
  startScanning()
}

const stopScanner = async () => {
  try {
    // Check if scanner is in scanning state before stopping
    if (html5QrCodeScanner.value?.getState() === Html5QrcodeScannerState.SCANNING) {
      await html5QrCodeScanner.value.stop()
    }
  } catch (err) {
    console.error('Error stopping QR scanner:', err)
  } finally {
    isScanning.value = false
  }
}

const stopScanning = async () => {
  await stopScanner()
  emit('cancel')
}

const startScanning = async () => {
  errorMessage.value = null
  isLoading.value = true

  // Stop scanning if already running
  await stopScanner()

  try {
    if (!html5QrCodeScanner.value) {
      html5QrCodeScanner.value = new Html5Qrcode(scannerContainerId)
    }

    const devices = await Html5Qrcode.getCameras()

    if (!devices || devices.length === 0) {
      errorMessage.value = t('No camera found on this device')
      isLoading.value = false
      return
    }

    hasMultipleCameras.value = devices && devices.length > 1

    // Select camera based on internal state and availability
    const preferredType = isFrontCamera.value ? 'front' : 'back'

    // Try to find the preferred camera type
    const preferredCamera = devices.find((device) => {
      const label = device.label.toLowerCase()
      if (preferredType === 'front') {
        return label.includes('front') || label.includes('user') || label.includes('selfie')
      } else {
        return label.includes('back') || label.includes('rear') || label.includes('environment')
      }
    })

    let cameraId = devices[0].id
    // If preferred camera type is found, use it
    if (preferredCamera) {
      cameraId = preferredCamera.id
    } else {
      // If preferred camera type isn't available, update the state to match what we're actually using
      const firstCameraLabel = devices[0].label.toLowerCase()
      const isFront =
        firstCameraLabel.includes('front') ||
        firstCameraLabel.includes('user') ||
        firstCameraLabel.includes('selfie')
      isFrontCamera.value = isFront
      localStorage.setItem(CAMERA_PREFERENCE_KEY, isFront ? 'front' : 'back')
    }

    await html5QrCodeScanner.value!.start(
      cameraId,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false
      },
      (decodedText) => {
        emit('qr-detected', decodedText)
        stopScanning()
      },
      (_errorMessage) => {
        // QR code detection error (normal when no QR code is in view)
      }
    )

    isScanning.value = true
    isLoading.value = false
  } catch (err: any) {
    console.error('Error starting QR scanner:', err)

    if (err && err.name === 'NotAllowedError') {
      errorMessage.value = t(
        'Camera access denied. Please allow camera access in your browser settings.'
      )
    } else if (err && err.name === 'NotFoundError') {
      errorMessage.value = t('No camera found on this device')
    } else if (err && err.name === 'NotReadableError') {
      errorMessage.value = t('Camera is already in use by another application')
    } else {
      errorMessage.value = t('Could not start QR code scanner')
    }

    isLoading.value = false
  }
}

onUnmounted(() => {
  stopScanning()
})

onMounted(async () => {
  startScanning()
})

defineExpose({
  hasCamera,
  startScanning,
  stopScanning
})
</script>

<template>
  <div class="camera-scanner">
    <div v-if="errorMessage" class="error-message mb-4 text-center text-red-500">
      {{ errorMessage }}
    </div>

    <!-- Scanner container -->
    <div class="scanner-container relative z-50 mb-4 overflow-hidden rounded-lg">
      <div :id="scannerContainerId" class="mx-auto w-full max-w-md"></div>

      <!-- Control buttons -->
      <div v-if="isScanning" class="absolute end-2 top-2 flex gap-2">
        <!-- Switch Camera button - only show if multiple cameras are available -->
        <button
          v-if="hasMultipleCameras"
          class="rounded-full bg-white/80 p-2 text-black shadow-md transition-colors hover:bg-white/90 dark:bg-black/80 dark:text-white dark:hover:bg-black/90"
          @click="toggleCamera"
          type="button"
          :aria-label="t('Switch camera')"
          :title="t('Switch camera')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M20 5h-3.17L15.5 3.12C15.12 2.44 14.33 2 13.5 2h-3c-.83 0-1.62.44-2 1.12L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m-5 11.5V13H9v3.5L5.5 12L9 7.5V11h6V7.5l3.5 4.5z"
            />
          </svg>
        </button>

        <!-- Close button -->
        <button
          class="rounded-full bg-white/80 p-2 text-black shadow-md transition-colors hover:bg-white/90 dark:bg-black/80 dark:text-white dark:hover:bg-black/90"
          @click="stopScanning"
          :aria-label="t('Close scanner')"
          :title="t('Close scanner')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41z"
            />
          </svg>
        </button>
      </div>
    </div>

    <button v-if="isScanning && !isLoading" class="button mt-4" @click="stopScanning">
      {{ t('Cancel') }}
    </button>
  </div>
</template>

<style scoped>
.camera-scanner {
  width: 100%;
  position: relative;
}

.scanner-container {
  position: relative;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: #000;
  min-height: 300px;
}

/* Override some of the html5-qrcode library styles */
:deep(video) {
  width: 100% !important;
  height: auto !important;
  border-radius: 8px;
  object-fit: cover;
}

:deep(img) {
  max-width: 100%;
  border-radius: 8px;
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

.error-message {
  max-width: 90%;
  margin-left: auto;
  margin-right: auto;
}

.button {
  @apply rounded-lg bg-zinc-100 px-4 py-2 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700;
}
</style>
