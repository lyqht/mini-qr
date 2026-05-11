<template>
  <div class="flex items-center justify-center">
    <div ref="qrCodeContainer" class="flex items-center justify-center" />
  </div>
</template>

<script setup lang="ts">
import {
  createQRCode,
  fromLegacyOptions,
  type CornerDotType,
  type CornerSquareType,
  type DrawType,
  type Options as StyledQRCodeProps,
  type QRCodeInstance
} from '@/lib/qr-code'
import { onBeforeUnmount, onMounted, ref, toRaw, watch } from 'vue'

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
    errorCorrectionLevel: 'Q'
  })
})

const qrCodeContainer = ref<HTMLElement>()
let instance: QRCodeInstance | undefined

function adaptedConfig() {
  const legacy = { ...toRaw(props), image: props.image === null ? undefined : props.image }
  return fromLegacyOptions(legacy as StyledQRCodeProps)
}

onMounted(() => {
  if (!qrCodeContainer.value) return
  instance = createQRCode(adaptedConfig())
  instance.attachTo(qrCodeContainer.value)
})

watch(
  () => props,
  () => {
    if (!instance) return
    instance.update(adaptedConfig())
  },
  { deep: true }
)

onBeforeUnmount(() => {
  instance?.dispose()
  instance = undefined
})
</script>
