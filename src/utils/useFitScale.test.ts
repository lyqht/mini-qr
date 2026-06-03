import { afterEach, describe, expect, it } from 'vitest'
import { createApp, defineComponent, h, ref, type Ref } from 'vue'
import { useFitScale, type FitBox } from './useFitScale'

interface Harness {
  el: HTMLElement
  box: Ref<FitBox | null>
  cleanup: () => void
}

/** Mount a real element of the given size and run useFitScale against it. */
function mount(
  width: number,
  height: number,
  maxSize: () => { width: number; height?: number }
): Harness {
  const host = document.createElement('div')
  document.body.appendChild(host)
  let box!: Ref<FitBox | null>

  const app = createApp(
    defineComponent({
      setup() {
        const content = ref<HTMLElement | null>(null)
        box = useFitScale(content, maxSize)
        return () =>
          h('div', {
            ref: content,
            style: `width:${width}px;height:${height}px`
          })
      }
    })
  )
  app.mount(host)
  const el = host.querySelector('div')!
  return {
    el,
    box,
    cleanup: () => {
      app.unmount()
      host.remove()
    }
  }
}

async function settle() {
  // Let the post-flush watcher and the ResizeObserver's initial delivery run.
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
}

describe('useFitScale', () => {
  const harnesses: Harness[] = []
  function make(...args: Parameters<typeof mount>): Harness {
    const h = mount(...args)
    harnesses.push(h)
    return h
  }
  afterEach(() => {
    harnesses.splice(0).forEach((h) => h.cleanup())
  })

  it('returns null when the content fits within the cap', async () => {
    const { box } = make(200, 100, () => ({ width: 400 }))
    await settle()
    expect(box.value).toBeNull()
  })

  it('scales down uniformly when the content is wider than the cap', async () => {
    const { box } = make(800, 200, () => ({ width: 400 }))
    await settle()
    expect(box.value).not.toBeNull()
    expect(box.value!.scale).toBeCloseTo(0.5, 5)
    expect(box.value!.width).toBeCloseTo(400, 5)
    expect(box.value!.height).toBeCloseTo(100, 5)
  })

  it('honours the height cap with a uniform scale', async () => {
    const { box } = make(100, 300, () => ({ width: 400, height: 150 }))
    await settle()
    expect(box.value).not.toBeNull()
    expect(box.value!.scale).toBeCloseTo(0.5, 5)
    expect(box.value!.width).toBeCloseTo(50, 5)
    expect(box.value!.height).toBeCloseTo(150, 5)
  })

  it('uses the most constraining of the width and height caps', async () => {
    const { box } = make(800, 400, () => ({ width: 400, height: 300 }))
    await settle()
    // width cap → 0.5, height cap → 0.75; the smaller wins
    expect(box.value!.scale).toBeCloseTo(0.5, 5)
  })

  it('reacts when the content is resized', async () => {
    const { el, box } = make(200, 100, () => ({ width: 400 }))
    await settle()
    expect(box.value).toBeNull()

    el.style.width = '800px'
    await settle()
    await new Promise((r) => setTimeout(r, 50)) // ResizeObserver delivery
    expect(box.value).not.toBeNull()
    expect(box.value!.scale).toBeCloseTo(0.5, 5)
  })
})
