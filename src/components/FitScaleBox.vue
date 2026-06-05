<script setup lang="ts">
import { ref } from 'vue'
import { useFitScale } from '@/utils/useFitScale'

/**
 * Caps the slotted content's layout footprint: when its natural size exceeds
 * min(maxWidth, viewport - viewportMargin) × maxHeight, the content renders
 * transform-scaled inside a wrapper sized to the scaled footprint, so it
 * never grows its (content-sized) column or overflows the viewport. The slot
 * keeps its natural size — offsetWidth-based measurements inside it are
 * unaffected.
 */
const props = withDefaults(
  defineProps<{
    /** Hard width cap in px; omit to cap only by viewport width. */
    maxWidth?: number
    /** Hard height cap in px; omit for no height cap. */
    maxHeight?: number
    /** Horizontal allowance subtracted from the viewport width. */
    viewportMargin?: number
  }>(),
  { maxWidth: Number.POSITIVE_INFINITY, maxHeight: undefined, viewportMargin: 48 }
)

const contentEl = ref<HTMLElement | null>(null)
const fit = useFitScale(contentEl, () => ({
  width: Math.min(props.maxWidth, window.innerWidth - props.viewportMargin),
  height: props.maxHeight
}))
</script>

<template>
  <div
    :style="
      fit ? { width: `${fit.width}px`, height: `${fit.height}px`, overflow: 'hidden' } : undefined
    "
  >
    <div
      :style="fit ? { transform: `scale(${fit.scale})`, transformOrigin: 'top left' } : undefined"
    >
      <div ref="contentEl" class="w-fit">
        <slot />
      </div>
    </div>
  </div>
</template>
