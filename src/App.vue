<script setup lang="ts">
import StyledQRCode from '@/components/StyledQRCode.vue'
import { Combobox } from '@/components/ui/Combobox'
import {
  copyImageToClipboard,
  downloadPngElement,
  downloadSvgElement,
  IS_COPY_IMAGE_TO_CLIPBOARD_SUPPORTED
} from '@/utils/convertToImage'
import type { CornerDotType, CornerSquareType, DotType } from 'qr-code-styling'
import { computed, onMounted, ref, watch } from 'vue'
import 'vue-i18n'
import { useI18n } from 'vue-i18n'
import { createRandomColor, getRandomItemInArray } from './utils/color'
import { getNumericCSSValue } from './utils/formatting'
import { sortedLocales } from './utils/language'
import { allPresets, type Preset } from './utils/presets'
import { useDarkMode } from './vuecomposables/dark_mode'

const { isDark } = useDarkMode()

//#region /** locale */
const isLocaleSelectOpen = ref(false)
const { t, locale } = useI18n()
const locales = computed(() =>
  sortedLocales.map((loc) => ({
    value: loc,
    label: t(loc)
  }))
)

//#endregion

//#region /** styling states and computed properties */
const defaultPreset = allPresets[0]
const data = ref()
const image = ref()
const width = ref()
const height = ref()
const margin = ref()
const imageMargin = ref()

const dotsOptionsColor = ref()
const dotsOptionsType = ref()
const cornersSquareOptionsColor = ref()
const cornersSquareOptionsType = ref()
const cornersDotOptionsColor = ref()
const cornersDotOptionsType = ref()
const styleBorderRadius = ref()
const styledBorderRadiusFormatted = computed(() => `${styleBorderRadius.value}px`)
const styleBackground = ref(defaultPreset.style.background)

const dotsOptions = computed(() => ({
  color: dotsOptionsColor.value,
  type: dotsOptionsType.value
}))
const cornersSquareOptions = computed(() => ({
  color: cornersSquareOptionsColor.value,
  type: cornersSquareOptionsType.value
}))
const cornersDotOptions = computed(() => ({
  color: cornersDotOptionsColor.value,
  type: cornersDotOptionsType.value
}))
const style = computed(() => ({
  borderRadius: styledBorderRadiusFormatted.value,
  background: styleBackground.value
}))
const imageOptions = computed(() => ({
  margin: imageMargin.value
}))

const qrCodeProps = computed(() => ({
  data: data.value,
  image: image.value,
  width: width.value,
  height: height.value,
  margin: margin.value,
  dotsOptions: dotsOptions.value,
  cornersSquareOptions: cornersSquareOptions.value,
  cornersDotOptions: cornersDotOptions.value,
  imageOptions: imageOptions.value
}))

function randomizeStyleSettings() {
  const dotTypes: DotType[] = [
    'dots',
    'rounded',
    'classy',
    'classy-rounded',
    'square',
    'extra-rounded'
  ]
  const cornerSquareTypes: CornerSquareType[] = ['dot', 'square', 'extra-rounded']
  const cornerDotTypes: CornerDotType[] = ['dot', 'square']

  dotsOptionsType.value = getRandomItemInArray(dotTypes)
  dotsOptionsColor.value = createRandomColor()

  cornersSquareOptionsType.value = getRandomItemInArray(cornerSquareTypes)
  cornersSquareOptionsColor.value = createRandomColor()

  cornersDotOptionsType.value = getRandomItemInArray(cornerDotTypes)
  cornersDotOptionsColor.value = createRandomColor()

  styleBackground.value = createRandomColor()
}

