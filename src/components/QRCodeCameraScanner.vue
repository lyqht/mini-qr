<script setup lang="ts">
import jsQR from 'jsqr'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  isActive: boolean
}>()

const emit = defineEmits<{
  'qr-detected': [data: string]
  cancel: []
}>()

const { t } = useI18n()
const errorMessage = ref<string | null>(null)
const videoElement = ref<HTMLVideoElement | null>(null)
const canvasElement = ref<HTMLCanvasElement | null>(null)
const stream = ref<MediaStream | null>(null)
const isLoading = ref(false)
const isCapturing = ref(false)
const hasCamera = ref(false)
const isFrontCamera = ref(false)
const scanAttempts = ref(0)
const isAdjustingCamera = ref(false)

const checkCameraAvailability = async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    hasCamera.value = false
    return false
  }

  try {
    const constraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    }

    const tempStream = await navigator.mediaDevices.getUserMedia(constraints)

    // Stop the temporary stream immediately after getting permission
    tempStream.getTracks().forEach((track) => track.stop())

    // Now enumerate devices with permission granted
    const devices = await navigator.mediaDevices.enumerateDevices()
    const videoDevices = devices.filter((device) => device.kind === 'videoinput')
    hasCamera.value = videoDevices.length > 0

    return true
  } catch (err) {
    if (err instanceof DOMException && err.name === 'NotAllowedError') {
      errorMessage.value = t(
        'Camera access denied. Please allow camera access to use this feature.'
      )
    }

    hasCamera.value = false
    return false
  }
}

const startCapture = async () => {
  errorMessage.value = null
  isLoading.value = true

  // Check camera availability first if needed
  if (!hasCamera.value) {
    const cameraAvailable = await checkCameraAvailability()
    if (!cameraAvailable) {
      errorMessage.value = t('No camera available or permission denied')
      isLoading.value = false
      return
    }
  }

  // Give Vue a chance to render the elements if they're not ready yet
  if (!videoElement.value || !canvasElement.value) {
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  if (!videoElement.value || !canvasElement.value) {
    errorMessage.value = t('Camera elements not initialized properly')
    isLoading.value = false
    return
  }

  try {
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('getUserMedia is not supported in this browser')
    }

    // First try with environment camera (rear)
    try {
      const envConstraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      }

      stream.value = await navigator.mediaDevices.getUserMedia(envConstraints)
      isFrontCamera.value = false
    } catch (envErr) {
      // If environment camera fails, try user camera (front)
      const userConstraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      }

      stream.value = await navigator.mediaDevices.getUserMedia(userConstraints)
      isFrontCamera.value = true
    }

    // Log which camera was selected
    const videoTrack = stream.value.getVideoTracks()[0]
    if (videoTrack) {
      // Check if this is likely a front camera based on the label
      if (
        videoTrack.label.toLowerCase().includes('front') ||
        videoTrack.label.toLowerCase().includes('user') ||
        videoTrack.label.toLowerCase().includes('face')
      ) {
        isFrontCamera.value = true
      }
    }

    if (!videoElement.value) {
      throw new Error('Video element disappeared during camera access')
    }

    videoElement.value.srcObject = stream.value

    // Add event listener to ensure video plays
    videoElement.value.onloadedmetadata = () => {
      if (!videoElement.value) {
        isLoading.value = false
        return
      }

      videoElement.value
        .play()
        .then(() => {
          hasCamera.value = true
          isCapturing.value = true
          isLoading.value = false
          requestAnimationFrame(scanQRCode)
        })
        .catch((err) => {
          errorMessage.value = t('Could not start video playback')
          isLoading.value = false
        })
    }

    videoElement.value.onerror = (e) => {
      errorMessage.value = t('Video element error')
      isLoading.value = false
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'NotAllowedError') {
      errorMessage.value = t(
        'Camera access denied. Please allow camera access in your browser settings.'
      )
    } else if (err instanceof DOMException && err.name === 'NotFoundError') {
      errorMessage.value = t('No camera found on this device')
    } else if (err instanceof DOMException && err.name === 'NotReadableError') {
      errorMessage.value = t('Camera is already in use by another application')
    } else if (err instanceof DOMException && err.name === 'OverconstrainedError') {
      errorMessage.value = t('Could not find a suitable camera')
    } else if (err instanceof DOMException && err.name === 'AbortError') {
      errorMessage.value = t('Camera access was aborted')
    } else if (err instanceof DOMException && err.name === 'SecurityError') {
      errorMessage.value = t('Camera access is blocked by browser security settings')
    } else {
      errorMessage.value =
        t('Could not access camera: ') + (err instanceof Error ? err.message : String(err))
    }

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

  emit('cancel')
}

