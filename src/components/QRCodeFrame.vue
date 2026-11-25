<script setup lang="ts">
import { PREVIEW_FRAME_FONT_SIZE, PREVIEW_QR_SIZE as PREVIEW_QRCODE_DIM_UNIT } from '@/lib/qr-code'

interface FrameStyle {
  textColor?: string
  backgroundColor?: string
  borderColor?: string
  borderWidth?: string
  borderRadius?: string
  padding?: string
  fontFamily?: string
  /** Frame background image (data:image URI or http(s) URL). Drawn over backgroundColor. */
  backgroundImage?: string
}

interface Props {
  frameText: string
  textPosition: 'top' | 'bottom' | 'left' | 'right'
  frameStyle?: FrameStyle
  /** Side captions only: caption column width in px. */
  captionWidth?: number
}

withDefaults(defineProps<Props>(), {
  textPosition: 'bottom',
  frameStyle: () => ({}),
  captionWidth: 200
})
</script>

<template>
  <div
    :class="[
      'w-fit',
      textPosition === 'left' || textPosition === 'right' ? 'flex-row' : 'flex-col',
      {
        'flex-row-reverse': textPosition === 'left',
        'flex-col-reverse': textPosition === 'top'
      }
    ]"
    :style="{
      backgroundColor: frameStyle.backgroundColor,
      backgroundImage: frameStyle.backgroundImage
        ? `url(${frameStyle.backgroundImage})`
        : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      borderColor: frameStyle.borderColor,
      borderWidth: frameStyle.borderWidth,
      borderRadius: frameStyle.borderRadius,
      padding: frameStyle.padding,
      borderStyle: frameStyle.borderColor ? 'solid' : 'none',
      gap: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }"
  >
    <slot name="qr-code"></slot>
    <p
      :style="{
        color: frameStyle.textColor,
        fontFamily: frameStyle.fontFamily || undefined,
        // Explicit so the export (svg-export.ts) can mirror it; don't rely on
        // the global `p { text-lg }` rule in style.css.
        fontSize: `${PREVIEW_FRAME_FONT_SIZE}px`,
        margin: 0,
        textAlign: 'center',
        [textPosition === 'left' || textPosition === 'right' ? 'width' : 'maxWidth']:
          textPosition === 'left' || textPosition === 'right'
            ? `${captionWidth}px`
            : `${PREVIEW_QRCODE_DIM_UNIT}px`,
        whiteSpace: 'pre-line'
      }"
    >
      {{ frameText }}
    </p>
  </div>
</template>
