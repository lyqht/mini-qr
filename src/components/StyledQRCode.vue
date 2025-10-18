<template>
  <div class="flex items-center justify-center">
    <div
      ref="qrCodeContainer"
      class="box-border flex items-center justify-center"
      :style="containerStyle"
    />
  </div>
</template>

<script setup lang="ts">
import type {
  CornerDotType,
  CornerSquareType,
  DrawType,
  Options as StyledQRCodeProps
} from 'qr-code-styling'
import QRCodeStyling from 'qr-code-styling'
import { computed, onMounted, ref, watch } from 'vue'
import type { CSSProperties } from 'vue'

const props = withDefaults(defineProps<StyledQRCodeProps>(), {
  data: undefined,
  width: 200,
  height: 200,
  type: 'svg' as DrawType,
  image: undefined,
  margin: 0,
  dotsOptions: () => ({
    color: 'black',
    type: 'rounded',
    roundSize: false
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

/**
* IMPORTANT:
 * - The user value (props.margin) may be negative.
 * - The renderer value (quiet zone) is shifted by the base line (13)
 * and then capped to >= 0.
 * => margin_renderer = max(0, 13 + userMargin)
 */
const BASELINE_MARGIN = 13

const userMargin = computed(() => {
  const parsed = Number(props.margin)
  return Number.isFinite(parsed) ? parsed : 0
})

const rendererMargin = computed(() => {
  const m = BASELINE_MARGIN + userMargin.value
  return m < 0 ? 0 : m
})

const normalizedWidth = computed(() => {
  const parsed = Number(props.width)
  return Number.isFinite(parsed) ? Math.max(parsed, 0) : 0
})

const normalizedHeight = computed(() => {
  const parsed = Number(props.height)
  return Number.isFinite(parsed) ? Math.max(parsed, 0) : 0
})

const displayWidth = computed(() => Math.max(normalizedWidth.value, 1))
const displayHeight = computed(() => Math.max(normalizedHeight.value, 1))

const qrProps = computed<StyledQRCodeProps>(() => ({
  ...props,
  width: displayWidth.value,
  height: displayHeight.value,
  margin: rendererMargin.value,
  image: props.image === null ? undefined : props.image
}))

const containerStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {
    width: `${displayWidth.value}px`,
    height: `${displayHeight.value}px`
  }

  const backgroundColor = props.backgroundOptions?.color ?? 'transparent'
  style.background = backgroundColor

  return style
})

const QRCodeCanvasContainer = new QRCodeStyling(qrProps.value)
const qrCodeContainer = ref<HTMLElement>()

onMounted(async () => {
  QRCodeCanvasContainer.append(qrCodeContainer.value)
})

watch(
  qrProps,
  (nextProps) => {
    QRCodeCanvasContainer.update(nextProps)
  },
  { deep: true, immediate: true }
)
</script>