const isPresetSelectOpen = ref(false)
const allPresetOptions = computed(() => {
  const options = lastCustomLoadedPreset.value
    ? [lastCustomLoadedPreset.value, ...allPresets]
    : allPresets
  return options.map((preset) => ({ value: preset.name, label: t(preset.name) }))
})
const selectedPreset = ref<Preset & { key?: string }>(defaultPreset)
watch(selectedPreset, () => {
  data.value = selectedPreset.value.data
  image.value = selectedPreset.value.image
  width.value = selectedPreset.value.width
  height.value = selectedPreset.value.height
  margin.value = selectedPreset.value.margin
  imageMargin.value = selectedPreset.value.imageOptions.margin
  dotsOptionsColor.value = selectedPreset.value.dotsOptions.color
  dotsOptionsType.value = selectedPreset.value.dotsOptions.type
  cornersSquareOptionsColor.value = selectedPreset.value.cornersSquareOptions.color
  cornersSquareOptionsType.value = selectedPreset.value.cornersSquareOptions.type
  cornersDotOptionsColor.value = selectedPreset.value.cornersDotOptions.color
  cornersDotOptionsType.value = selectedPreset.value.cornersDotOptions.type
  styleBorderRadius.value = getNumericCSSValue(selectedPreset.value.style.borderRadius as string)
  styleBackground.value = selectedPreset.value.style.background
})

const LAST_LOADED_LOCALLY_PRESET_KEY = 'Last saved locally'
const LOADED_FROM_FILE_PRESET_KEY = 'Loaded from file'
const CUSTOM_LOADED_PRESET_KEYS = [LAST_LOADED_LOCALLY_PRESET_KEY, LOADED_FROM_FILE_PRESET_KEY]
const selectedPresetKey = ref<string>(LAST_LOADED_LOCALLY_PRESET_KEY)
const lastCustomLoadedPreset = ref<Preset>()
watch(
  selectedPresetKey,
  (newKey, prevKey) => {
    if (newKey === prevKey || !newKey) return

    if (CUSTOM_LOADED_PRESET_KEYS.includes(newKey) && lastCustomLoadedPreset.value) {
      selectedPreset.value = lastCustomLoadedPreset.value
      return
    }

    const updatedPreset = allPresets.find((preset) => preset.name === newKey)
    if (updatedPreset) {
      selectedPreset.value = updatedPreset
    }
  },
  { immediate: true }
)

//#endregion

//#region /* export image utils */
const options = computed(() => ({
  width: width.value,
  height: height.value
}))

async function copyQRToClipboard() {
  console.debug('Copying image to clipboard')
  const qrCode = document.querySelector('#qr-code-container')
  if (qrCode) {
    await copyImageToClipboard(qrCode as HTMLElement, options.value)
  }
}

function downloadQRImageAsPng() {
  console.debug('Copying image to clipboard')
  const qrCode = document.querySelector('#qr-code-container')
  if (qrCode) {
    downloadPngElement(qrCode as HTMLElement, 'qr-code.png', options.value)
  }
}

function downloadQRImageAsSvg() {
  console.debug('Copying image to clipboard')
  const qrCode = document.querySelector('#qr-code-container')
  if (qrCode) {
    downloadSvgElement(qrCode as HTMLElement, 'qr-code.svg', options.value)
  }
}

function uploadImage() {
  console.debug('Uploading image')
  const imageInput = document.createElement('input')
  imageInput.type = 'file'
  imageInput.accept = 'image/*'
  imageInput.onchange = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files) {
      const file = target.files[0]
      const reader = new FileReader()
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const target = event.target as FileReader
        const result = target.result as string
        image.value = result
      }
      reader.readAsDataURL(file)
    }
  }
  imageInput.click()
}

//#endregion

//#region /* QR Config Utils */
function createQrConfig() {
  return {
    props: qrCodeProps.value,
    style: style.value
  }
}

function downloadQRConfig() {
  console.debug('Downloading QR code config')
  const qrCodeConfig = createQrConfig()
  const qrCodeConfigString = JSON.stringify(qrCodeConfig)
  const qrCodeConfigBlob = new Blob([qrCodeConfigString], { type: 'application/json' })
  const qrCodeConfigUrl = URL.createObjectURL(qrCodeConfigBlob)
  const qrCodeConfigLink = document.createElement('a')
  qrCodeConfigLink.href = qrCodeConfigUrl
  qrCodeConfigLink.download = 'qr-code-config.json'
  qrCodeConfigLink.click()
}

