<script setup lang="ts">
import PLACEHOLDER_IMAGE_URL from '@/assets/placeholder_image.png'
import StyledQRCode, { type StyledQRCodeProps } from '@/components/StyledQRCode.vue'
import {
  copyImageToClipboard,
  downloadPngElement,
  downloadSvgElement
} from '@/utils/convertToImage'
import type { CornerDotType, CornerSquareType, DotType } from 'qr-code-styling'
import { computed, ref } from 'vue'

interface CustomStyleProps {
  borderRadius?: string
  background?: string
}

const PLACEHOLDER_PROPS: Required<StyledQRCodeProps> & { style: CustomStyleProps } = {
  data: 'https://github.com/lyqht',
  image: PLACEHOLDER_IMAGE_URL,
  width: 200,
  height: 200,
  margin: 0,
  type: 'svg',
  dotsOptions: {
    color: '#abcbca',
    type: 'extra-rounded'
  },
  cornersSquareOptions: {
    color: '#abcbca',
    type: 'extra-rounded'
  },
  cornersDotOptions: {
    color: '#abcbca',
    type: 'square'
  },
  backgroundOptions: {
    color: 'transparent'
  },
  imageOptions: {
    margin: 0
  },
  style: {
    borderRadius: '24px',
    background: '#697d80'
  }
}

const data = ref(PLACEHOLDER_PROPS.data)
const image = ref(PLACEHOLDER_PROPS.image)
const width = ref(PLACEHOLDER_PROPS.width)
const height = ref(PLACEHOLDER_PROPS.height)
const margin = ref(PLACEHOLDER_PROPS.margin)

const dotsOptionsColor = ref(PLACEHOLDER_PROPS.dotsOptions.color)
const dotsOptionsType = ref(PLACEHOLDER_PROPS.dotsOptions.type)
const cornersSquareOptionsColor = ref(PLACEHOLDER_PROPS.cornersSquareOptions.color)
const cornersSquareOptionsType = ref(PLACEHOLDER_PROPS.cornersSquareOptions.type)
const cornersDotOptionsColor = ref(PLACEHOLDER_PROPS.cornersDotOptions.color)
const cornersDotOptionsType = ref(PLACEHOLDER_PROPS.cornersDotOptions.type)
const styleBorderRadius = ref(PLACEHOLDER_PROPS.style.borderRadius)
const styleBackground = ref(PLACEHOLDER_PROPS.style.background)

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
  borderRadius: styleBorderRadius.value,
  background: styleBackground.value
}))

const qrCodeProps = computed(() => ({
  data: data.value,
  image: image.value,
  width: width.value,
  height: height.value,
  margin: margin.value,
  dotsOptions: dotsOptions.value,
  cornersSquareOptions: cornersSquareOptions.value,
  cornersDotOptions: cornersDotOptions.value
}))

/* random settings utils */

function createRandomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16)
}

function getRandomItemInArray(array: any[]) {
  return array[Math.floor(Math.random() * array.length)]
}

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

/* export image utils */

async function copyQRToClipboard() {
  console.debug('Copying image to clipboard')
  const qrCode = document.querySelector('#qr-code-container')
  if (qrCode) {
    await copyImageToClipboard(qrCode as HTMLElement)
  }
}

function downloadQRImageAsPng() {
  console.debug('Copying image to clipboard')
  const qrCode = document.querySelector('#qr-code-container')
  if (qrCode) {
    downloadPngElement(qrCode as HTMLElement, 'qr-code.png', {
      width: width.value,
      height: height.value
    })
  }
}

function downloadQRImageAsSvg() {
  console.debug('Copying image to clipboard')
  const qrCode = document.querySelector('#qr-code-container')
  if (qrCode) {
    downloadSvgElement(qrCode as HTMLElement, 'qr-code.svg', {
      width: width.value,
      height: height.value
    })
  }
}
</script>

