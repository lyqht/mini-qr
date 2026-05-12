import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { downloadBlob } from './download'

describe('downloadBlob', () => {
  let createObjectURLSpy: ReturnType<typeof vi.spyOn>
  let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>
  let clickSpy: ReturnType<typeof vi.fn>
  let appendChildSpy: ReturnType<typeof vi.spyOn>
  let removeChildSpy: ReturnType<typeof vi.spyOn>
  let createdAnchor: HTMLAnchorElement | null = null

  beforeEach(() => {
    vi.useFakeTimers()
    createdAnchor = null

    createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake-url')
    revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    clickSpy = vi.fn()
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag) as HTMLAnchorElement
      if (tag === 'a') {
        createdAnchor = el
        el.click = clickSpy
      }
      return el
    })
    appendChildSpy = vi.spyOn(document.body, 'appendChild')
    removeChildSpy = vi.spyOn(document.body, 'removeChild')
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('creates an object URL from the blob and assigns it to the anchor', () => {
    const blob = new Blob(['hello'], { type: 'text/plain' })

    downloadBlob(blob, 'hello.txt')

    expect(createObjectURLSpy).toHaveBeenCalledWith(blob)
    expect(createdAnchor!.href).toBe('blob:fake-url')
    expect(createdAnchor!.download).toBe('hello.txt')
  })

  it('appends the anchor to the body, clicks it, and removes it', () => {
    downloadBlob(new Blob(['x']), 'x.txt')

    expect(appendChildSpy).toHaveBeenCalledWith(createdAnchor)
    expect(clickSpy).toHaveBeenCalledOnce()
    expect(removeChildSpy).toHaveBeenCalledWith(createdAnchor)
  })

  it('hides the anchor before clicking so it never flashes in the UI', () => {
    downloadBlob(new Blob(['x']), 'x.txt')

    expect(createdAnchor!.style.display).toBe('none')
  })

  it('revokes the object URL after a 200ms delay', () => {
    downloadBlob(new Blob(['x']), 'x.txt')

    expect(revokeObjectURLSpy).not.toHaveBeenCalled()
    vi.advanceTimersByTime(199)
    expect(revokeObjectURLSpy).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:fake-url')
  })
})
