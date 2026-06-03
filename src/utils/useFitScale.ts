import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

export interface FitBox {
  /** Uniform scale to apply to the content (always < 1 when set). */
  scale: number
  /** Layout footprint the scaled content occupies, in px. */
  width: number
  height: number
}

/**
 * Watches `content` and, when its natural width exceeds `maxWidth()`, returns
 * the scale and scaled footprint needed to fit. Returns null while no scaling
 * is needed. Used to shrink wide framed QR previews (e.g. side captions at a
 * large caption width) without growing the preview column: the caller renders
 * an explicitly sized wrapper (width/height from FitBox) around a
 * transform-scaled inner element, so the layout footprint is capped while the
 * content itself keeps its natural size — offsetWidth-based export sizing
 * (getExportDimensions) is unaffected.
 */
export function useFitScale(
  content: Ref<HTMLElement | null>,
  maxWidth: () => number
): Ref<FitBox | null> {
  const box = ref<FitBox | null>(null)
  let observer: ResizeObserver | null = null

  const update = () => {
    const el = content.value
    if (!el) {
      box.value = null
      return
    }
    const naturalWidth = el.offsetWidth
    const naturalHeight = el.offsetHeight
    const max = maxWidth()
    if (naturalWidth <= 0 || max <= 0 || naturalWidth <= max) {
      box.value = null
      return
    }
    const scale = max / naturalWidth
    box.value = { scale, width: naturalWidth * scale, height: naturalHeight * scale }
  }

  watch(
    content,
    () => {
      observer?.disconnect()
      observer = null
      if (typeof ResizeObserver === 'undefined') return
      if (content.value) {
        observer = new ResizeObserver(update)
        observer.observe(content.value)
      }
      update()
    },
    { immediate: true, flush: 'post' }
  )

  onMounted(() => window.addEventListener('resize', update))
  onBeforeUnmount(() => {
    observer?.disconnect()
    window.removeEventListener('resize', update)
  })

  return box
}