// Function to adjust camera settings for better QR detection
const adjustCameraSettings = async () => {
  if (!stream.value || !videoElement.value || isAdjustingCamera.value) return

  isAdjustingCamera.value = true

  try {
    // Stop current stream
    stream.value.getTracks().forEach((track) => track.stop())

    // Try with different constraints - using only standard constraints to avoid type errors
    const constraints = {
      video: {
        facingMode: isFrontCamera.value ? 'user' : 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 },
        // Focus and brightness are standard constraints
        focusMode: 'continuous',
        brightness: { ideal: 100 }
      }
    }

    stream.value = await navigator.mediaDevices.getUserMedia(constraints as MediaStreamConstraints)

    if (videoElement.value) {
      videoElement.value.srcObject = stream.value
    }

    // Reset scan attempts counter
    scanAttempts.value = 0
  } catch (err) {
    errorMessage.value = t('Could not adjust camera settings')
  } finally {
    isAdjustingCamera.value = false
  }
}

const scanQRCode = () => {
  if (!isCapturing.value || !videoElement.value || !canvasElement.value) return

  // Increment scan attempts
  scanAttempts.value++

  if (videoElement.value.readyState === videoElement.value.HAVE_ENOUGH_DATA) {
    const canvas = canvasElement.value
    const context = canvas.getContext('2d')

    if (!context) return

    canvas.width = videoElement.value.videoWidth
    canvas.height = videoElement.value.videoHeight

    // Clear the canvas first
    context.clearRect(0, 0, canvas.width, canvas.height)

    // Draw the video frame to the canvas
    context.drawImage(videoElement.value, 0, 0, canvas.width, canvas.height)

    // If using front camera, we might need to flip the image horizontally
    if (isFrontCamera.value) {
      // Create a new canvas for the flipped image
      const flippedCanvas = document.createElement('canvas')
      flippedCanvas.width = canvas.width
      flippedCanvas.height = canvas.height
      const flippedContext = flippedCanvas.getContext('2d')

      if (flippedContext) {
        // Flip horizontally
        flippedContext.translate(canvas.width, 0)
        flippedContext.scale(-1, 1)
        flippedContext.drawImage(videoElement.value, 0, 0, canvas.width, canvas.height)

        // Use the flipped canvas for QR detection
        let imageData = flippedContext.getImageData(0, 0, canvas.width, canvas.height)
        let code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth'
        })

        if (code) {
          emit('qr-detected', code.data)
          stopCapture()
          return
        }
      }
    }

    // Try with original image (or non-flipped for rear camera)
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    let code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth'
    })

    // If no code found, try with preprocessed image
    if (!code) {
      // Save original image
      const originalData = context.getImageData(0, 0, canvas.width, canvas.height)

      // Try preprocessing with enhanced contrast
      imageData = preprocessImage(context, canvas.width, canvas.height)
      code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth'
      })

      // If still no code found, try with different preprocessing
      if (!code) {
        // Try with edge detection
        context.putImageData(originalData, 0, 0)
        imageData = preprocessImageWithEdgeDetection(context, canvas.width, canvas.height)
        code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth'
        })
      }

      // If still no code found, try with adaptive thresholding
      if (!code) {
        context.putImageData(originalData, 0, 0)
        imageData = preprocessImageWithAdaptiveThreshold(context, canvas.width, canvas.height)
        code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth'
        })
      }

      // Restore original image
      context.putImageData(originalData, 0, 0)
    }

    if (code) {
      emit('qr-detected', code.data)
      stopCapture()
      return
    }
  }

  // Continue scanning
  if (isCapturing.value) {
    requestAnimationFrame(scanQRCode)
  }
}

// Add a new preprocessing method with adaptive thresholding
const preprocessImageWithAdaptiveThreshold = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  const imageData = context.getImageData(0, 0, width, height)
  const data = imageData.data
  const grayscale = new Uint8ClampedArray(width * height)

  // Convert to grayscale
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
    grayscale[i / 4] = gray
  }

  // Apply adaptive thresholding
  const blockSize = 11 // Size of the neighborhood
  const C = 2 // Constant subtracted from the mean

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x

      // Calculate local mean
      let sum = 0
      let count = 0

      for (
        let ny = Math.max(0, y - blockSize / 2);
        ny < Math.min(height, y + blockSize / 2);
        ny++
      ) {
        for (
          let nx = Math.max(0, x - blockSize / 2);
          nx < Math.min(width, x + blockSize / 2);
          nx++
        ) {
          sum += grayscale[ny * width + nx]
          count++
        }
      }

      const mean = sum / count

      // Apply threshold
      const value = grayscale[idx] < mean - C ? 0 : 255

      const dataIdx = idx * 4
      data[dataIdx] = data[dataIdx + 1] = data[dataIdx + 2] = value
    }
  }

  // Put the modified data back
  context.putImageData(imageData, 0, 0)

  return imageData
}

// Enhance the existing preprocessing function
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

