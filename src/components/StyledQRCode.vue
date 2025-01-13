<template>
  <div class="flex items-center justify-center">
    <div ref="qrCodeContainer" class="flex items-center justify-center" />
  </div>
</template>

<script setup lang="ts">
import type {
  CornerDotType,
  CornerSquareType,
  DrawType,
  Options as StyledQRCodeProps
} from 'qr-code-styling-utf8'
import QRCodeStyling from 'qr-code-styling-utf8'
import { onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<StyledQRCodeProps>(), {
  data: undefined,
  width: 200,
  height: 200,
  type: 'svg' as DrawType,
  image: undefined,
  margin: 0,
  dotsOptions: () => ({
    color: 'black',
    type: 'rounded'
  }),

  // this is set to transparent by default so that we rely on the container's background
  backgroundOptions: () => ({
    color: 'transparent'
  }),
  imageOptions: () => ({
    margin: 0,
    crossOrigin: 'anonymous'
  }),
  cornersSquareOptions: () => ({
    color: 'black',
    type: 'extra-rounded' as CornerSquareType
  }),
  cornersDotOptions: () => ({
    color: 'black',
    type: 'dot' as CornerDotType
  }),
  qrOptions: () => ({
    errorCorrectionLevel: 'Q',
    multibyte: 'UTF-8'
  })
})

const QRCodeCanvasContainer = new QRCodeStyling({
  ...props,
  image: props.image === null ? undefined : props.image
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
      qrOptions: {
        ...props.qrOptions,
        errorCorrectionLevel: props.qrOptions.errorCorrectionLevel,
        multibyte: 'UTF-8'
      }
    })
  },
  { deep: true, immediate: true }
)
</script>