function saveQRConfigToLocalStorage() {
  const qrCodeConfig = createQrConfig()
  const qrCodeConfigString = JSON.stringify(qrCodeConfig)
  localStorage.setItem('qrCodeConfig', qrCodeConfigString)
}

function loadQRConfig(jsonString: string, key?: string) {
  const qrCodeConfig = JSON.parse(jsonString)
  const qrCodeProps = qrCodeConfig.props
  const qrCodeStyle = qrCodeConfig.style
  const preset = {
    ...qrCodeProps,
    style: qrCodeStyle
  }

  if (key) {
    preset.name = key
    lastCustomLoadedPreset.value = preset
  }

  selectedPreset.value = preset
}

function loadQrConfigFromFile() {
  console.debug('Loading QR code config')
  const qrCodeConfigInput = document.createElement('input')
  qrCodeConfigInput.type = 'file'
  qrCodeConfigInput.accept = 'application/json'
  qrCodeConfigInput.onchange = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files) {
      const file = target.files[0]
      const reader = new FileReader()
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const target = event.target as FileReader
        const result = target.result as string
        loadQRConfig(result, LOADED_FROM_FILE_PRESET_KEY)
      }
      reader.readAsText(file)
    }
  }
  qrCodeConfigInput.click()
}

function loadQRConfigFromLocalStorage() {
  const qrCodeConfigString = localStorage.getItem('qrCodeConfig')
  if (qrCodeConfigString) {
    console.debug('Loading QR code config from local storage')
    loadQRConfig(qrCodeConfigString, LAST_LOADED_LOCALLY_PRESET_KEY)
  } else {
    selectedPreset.value = { ...defaultPreset }
  }
}

watch(qrCodeProps, () => {
  saveQRConfigToLocalStorage()
})

onMounted(() => {
  loadQRConfigFromLocalStorage()
})
//#endregion
</script>

