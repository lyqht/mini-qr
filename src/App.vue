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
  <main class="grid place-items-center" role="main">
    <div class="w-full md:w-5/6">
      <div class="w-full mb-8 flex flex-col items-center justify-center">
      <h1 class="text-4xl">Styled QR Code Generator</h1>
      <button class="p-2 mt-2 m-0" @click="randomizeStyleSettings">
        Randomize style
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
            <p v-else>No data!</p>
          </div>
          <div class="flex flex-col gap-2 items-center">
            <button
              id="copy-qr-image-button"
              class="cursor-pointer bg-gray-300 text-black hover:shadow w-fit"
              @click="copyQRToClipboard"
              aria-label="Copy QR Code to Clipboard"
            >
              <p>Copy to clipboard</p>
            </button>
            <div class="flex flex-row gap-2 items-center">
              <button
                id="download-qr-image-button-png"
                class="cursor-pointer bg-gray-300 text-black hover:shadow"
                @click="downloadQRImageAsPng"
                aria-label="Download QR Code as PNG"
              >
                <p>PNG</p>
              </button>
              <button
                id="download-qr-image-button-svg"
                class="cursor-pointer bg-gray-300 text-black hover:shadow"
                @click="downloadQRImageAsSvg"
                aria-label="Download QR Code as SVG"
              >
                <p>SVG</p>
              </button>
            </div>
          </div>
        </div>
        <div id="settings" class="w-full flex flex-col flex-grow items-start text-start gap-8">
          <div class="w-full">
            <label class="block text-gray-700 dark:text-white text-sm font-bold mb-2" for="data">
              data
            </label>
            <textarea
              class="input"
              id="url"
              rows="2"
              placeholder="data to encode e.g. a URL or a string"
              v-model="data"
            />
          </div>
          <div class="w-full">
            <label class="block text-gray-700 dark:text-white text-sm font-bold mb-2" for="image">
              image URL
            </label>
            <textarea
              class="input"
              id="url"
              rows="1"
              placeholder="image URL if any"
              v-model="image"
            />
          </div>
          <div class="w-full">
            <label class="block text-gray-700 dark:text-white text-sm font-bold mb-2" for="width">
              width (px)
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
              height (px)
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
              margin (px)
            </label>
            <input
              class="input"
              id="margin"
              type="number"
              placeholder="margin in pixels"
              v-model="margin"
            />
          </div>
          <div class="w-full flex-row">
            <label>Dots color:</label>
            <input id="dotsColor" type="color" v-model="dotsOptionsColor" />
          </div>
          <div class="w-full">
            <label>Dots type:</label>
            <div
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

          <div class="w-full">
            <label>Corners Square color:</label>
            <input id="cornersSquareColor" type="color" v-model="cornersSquareOptionsColor" />
          </div>
          <div class="w-full">
            <label>Corners Square type:</label>
            <div v-for="type in ['dot', 'square', 'extra-rounded']" :key="type">
              <input
                :id="'cornersSquareOptionsType-' + type"
                type="radio"
                v-model="cornersSquareOptionsType"
                :value="type"
              />
              <label :for="'cornersSquareOptionsType-' + type">{{ type }}</label>
            </div>
          </div>

          <div class="w-full">
            <label>Corners Dot color:</label>
            <input id="cornersDotColor" type="color" v-model="cornersDotOptionsColor" />
          </div>
          <div class="w-full">
            <label>Corners Dot type:</label>
            <div v-for="type in ['dot', 'square']" :key="type">
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
