import domtoimage, { type Options } from 'dom-to-image'

const defaultOptions: Options = {
  width: 400,
  height: 400
}

export async function copyImageToClipboard(element: HTMLElement) {
  console.debug("Converting to blob")
  const blob = await domtoimage.toBlob(element, defaultOptions)
  const item = new ClipboardItem({ [blob.type]: blob });
  navigator.clipboard.write([item]).then(() => {
    console.log('Blob copied to clipboard');
  }, (error) => {
    console.error('Error copying blob to clipboard:', error);
  });
}

export function downloadPngElement(element: HTMLElement, filename: string, options?: Options) {
  domtoimage.toPng(element, options ?? defaultOptions).then((dataUrl: string) => {
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = filename
    link.click()
  })
}

export function downloadSvgElement(element: HTMLElement, filename: string, options?: Options) {
  domtoimage
    .toSvg(element, options ?? defaultOptions)
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