<template>
  <main>
    <div class="relative grid place-items-center bg-white p-8 md:px-6 dark:bg-zinc-900">
      <div
        class="mb-8 flex w-full flex-row flex-wrap justify-between gap-4 md:mb-4 md:w-5/6 md:ps-4"
      >
        <div class="flex items-center gap-2">
          <h1 class="text-3xl text-gray-700 dark:text-gray-100">MiniQR</h1>
        </div>
        <div class="flex flex-row items-center justify-end gap-4">
          <div class="flex flex-row items-center gap-2">
            <a
              class="icon-button"
              href="https://github.com/lyqht/styled-qr-code-generator"
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
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
              <g
                fill="none"
                stroke="#abcbca"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              >
                <path d="M4 5h7M7 4c0 4.846 0 7 .5 8" />
                <path
                  d="M10 8.5c0 2.286-2 4.5-3.5 4.5S4 11.865 4 11c0-2 1-3 3-3s5 .57 5 2.857c0 1.524-.667 2.571-2 3.143m2 6l4-9l4 9m-.9-2h-6.2"
                />
              </g>
            </svg>
            <Combobox
              :items="locales"
              v-model:value="locale"
              v-model:open="isLocaleSelectOpen"
              :button-label="t('Select language')"
            />
          </div>
        </div>
      </div>
      <div class="w-full md:w-5/6">
        <div class="flex flex-col-reverse items-start justify-center gap-4 md:flex-row md:gap-12">
          <div
            id="main-content"
            class="sticky top-0 flex w-full shrink-0 flex-col items-center justify-center p-4 md:w-fit"
          >
            <div id="qr-code-container">
              <div
                class="grid place-items-center overflow-hidden"
                :style="[
                  style,
                  {
                    width: '200px',
                    height: '200px'
                  }
                ]"
              >
                <StyledQRCode
                  v-if="data"
                  v-bind="{ ...qrCodeProps, width: 200, height: 200 }"
                  role="img"
                  aria-label="QR code"
                />
                <p v-else>{{ t('No data!') }}</p>
              </div>
            </div>
            <div class="mt-4 flex flex-col items-center gap-2">
              <div class="flex flex-col items-center justify-center gap-3">
                <button
                  v-if="IS_COPY_IMAGE_TO_CLIPBOARD_SUPPORTED"
                  id="copy-qr-image-button"
                  class="button flex w-fit max-w-[200px] flex-row items-center gap-1"
                  @click="copyQRToClipboard"
                  :aria-label="t('Copy QR Code to clipboard')"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                    >
                      <path
                        d="M8 10a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2z"
                      />
                      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                    </g>
                  </svg>
                  <p>{{ t('Copy QR Code to clipboard') }}</p>
                </button>
                <button
                  id="save-qr-code-config-button"
                  class="button flex w-fit max-w-[200px] flex-row items-center gap-1"
                  @click="downloadQRConfig"
                  :aria-label="t('Save QR Code configuration')"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                    >
                      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                      <path
                        d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2zm-5-4v-6"
                      />
                      <path d="M9.5 14.5L12 17l2.5-2.5" />
                    </g>
                  </svg>
                  <p>{{ t('Save QR Code configuration') }}</p>
                </button>
                <button
                  id="load-qr-code-config-button"
                  class="button flex w-fit max-w-[200px] flex-row items-center gap-1"
                  @click="loadQrConfigFromFile"
                  :aria-label="t('Load QR Code configuration')"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                    >
                      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                      <path
                        d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2zm-5-10v6"
                      />
                      <path d="M9.5 13.5L12 11l2.5 2.5" />
                    </g>
                  </svg>
                  <p>{{ t('Load QR Code configuration') }}</p>
                </button>
              </div>
              <div id="export-options" class="pt-4">
                <p class="pb-2 text-zinc-900 dark:text-zinc-100">{{ t('Export as') }}</p>
                <div class="flex flex-row items-center justify-center gap-2">
                  <button
                    id="download-qr-image-button-png"
                    class="button"
                    @click="downloadQRImageAsPng"
                    :aria-label="t('Download QR Code as PNG')"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <g
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                      >
                        <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                        <path
                          d="M5 12V5a2 2 0 0 1 2-2h7l5 5v4m1 3h-1a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1v-3M5 18h1.5a1.5 1.5 0 0 0 0-3H5v6m6 0v-6l3 6v-6"
                        />
                      </g>
                    </svg>
                  </button>
                  <button
                    id="download-qr-image-button-svg"
                    class="button"
                    @click="downloadQRImageAsSvg"
                    :aria-label="t('Download QR Code as SVG')"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <g
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                      >
                        <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                        <path
                          d="M5 12V5a2 2 0 0 1 2-2h7l5 5v4M4 20.25c0 .414.336.75.75.75H6a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H5a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h1.25a.75.75 0 0 1 .75.75m3-.75l2 6l2-6m6 0h-1a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1v-3"
                        />
                      </g>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div id="settings" class="flex w-full grow flex-col items-start gap-8 text-start">
            <div>
              <label>{{ t('Preset') }}</label>
              <div class="flex flex-row items-center justify-start gap-2">
                <Combobox
                  :items="allPresetOptions"
                  v-model:value="selectedPresetKey"
                  v-model:open="isPresetSelectOpen"
                  :button-label="t('Select preset')"
                />
                <button
                  class="icon-button"
                  @click="randomizeStyleSettings"
                  :aria-label="t('Randomize style')"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="32"
                    viewBox="0 0 640 512"
                  >
                    <path
                      fill="#888888"
                      d="M274.9 34.3c-28.1-28.1-73.7-28.1-101.8 0L34.3 173.1c-28.1 28.1-28.1 73.7 0 101.8l138.8 138.8c28.1 28.1 73.7 28.1 101.8 0l138.8-138.8c28.1-28.1 28.1-73.7 0-101.8L274.9 34.3zM200 224a24 24 0 1 1 48 0a24 24 0 1 1-48 0zM96 200a24 24 0 1 1 0 48a24 24 0 1 1 0-48zm128 176a24 24 0 1 1 0-48a24 24 0 1 1 0 48zm128-176a24 24 0 1 1 0 48a24 24 0 1 1 0-48zm-128-80a24 24 0 1 1 0-48a24 24 0 1 1 0 48zm96 328c0 35.3 28.7 64 64 64h192c35.3 0 64-28.7 64-64V256c0-35.3-28.7-64-64-64H461.7c11.6 36 3.1 77-25.4 105.5L320 413.8V448zm160-120a24 24 0 1 1 0 48a24 24 0 1 1 0-48z"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div class="w-full">
              <label for="data">
                {{ t('Data to encode') }}
              </label>
              <textarea
                name="data"
                class="text-input"
                id="data"
                rows="2"
                :placeholder="t('data to encode e.g. a URL or a string')"
                v-model="data"
              />
            </div>
            <div class="w-full">
              <div class="mb-2 flex flex-row items-center gap-2">
                <label for="image-url">
                  {{ t('Logo image URL') }}
                </label>
                <button class="icon-button flex flex-row items-center" @click="uploadImage">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                    >
                      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                      <path
                        d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2zm-5-10v6"
                      />
                      <path d="M9.5 13.5L12 11l2.5 2.5" />
                    </g>
                  </svg>
                  <span>{{ t('Upload image') }}</span>
                </button>
              </div>
              <textarea
                name="image-url"
                class="text-input"
                id="image-url"
                rows="1"
                :placeholder="t('Logo image URL')"
                v-model="image"
              />
            </div>
            <div id="color-settings" class="flex w-full flex-row flex-wrap gap-4">
              <div class="flex flex-row items-center gap-2">
                <label for="background-color">{{ t('Background color') }}</label>
                <input
                  id="background-color"
                  type="color"
                  class="color-input"
                  v-model="styleBackground"
                />
              </div>
              <div class="flex flex-row items-center gap-2">
                <label for="dots-color">{{ t('Dots color') }}</label>
                <input
                  id="dots-color"
                  type="color"
                  class="color-input"
                  v-model="dotsOptionsColor"
                />
              </div>
              <div class="flex flex-row items-center gap-2">
                <label for="corners-square-color">{{ t('Corners Square color') }}</label>
                <input
                  id="corners-square-color"
                  type="color"
                  class="color-input"
                  v-model="cornersSquareOptionsColor"
                />
              </div>
              <div class="flex flex-row items-center gap-2">
                <label for="corners-dot-color">{{ t('Corners Dot color') }}</label>
                <input
                  id="corners-dot-color"
                  type="color"
                  class="color-input"
                  v-model="cornersDotOptionsColor"
                />
              </div>
            </div>
            <div class="w-full">
              <label for="width">
                {{ t('Width (px)') }}
              </label>
              <input
                class="text-input"
                id="width"
                type="number"
                placeholder="width in pixels"
                v-model="width"
              />
            </div>
            <div class="w-full">
              <label for="height">
                {{ t('Height (px)') }}
              </label>
              <input
                class="text-input"
                id="height"
                type="number"
                placeholder="height in pixels"
                v-model="height"
              />
            </div>
            <div class="w-full">
              <label for="margin">
                {{ t('Margin (px)') }}
              </label>
              <input
                class="text-input"
                id="margin"
                type="number"
                placeholder="0"
                v-model="margin"
              />
            </div>
            <div class="w-full">
              <label for="image-margin">
                {{ t('Image margin (px)') }}
              </label>
              <input
                class="text-input"
                id="image-margin"
                type="number"
                placeholder="0"
                v-model="imageMargin"
              />
            </div>
            <div class="w-full">
              <label for="border-radius">
                {{ t('Border radius (px)') }}
              </label>
              <input
                class="text-input"
                id="border-radius"
                type="number"
                placeholder="24"
                v-model="styleBorderRadius"
              />
            </div>
            <div
              id="dots-squares-settings"
              class="mb-4 flex w-full flex-col flex-wrap gap-6 md:flex-row"
            >
              <fieldset class="flex-1" role="radiogroup" tabindex="0">
                <legend>{{ t('Dots type') }}</legend>
                <div
                  class="radiogroup"
                  v-for="type in [
                    'dots',
                    'rounded',
                    'classy',
                    'classy-rounded',
                    'square',
                    'extra-rounded'
                  ]"
                  :key="type"
                >
                  <input
                    :id="'dotsOptionsType-' + type"
                    type="radio"
                    v-model="dotsOptionsType"
                    :value="type"
                  />
                  <label :for="'dotsOptionsType-' + type">{{ t(type) }}</label>
                </div>
              </fieldset>
              <fieldset class="flex-1" role="radiogroup" tabindex="0">
                <legend>{{ t('Corners Square type') }}</legend>
                <div
                  class="radiogroup"
                  v-for="type in ['dot', 'square', 'extra-rounded']"
                  :key="type"
                >
                  <input
                    :id="'cornersSquareOptionsType-' + type"
                    type="radio"
                    v-model="cornersSquareOptionsType"
                    :value="type"
                  />
                  <label :for="'cornersSquareOptionsType-' + type">{{ t(type) }}</label>
                </div>
              </fieldset>
              <fieldset class="flex-1" role="radiogroup" tabindex="0">
                <legend>{{ t('Corners Dot type') }}</legend>
                <div class="radiogroup" v-for="type in ['dot', 'square']" :key="type">
                  <input
                    :id="'cornersDotOptionsType-' + type"
                    type="radio"
                    v-model="cornersDotOptionsType"
                    :value="type"
                  />
                  <label :for="'cornersDotOptionsType-' + type">{{ t(type) }}</label>
                </div>
              </fieldset>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style lang="postcss" scoped>