// Add a new preprocessing method with edge detection for better QR code recognition
const preprocessImageWithEdgeDetection = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  const imageData = context.getImageData(0, 0, width, height)
  const data = imageData.data
  const grayscale = new Uint8ClampedArray(width * height)

  // Convert to grayscale
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
    grayscale[i / 4] = gray
  }

  // Simple edge detection
  const result = new Uint8ClampedArray(data.length)
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x

      // Sobel operator for edge detection
      const gx =
        -1 * grayscale[idx - width - 1] +
        -2 * grayscale[idx - width] +
        -1 * grayscale[idx - width + 1] +
        1 * grayscale[idx + width - 1] +
        2 * grayscale[idx + width] +
        1 * grayscale[idx + width + 1]

      const gy =
        -1 * grayscale[idx - width - 1] +
        -2 * grayscale[idx - 1] +
        -1 * grayscale[idx + width - 1] +
        1 * grayscale[idx - width + 1] +
        2 * grayscale[idx + 1] +
        1 * grayscale[idx + width + 1]

      // Calculate gradient magnitude
      const magnitude = Math.sqrt(gx * gx + gy * gy)

      // Apply threshold
      const value = magnitude > 50 ? 0 : 255

      const dataIdx = idx * 4
      result[dataIdx] = result[dataIdx + 1] = result[dataIdx + 2] = value
      result[dataIdx + 3] = 255 // Alpha
    }
  }

  // Create new ImageData and put it back
  const newImageData = new ImageData(result, width, height)
  context.putImageData(newImageData, 0, 0)

  return newImageData
}

onUnmounted(() => {
  stopCapture()
})

onMounted(async () => {
  // Check camera availability after component is mounted
  await checkCameraAvailability()

  // Start capture if component is active
  if (props.isActive && hasCamera.value) {
    startCapture()
  }
})

// Watch for changes in isActive prop
watch(
  () => props.isActive,
  (newValue: boolean) => {
    if (newValue && hasCamera.value && !isCapturing.value) {
      startCapture()
    } else if (!newValue && isCapturing.value) {
      stopCapture()
    }
  }
)

defineExpose({
  hasCamera,
  startCapture,
  stopCapture
})
</script>

<template>
  <div class="camera-scanner">
    <div v-if="errorMessage" class="error-message mb-4 text-center text-red-500">
      {{ errorMessage }}
    </div>

    <div v-if="isLoading" class="loading-indicator mb-4 flex flex-col items-center justify-center">
      <div class="spinner mb-2"></div>
      <p>{{ t('Processing...') }}</p>
    </div>

    <div class="video-container relative z-50 mb-4" :class="{ hidden: !isCapturing || isLoading }">
      <video ref="videoElement" class="mx-auto w-full max-w-md rounded-lg"></video>

      <!-- Scanning indicator overlay -->
      <div v-if="isCapturing" class="scanning-indicator">
        <div class="scan-line"></div>
        <div class="scan-corners"></div>
        <p class="scan-text">{{ t('Scanning for QR code...') }}</p>
      </div>

      <button
        class="absolute right-2 top-2 rounded-full bg-white/80 p-2 text-black shadow-md dark:bg-black/80 dark:text-white"
        @click="stopCapture"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41z"
          />
        </svg>
      </button>

      <!-- Camera adjustment button -->
      <button
        v-if="scanAttempts > 50 && !isAdjustingCamera"
        class="absolute bottom-2 left-2 rounded-lg bg-white/80 px-2 py-1 text-xs text-black shadow-md dark:bg-black/80 dark:text-white"
        @click="adjustCameraSettings"
      >
        <span class="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3s3-1.34 3-3s-1.34-3-3-3m8-6H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-3.21 14.21l-2.91-2.91c-.69.44-1.51.7-2.39.7C9 15 7 13 7 10.5S9 6 11.5 6S16 8 16 10.5c0 .88-.26 1.69-.7 2.39l2.91 2.9l-1.42 1.42z"
            />
          </svg>
          {{ t('Adjust Camera') }}
        </span>
      </button>
    </div>

    <canvas ref="canvasElement" class="hidden"></canvas>

    <button v-if="isCapturing && !isLoading" class="button mt-4" @click="stopCapture">
      {{ t('Cancel') }}
    </button>
  </div>
</template>

<style scoped>
.camera-scanner {
  width: 100%;
  position: relative;
}

.video-container {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: #000;
  min-height: 200px;
}

/* Scanning indicator styles */
.scanning-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.scan-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: rgba(52, 152, 219, 0.8);
  animation: scan 2s linear infinite;
}

.scan-corners {
  position: absolute;
  width: 80%;
  height: 80%;
  border: 2px solid transparent;
  border-radius: 8px;
  box-shadow:
    0 0 0 2px rgba(52, 152, 219, 0.5) inset,
    0 0 0 4px rgba(255, 255, 255, 0.2) inset;
}

.scan-text {
  position: absolute;
  bottom: 20px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
}

@keyframes scan {
  0% {
    top: 20%;
    opacity: 0.8;
  }
  50% {
    top: 80%;
    opacity: 1;
  }
  100% {
    top: 20%;
    opacity: 0.8;
  }
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
