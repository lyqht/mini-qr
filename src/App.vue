<script setup lang="ts">
import StyledQRCode from '@/components/StyledQRCode.vue'
import PLACEHOLDER_IMAGE_URL from '@/assets/placeholder_image.png'
import { ref, computed } from 'vue'

const PLACEHOLDER_PROPS = {
  data: 'https://github.com/lyqht',
  image: PLACEHOLDER_IMAGE_URL,
  width: 200,
  height: 200,
  margin: 0,
  dotsOptions: {
    color: '#abcbca',
    type: 'extra-rounded'
  },
  cornersSquareOptions: {
    color: '#abcbca',
    type: 'extra-rounded'
  },
  cornersDotOptions: {
    color: 'black',
    type: 'dot'
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
const dotsOptions = ref(PLACEHOLDER_PROPS.dotsOptions)
const cornersSquareOptions = ref(PLACEHOLDER_PROPS.cornersSquareOptions)
const cornersDotOptions = ref(PLACEHOLDER_PROPS.cornersDotOptions)
const style = ref(PLACEHOLDER_PROPS.style)

const qrCodeProps = computed(() => ({
  data: data.value,
  image: image.value,
  width: width.value,
  height: height.value,
  margin: margin.value,
  dotsOptions: dotsOptions.value,
  cornersSquareOptions: cornersSquareOptions.value,
  cornersDotOptions: cornersDotOptions.value,
}))
</script>

<template>
  <main class="grid place-items-center">
    <div>
      <h1 class="mb-8 text-4xl">Styled QR Code Generator</h1>
      <div class="flex flex-col md:flex-row items-start justify-center gap-12">
      <div id="main-content">
        <div
          id="qr-code-container"
          class="grid place-items-center overflow-hidden"
          :style="[style, {
            width: width + 'px',
            height: height + 'px'
          }]"
        >
          <StyledQRCode
            v-if="data"
            v-bind="qrCodeProps"
          />
          <p v-else>No data!</p>
      </div>
        </div>
        <div id="settings" class="w-full flex flex-col items-start text-start gap-8">
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