<template>
  <main class="grid place-items-center p-16 sm:p-8 relative" role="main">
    <div class="absolute end-4 top-4 flex flex-row items-center gap-4">
      <form class="flex flex-row items-center">
        <select class="input" id="locale-select" v-model="$i18n.locale">
          <option v-for="(locale, index) in $i18n.availableLocales" :key="index" :value="locale">
            {{ locale }}
          </option>
        </select>
      </form>
      <a href="https://github.com/lyqht/styled-qr-code-generator">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
          <path
            fill="#abcbca"
            d="M12.001 2c-5.525 0-10 4.475-10 10a9.994 9.994 0 0 0 6.837 9.488c.5.087.688-.213.688-.476c0-.237-.013-1.024-.013-1.862c-2.512.463-3.162-.612-3.362-1.175c-.113-.288-.6-1.175-1.025-1.413c-.35-.187-.85-.65-.013-.662c.788-.013 1.35.725 1.538 1.025c.9 1.512 2.337 1.087 2.912.825c.088-.65.35-1.087.638-1.337c-2.225-.25-4.55-1.113-4.55-4.938c0-1.088.387-1.987 1.025-2.688c-.1-.25-.45-1.275.1-2.65c0 0 .837-.262 2.75 1.026a9.28 9.28 0 0 1 2.5-.338c.85 0 1.7.112 2.5.337c1.913-1.3 2.75-1.024 2.75-1.024c.55 1.375.2 2.4.1 2.65c.637.7 1.025 1.587 1.025 2.687c0 3.838-2.337 4.688-4.563 4.938c.363.312.676.912.676 1.85c0 1.337-.013 2.412-.013 2.75c0 .262.188.574.688.474A10.016 10.016 0 0 0 22 12c0-5.525-4.475-10-10-10Z"
          />
        </svg>
      </a>
    </div>
    <div class="w-full md:w-5/6">
      <div class="w-full mb-8 flex flex-col items-center justify-center">
        <h1 class="text-4xl">{{ $t('styled_qr_gen') }}</h1>
        <button class="p-2 mt-2 m-0" @click="randomizeStyleSettings">
          {{ $t('random_style') }}
        </button>
      </div>
      <div class="flex flex-col md:flex-row items-start justify-center gap-4 md:gap-12">
        <div
          id="main-content"
          class="flex flex-col items-center justify-center flex-shrink-0 w-full md:w-fit"
        >
          <div
            id="qr-code-container"
            class="grid place-items-center overflow-hidden mb-4"
            :style="[
              style,
              {
                width: width + 'px',
                height: height + 'px'
              }
            ]"
          >
            <StyledQRCode v-if="data" v-bind="qrCodeProps" role="img" aria-label="QR code" />
            <p v-else>{{ $t('no_data') }}</p>
          </div>
          <div class="flex flex-col gap-2 items-center">
            <button
              id="copy-qr-image-button"
              class="cursor-pointer outline-none bg-gray-300 text-black hover:shadow w-fit flex flex-row gap-1"
              @click="copyQRToClipboard"
              :aria-label="$t('copy_clipboard')"
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
              <p>{{ $t('copy_clipboard') }}</p>
            </button>
            <div class="flex flex-row gap-2 items-center">
              <button
                id="download-qr-image-button-png"
                class="cursor-pointer outline-none bg-gray-300 text-black hover:shadow"
                @click="downloadQRImageAsPng"
                :aria-label="$t('download_qr_code_png')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
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
                class="cursor-pointer outline-none bg-gray-300 text-black hover:shadow"
                @click="downloadQRImageAsSvg"
                :aria-label="$t('download_qr_code_svg')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
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
        <div id="settings" class="w-full flex flex-col flex-grow items-start text-start gap-8">
          <div class="w-full">
            <label class="block text-gray-700 dark:text-white text-sm font-bold mb-2" for="data">
              {{ $t('data_label') }}
            </label>
            <textarea
              name="data"
              class="input"
              id="url"
              rows="2"
              :placeholder="$t('data_placeholder')"
              v-model="data"
            />
          </div>
          <div class="w-full">
            <label
              class="block text-gray-700 dark:text-white text-sm font-bold mb-2"
              for="image-url"
            >
              {{ $t('image_label') }}
            </label>
            <textarea
              name="image-url"
              class="input"
              id="url"
              rows="1"
              :placeholder="$t('image_label')"
              v-model="image"
            />
          </div>
          <div class="w-full">
            <label class="block text-gray-700 dark:text-white text-sm font-bold mb-2" for="width">
              {{ $t('width_label') }}
            </label>
            <input
              class="input"
              id="width"
              type="number"
              placeholder="width in pixels"
              v-model="width"
            />
          </div>
          <div class="w-full">
            <label class="block text-gray-700 dark:text-white text-sm font-bold mb-2" for="height">
              {{ $t('height_label') }}
            </label>
            <input
              class="input"
              id="height"
              type="number"
              placeholder="height in pixels"
              v-model="height"
            />
          </div>
          <div class="w-full">
            <label class="block text-gray-700 dark:text-white text-sm font-bold mb-2" for="margin">
              {{ $t('margin_label') }}
            </label>
            <input
              class="input"
              id="margin"
              type="number"
              placeholder="margin in pixels"
              v-model="margin"
            />
          </div>
          <div class="w-full flex flex-row gap-2">
            <label>{{ $t('dot_color_label') }}</label>
            <input id="dotsColor" type="color" v-model="dotsOptionsColor" />
          </div>
          <div class="w-full">
            <label>{{ $t('dot_type_label') }}</label>
            <div
              class="flex flex-row gap-1"
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
              <label :for="'dotsOptionsType-' + type">{{ type }}</label>
            </div>
          </div>

          <div class="w-full flex flex-row gap-2">
            <label>{{ $t('corners_square_color_label') }}</label>
            <input id="cornersSquareColor" type="color" v-model="cornersSquareOptionsColor" />
          </div>
          <div class="w-full">
            <label>{{ $t('corners_square_type_label') }}</label>
            <div
              class="flex flex-row gap-1"
              v-for="type in ['dot', 'square', 'extra-rounded']"
              :key="type"
            >
              <input
                :id="'cornersSquareOptionsType-' + type"
                type="radio"
                v-model="cornersSquareOptionsType"
                :value="type"
              />
              <label :for="'cornersSquareOptionsType-' + type">{{ type }}</label>
            </div>
          </div>

          <div class="w-full flex flex-row gap-2">
            <label>{{ $t('corners_dot_color_label') }}</label>
            <input id="cornersDotColor" type="color" v-model="cornersDotOptionsColor" />
          </div>
          <div class="w-full">
            <label>{{ $t('corners_dot_type_label') }}</label>
            <div class="flex flex-row gap-1" v-for="type in ['dot', 'square']" :key="type">
              <input
                :id="'cornersDotOptionsType-' + type"
                type="radio"
                v-model="cornersDotOptionsType"
                :value="type"
              />
              <label :for="'cornersDotOptionsType-' + type">{{ type }}</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style lang="postcss">
.input {
  @apply ms-1 p-4 shadow resize-none appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white leading-tight focus:outline-none focus-visible:shadow-md dark:focus-visible:ring-1 focus-visible:ring-white;
}
</style>
