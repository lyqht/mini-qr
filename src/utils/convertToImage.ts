import domtoimage, { type Options } from 'dom-to-image'
import { elementToSVG, inlineResources } from 'dom-to-svg'

const defaultOptions: Options = {
  width: 400,
  height: 400
}

const getFormattedOptions = (
  element: HTMLElement,
  options: Options,
  borderRadius?: string
): Options => {
  if (options.width && options.height) {
    const scale = getResizeScaleToFit(element, options.width, options.height)
    return {
      style: { scale, transformOrigin: 'left top', borderRadius: borderRadius ?? '48px' },
      quality: 100,
      ...options,
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

export const IS_COPY_IMAGE_TO_CLIPBOARD_SUPPORTED =
  navigator.clipboard && navigator.clipboard.write != undefined

export async function copyImageToClipboard(
  element: HTMLElement,
  options: Options,
  borderRadius?: string
) {
  if (IS_COPY_IMAGE_TO_CLIPBOARD_SUPPORTED) {
    const formattedOptions = getFormattedOptions(element, options, borderRadius)
    console.debug('Converting to blob')
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
}

export async function getPngElement(element: HTMLElement, options: Options, borderRadius?: string) {
  const formattedOptions = getFormattedOptions(element, options, borderRadius)
  return new Promise<string>((resolve, reject) => {
    domtoimage
      .toBlob(element, formattedOptions)
      .then((blob: Blob) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result)
          } else {
            reject(new Error('Failed to convert blob to data URL'))
          }
        }
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(blob)
      })
      .catch(reject)
  })
}

export function downloadPngElement(
  element: HTMLElement,
  filename: string,
  options: Options,
  borderRadius?: string
) {
  getPngElement(element, options, borderRadius)
    .then((dataUrl: string) => {
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = filename
      link.click()
    })
    .catch((error: Error) => {
      console.error('Error converting element to PNG:', error)
    })
}

export async function getJpgElement(element: HTMLElement, options: Options, borderRadius?: string) {
  const formattedOptions = getFormattedOptions(element, options, borderRadius)
  return domtoimage.toJpeg(element, formattedOptions)
}

export function downloadJpgElement(
  element: HTMLElement,
  filename: string,
  options: Options,
  borderRadius?: string
) {
  getJpgElement(element, options, borderRadius)
    .then((dataUrl: string) => {
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = filename
      link.click()
    })
    .catch((error: Error) => {
      console.error('Error converting element to JPG:', error)
    })
}

function applySvgOptions(svgDocument: Document, options: Options) {
  const svgElement = svgDocument.documentElement
  if (options.width) svgElement.setAttribute('width', options.width.toString())
  if (options.height) svgElement.setAttribute('height', options.height.toString())
  if (options.style) {
    for (const [key, value] of Object.entries(options.style)) {
      svgElement.style[key as any] = value as any
    }
  }
}

export async function getSvgString(
  element: HTMLElement,
  options: Options,
  borderRadius?: string
): Promise<string> {
  const formattedOptions = getFormattedOptions(element, options, borderRadius)
  const svgDocument = elementToSVG(element)
  await inlineResources(svgDocument.documentElement)
  applySvgOptions(svgDocument, formattedOptions)
  return new XMLSerializer().serializeToString(svgDocument)
}

export async function getSvgElement(
  element: HTMLElement,
  options: Options,
  borderRadius?: string
): Promise<string> {
  const svgString = await getSvgString(element, options, borderRadius)

  // Convert SVG string to data URL
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`
}

export function downloadSvgElement(
  element: HTMLElement,
  filename: string,
  options: Options,
  borderRadius?: string
) {
  getSvgElement(element, options, borderRadius)
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
