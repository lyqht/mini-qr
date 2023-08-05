import domtoimage, { type Options } from 'dom-to-image'

const defaultOptions: Options = {
  width: 400,
  height: 400
}

const getFormattedOptions = (element: HTMLElement, options: Options): Options => {
  if (options.width && options.height) {
    const scale = getResizeScaleToFit(element, options.width, options.height)
    return {
      style: { scale, transformOrigin: 'left top', borderRadius: '48px' },
      quality: 100,
      ...options
    }
  }

  return defaultOptions
}

const getResizeScaleToFit = (child: HTMLElement, width: number, height: number): number => {
  child.style.transformOrigin = 'center'

  const scaleX = width / child.offsetWidth
  const scaleY = height / child.offsetHeight

  const maxScale = Math.min(scaleX, scaleY)
  return maxScale
}

export async function copyImageToClipboard(element: HTMLElement, options: Options) {
  console.debug('Converting to blob')
  const formattedOptions = getFormattedOptions(element, options)
  domtoimage.toBlob(element, formattedOptions).then((blob: Blob) => {
    const item = new ClipboardItem({ [blob.type]: blob })
    navigator.clipboard.write([item]).then(
      () => {
        console.log('Blob copied to clipboard')
      },
      (error) => {
        console.error('Error copying blob to clipboard:', error)
      }
    )
  })
}

export function downloadPngElement(element: HTMLElement, filename: string, options: Options) {
  const formattedOptions = getFormattedOptions(element, options)
  domtoimage.toPng(element, formattedOptions).then((dataUrl: string) => {
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = filename
    link.click()
  })
}

export function downloadSvgElement(element: HTMLElement, filename: string, options: Options) {
  const formattedOptions = getFormattedOptions(element, options)
  domtoimage
    .toSvg(element, formattedOptions)
    .then((dataUrl: string) => {
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = filename
      link.click()
    })
    .catch((error: Error) => {
      console.error('Error converting element to SVG:', error)
    })
}
