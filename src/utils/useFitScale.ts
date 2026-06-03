import { onBeforeUnmount, ref, watch, type Ref } from 'vue'

/**
 * Returns a scale factor that visually shrinks `content` (via CSS transform)
 * so it never overflows `container` horizontally — used to keep wide framed
 * QR previews (e.g. side captions with a large caption width) inside the app
 * preview area. Transforms don't affect layout measurements, so
 * offsetWidth-based export sizing (getExportDimensions) is unaffected.
 */
export function useFitScale(
  container: Ref<HTMLElement | null>,
  content: Ref<HTMLElement | null>
): Ref<number> {
  const scale = ref(1)
  let observer: ResizeObserver | null = null

  const update = () => {
    const containerWidth = container.value?.clientWidth ?? 0
    const contentWidth = content.value?.offsetWidth ?? 0
    scale.value =
      containerWidth > 0 && contentWidth > 0 ? Math.min(1, containerWidth / contentWidth) : 1
  }

  watch(
    [container, content],
    () => {
      observer?.disconnect()
      observer = null
      if (typeof ResizeObserver === 'undefined') return
      if (!container.value && !content.value) {
        scale.value = 1
        return
      }
      observer = new ResizeObserver(update)
      if (container.value) observer.observe(container.value)
      if (content.value) observer.observe(content.value)
      update()
    },
    { immediate: true, flush: 'post' }
  )

  onBeforeUnmount(() => observer?.disconnect())
  return scale
}
