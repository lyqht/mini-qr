<script setup lang="ts">
interface FrameStyle {
  textColor?: string
  backgroundColor?: string
  borderColor?: string
  borderWidth?: string
  borderRadius?: string
  padding?: string
}

interface Props {
  frameText: string
  textPosition: 'top' | 'bottom' | 'left' | 'right'
  frameStyle?: FrameStyle
}

withDefaults(defineProps<Props>(), {
  textPosition: 'bottom',
  frameStyle: () => ({})
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
        margin: 0,
        textAlign: 'center',
        [textPosition === 'left' || textPosition === 'right' ? 'width' : 'maxWidth']: '200px'
      }"
    >
      {{ frameText }}
    </p>
  </div>
</template>
