// Detect if browser supports async Clipboard API for writing image blobs
// Exclude Safari/WebKit as it does not yet support writing image ClipboardItems
const _ua = navigator.userAgent
const _isSafari = /Safari/.test(_ua) && !/Chrome/.test(_ua) && !/Chromium/.test(_ua)
const _isMac = navigator.userAgentData?.platform === 'macOS'

export const KEY_COMBINATION_PASTE = buildKbdCombination(_isMac ? 'Cmd' : 'Ctrl', 'V')

export const IS_COPY_IMAGE_TO_CLIPBOARD_SUPPORTED =
  !!navigator.clipboard &&
  typeof navigator.clipboard.write === 'function' &&
  typeof ClipboardItem === 'function' &&
  !_isSafari

export const IS_PASTE_IMAGE_FROM_CLIPBOARD_SUPPORTED =
  !!navigator.clipboard &&
  typeof navigator.clipboard.read === 'function' &&
  typeof ClipboardItem === 'function' &&
  !_isSafari

export async function getFileFromDataTransferItemList(
  list: DataTransferItemList
): Promise<File | null> {
  for (const item of list) {
    if (item.type.startsWith('image/')) {
      return item.getAsFile()
    }
  }

  return null
}

export async function getFileFromClipboardItems(list: Array<ClipboardItem>): Promise<File | null> {
  for (const item of list) {
    for (const type of item.types) {
      if (!type.startsWith('image/')) {
        continue
      }

      const blob = await item.getType(type)
      return new File([blob], 'clipboard-image', { type })
    }
  }

  return null
}

function buildKbdCombination(...keys: string[]): string {
  return '(<kbd>' + keys.join('</kbd>+<kbd>') + '</kbd>)'
}
