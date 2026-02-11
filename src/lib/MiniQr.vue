<template>
  <StyledQRCode v-bind="props" />
</template>

<script setup lang="ts">
import type { Options as StyledQRCodeOptions } from 'qr-code-styling'
import StyledQRCode from '@/components/StyledQRCode.vue'

const props = withDefaults(defineProps<StyledQRCodeOptions>(), {
  data: undefined,
  width: 200,
  height: 200,
  type: 'svg',
  image: undefined,
  margin: 0,
  dotsOptions: () => ({
    color: 'black',
    type: 'rounded'
  }),
  backgroundOptions: () => ({
    color: 'transparent'
  }),
  imageOptions: () => ({
    margin: 0,
    crossOrigin: 'anonymous'
  }),
  cornersSquareOptions: () => ({
    color: 'black',
    type: 'extra-rounded'
  }),
  cornersDotOptions: () => ({
    color: 'black',
    type: 'dot'
  }),
  qrOptions: () => ({
    errorCorrectionLevel: 'Q'
  })
})
</script>
