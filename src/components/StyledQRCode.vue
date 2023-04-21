<template>
  <div class="flex items-center justify-center">
    <div ref="qrCodeContainer" class="flex items-center justify-center" />
  </div>
</template>

<script setup lang="ts">
import type { CornerDotType, CornerSquareType, DotType, DrawType } from 'qr-code-styling';
import QRCodeStyling from 'qr-code-styling';
import { onMounted, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    data: string
    width?: number
    height?: number
    type?: DrawType
    image?: string
    margin?: number
    dotsOptions?: {
      color?: string
      type?: DotType
    }
    backgroundOptions?: {
      color?: string
    }
    imageOptions?: {
      margin?: number
    }
    cornersSquareOptions?: {
      type?: CornerSquareType
      color?: string
    }
  }>(),
  {
    width: 300,
    height: 300,
    type: 'svg' as DrawType,
    image: undefined,
    margin: 0,
    dotsOptions: () => ({
      color: 'black',
      type: 'rounded',
    }),

    // this is set to transparent by default so that we rely on the container's background
    backgroundOptions: () => ({
      color: 'transparent',
    }),
    imageOptions: () => ({
      margin: 0,
      crossOrigin: 'anonymous',
    }),
    cornersSquareOptions: () => ({
      color: 'black',
      type: 'extra-rounded' as CornerSquareType,
    }),
    cornersDotOptions: () => ({
      color: 'black',
      type: 'dot' as CornerDotType,
    }),
  },
)

const QRCodeCanvasContainer = new QRCodeStyling({
  ...props,
  image: props.image === null ? undefined : props.image,
})
const qrCodeContainer = ref<HTMLElement>()

onMounted(async () => {
  QRCodeCanvasContainer.append(qrCodeContainer.value)
})

watch(
  () => props,
  () => {
    QRCodeCanvasContainer.update({
      ...props,
      image: props.image === null ? undefined : props.image,
    })
  },
  { deep: true, immediate: true },
)
</script>