label,
legend {
  @apply text-gray-700 dark:text-gray-100 text-lg font-semibold;
}

.text-input {
  @apply bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100;
  @apply shadow hover:shadow-md transition-shadow rounded-lg;
  @apply outline-none focus-visible:ring-1 focus-visible:ring-zinc-700 dark:focus-visible:ring-zinc-200;
  @apply resize-none appearance-none ms-1 p-4 rounded w-full;
}

input[type='color'] {
  @apply outline-none focus-visible:ring-1 focus-visible:ring-zinc-700 dark:focus-visible:ring-zinc-200;
  @apply bg-transparent shadow p-0 border rounded box-border text-zinc-700 dark:text-zinc-100 focus-visible:shadow;
}

input[type='radio'] {
  @apply outline-none focus-visible:ring-1 focus-visible:ring-zinc-700 dark:focus-visible:ring-zinc-200;
  @apply m-3;
}

.button {
  @apply bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-200;
  @apply shadow-sm hover:shadow p-2 focus-visible:shadow-md rounded-lg;
  @apply outline-none focus-visible:ring-1 focus-visible:ring-zinc-700 dark:focus-visible:ring-zinc-200;
}

.secondary-button {
  @apply bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100;
  @apply shadow hover:shadow-md transition-shadow rounded-lg;
  @apply outline-none focus-visible:ring-1 focus-visible:ring-zinc-700 dark:focus-visible:ring-zinc-200;
  @apply outline-none p-1.5;
}

.icon-button {
  @apply p-1;
  @apply outline-none focus-visible:ring-1 focus-visible:ring-zinc-700 dark:focus-visible:ring-zinc-200 hover:shadow rounded-sm;
  @apply text-zinc-900 dark:text-zinc-100 dark:bg-zinc-800;
}

.vertical-border {
  @apply h-8 bg-slate-300 dark:bg-slate-700 w-1;
}

.radiogroup {
  @apply flex flex-row items-center gap-1;
}

.radiogroup > label {
  @apply font-normal;
}
</style>
