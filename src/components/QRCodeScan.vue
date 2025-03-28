<script setup lang="ts">
import { Html5Qrcode } from 'html5-qrcode'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import QRCodeCameraScanner from './QRCodeCameraScanner.vue'

defineEmits<{
  'create-qr': [data: string]
}>()

const { t } = useI18n()

// #region Core QR Code Data
const capturedData = ref<string>('')
const errorMessage = ref<string | null>(null)
// #endregion Core QR Code Data

// #region QR Code Type Detection
const qrCodeType = computed(() => {
  const data = capturedData.value

  // URL detection (more comprehensive than just http)
  if (/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(data)) {
    return 'url'
  }

  // Email detection
  if (
    /^mailto:(.+)$/i.test(data) ||
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data)
  ) {
    return 'email'
  }

  // Phone number detection
  if (/^tel:(.+)$/i.test(data) || /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(data)) {
    return 'tel'
  }

  // SMS detection
  if (/^sms:(.+)$/i.test(data)) {
    return 'sms'
  }

  // WiFi detection
  if (/^WIFI:(.+)$/i.test(data)) {
    return 'wifi'
  }

  // vCard detection
  if (/^BEGIN:VCARD[\s\S]*END:VCARD$/i.test(data)) {
    return 'vcard'
  }

  // Calendar event detection
  if (/^BEGIN:VEVENT[\s\S]*END:VEVENT$/i.test(data)) {
    return 'calendar'
  }

  // Geo location detection
  if (/^geo:(.+)$/i.test(data)) {
    return 'geo'
  }

  // Default to text
  return 'text'
})

const formattedData = computed(() => {
  const data = capturedData.value
  const type = qrCodeType.value

  switch (type) {
    case 'url':
      return data
    case 'email':
      return data.startsWith('mailto:') ? data : `mailto:${data}`
    case 'tel':
      return data.startsWith('tel:') ? data : `tel:${data}`
    case 'sms':
      return data.startsWith('sms:') ? data : `sms:${data}`
    case 'wifi':
      // Return as is for display purposes
      return data
    case 'vcard':
    case 'calendar':
    case 'geo':
      return data
    default:
      return data
  }
})

const isActionable = computed(() => {
  return ['url', 'email', 'tel', 'sms', 'geo'].includes(qrCodeType.value)
})
// #endregion QR Code Type Detection

// #region UI Display Properties
const qrCodeTypeIcon = computed(() => {
  switch (qrCodeType.value) {
    case 'url':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M17 7h-4v2h4c1.65 0 3 1.35 3 3s-1.35 3-3 3h-4v2h4c2.76 0 5-2.24 5-5s-2.24-5-5-5m-6 8H7c-1.65 0-3-1.35-3-3s1.35-3 3-3h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4zm-3-4h8v2H8z"/></svg>`
    case 'email':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4l-8 5l-8-5V6l8 5l8-5z"/></svg>`
    case 'tel':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24c1.12.37 2.33.57 3.57.57c.55 0 1 .45 1 1V20c0 .55-.45 1-1 1c-9.39 0-17-7.61-17-17c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1c0 1.25.2 2.45.57 3.57c.11.35.03.74-.25 1.02z"/></svg>`
    case 'sms':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2M9 11H7V9h2zm4 0h-2V9h2zm4 0h-2V9h2z"/></svg>`
    case 'wifi':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9m8 8l3 3l3-3a4.237 4.237 0 0 0-6 0m-4-4l2 2a7.074 7.074 0 0 1 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>`
    case 'vcard':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m-7 2h2.5v12H13zm-2 12H8.5V6H11zM4 6h2.5v12H4zm16 12h-2.5V6H20z"/></svg>`
    case 'calendar':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m0 16H5V8h14zm-7-5h5v5h-5z"/></svg>`
    case 'geo':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7m0 9.5a2.5 2.5 0 0 1 0-5a2.5 2.5 0 0 1 0 5z"/></svg>`
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83l3.75 3.75l1.83-1.83a.996.996 0 0 0 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29m-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"/></svg>`
  }
})

const actionText = computed(() => {
  switch (qrCodeType.value) {
    case 'url':
      return t('Open Link')
    case 'email':
      return t('Send Email')
    case 'tel':
      return t('Call Number')
    case 'sms':
      return t('Send SMS')
    case 'geo':
      return t('View Location')
    default:
      return t('Copy to clipboard')
  }
})

const typeLabel = computed(() => {
  switch (qrCodeType.value) {
    case 'url':
      return t('URL')
    case 'email':
      return t('Email')
    case 'tel':
      return t('Phone Number')
    case 'sms':
      return t('SMS')
    case 'wifi':
      return t('WiFi')
    case 'vcard':
      return t('Contact Card')
    case 'calendar':
      return t('Calendar Event')
    case 'geo':
      return t('Location')
    default:
      return t('Text')
  }
})

// #endregion UI Display Properties

// #region User Actions
const copySuccess = ref(false)
const showCameraScanner = ref(false)

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

const resetCapture = () => {
  capturedData.value = ''
  errorMessage.value = null
  copySuccess.value = false
  showCameraScanner.value = false
}
// #endregion User Actions

// #region File Handling
const fileInput = ref<HTMLInputElement | null>(null)
const isLoading = ref(false)
const isDraggingOver = ref(false)

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
// #endregion File Handling

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
      <p class="mb-4 text-xl font-semibold">{{ t('QR Code Content') }}</p>

      <!-- QR Code Type Badge -->
      <div class="mb-4 flex items-center justify-center">
        <span
          class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800"
          v-html="qrCodeTypeIcon + ' ' + typeLabel"
        ></span>
      </div>

      <!-- QR Code Content -->
      <component
        :is="isActionable ? 'a' : 'span'"
        :href="isActionable ? formattedData : undefined"
        :target="qrCodeType === 'url' ? '_blank' : undefined"
        class="flex w-full flex-row items-center justify-center gap-1 text-center"
      >
        {{ capturedData }}
      </component>

      <div class="mt-8 flex flex-col items-center justify-center gap-4 md:mt-16">
        <!-- Copy Button -->
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
              'outline-none focus-visible:ring-1 focus-visible:ring-zinc-700 dark:focus-visible:ring-zinc-200',
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
              class="z-40 flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 outline-none transition-colors hover:bg-zinc-200 focus-visible:ring-1 focus-visible:ring-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:focus-visible:ring-zinc-200"
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
