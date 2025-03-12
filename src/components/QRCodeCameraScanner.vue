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

const checkCameraAvailability = async () => {
  try {
    const devices = await Html5Qrcode.getCameras()
    hasCamera.value = devices && devices.length > 0
    return hasCamera.value
  } catch (err) {
    console.error('Error checking camera availability:', err)
    hasCamera.value = false
    errorMessage.value = t('Camera access denied. Please allow camera access to use this feature.')
    return false
  }
}

const startScanning = async () => {
  errorMessage.value = null
  isLoading.value = true

  try {
    if (!hasCamera.value) {
      const cameraAvailable = await checkCameraAvailability()
      if (!cameraAvailable) {
        isLoading.value = false
        return
      }
    }

    if (!html5QrCodeScanner.value) {
      html5QrCodeScanner.value = new Html5Qrcode(scannerContainerId)
    }

    const devices = await Html5Qrcode.getCameras()

    if (!devices || devices.length === 0) {
      errorMessage.value = t('No camera found on this device')
      isLoading.value = false
      return
    }

    // Try to use back camera first (usually better for QR scanning)
    const cameraId =
      devices.find(
        (device) =>
          device.label.toLowerCase().includes('back') ||
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('environment')
      )?.id || devices[0].id

    await html5QrCodeScanner.value.start(
      cameraId,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false
      },
      (decodedText) => {
        // QR code detected successfully
        emit('qr-detected', decodedText)
        stopScanning()
      },
      (_errorMessage) => {
        // QR code detection error (this is normal when no QR code is in view)
        // We don't need to handle these errors as they occur continuously during scanning
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

const stopScanning = async () => {
  if (html5QrCodeScanner.value && isScanning.value) {
    try {
      // Check if scanner is in scanning state before stopping
      if (html5QrCodeScanner.value.getState() === Html5QrcodeScannerState.SCANNING) {
        await html5QrCodeScanner.value.stop()
      }
    } catch (err) {
      console.error('Error stopping QR scanner:', err)
    } finally {
      isScanning.value = false
      emit('cancel')
    }
  } else {
    emit('cancel')
  }
}

onUnmounted(() => {
  stopScanning()
})

onMounted(async () => {
  await checkCameraAvailability()

  if (hasCamera.value) {
    startScanning()
  }
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

      <!-- Close button -->
      <button
        v-if="isScanning"
        class="absolute right-2 top-2 rounded-full bg-white/80 p-2 text-black shadow-md dark:bg-black/80 dark:text-white"
        @click="stopScanning"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41z"
          />
        </svg>
      </button>
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
