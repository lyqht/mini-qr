import { argbFromHex, hexFromArgb, themeFromSourceColor } from '@material/material-color-utilities'

export function getRandomItemInArray<T>(array: T[]) {
  return array[Math.floor(Math.random() * array.length)]
}

export function createRandomColor() {
  return (
    '#' +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')
  )
}

export interface QRColorPalette {
  dotsColor: string
  cornersSquareColor: string
  cornersDotColor: string
  backgroundColor: string
}

/**
 * Derives a complementary set of QR colors from a single seed color, using
 * Material You's HCT tonal palette (the same algorithm behind Android's
 * dynamic color). The light scheme is used regardless of the caller's
 * theme, since QR modules need to stay dark-on-light to keep contrast (and
 * therefore scannability) predictable.
 */
export function generateComplementaryQRPalette(seedColor: string): QRColorPalette {
  const theme = themeFromSourceColor(argbFromHex(seedColor))
  const scheme = theme.schemes.light

  return {
    dotsColor: hexFromArgb(scheme.primary),
    cornersSquareColor: hexFromArgb(scheme.secondary),
    cornersDotColor: hexFromArgb(scheme.tertiary),
    backgroundColor: hexFromArgb(scheme.background)
  }
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image for color extraction'))
    img.src = dataUrl
  })
}

/**
 * Samples a logo image down to a small canvas and averages its opaque
 * pixels to get a representative color, so "Randomize style" can seed the
 * palette from the logo instead of an unrelated random hue (mini-qr#26).
 * Returns null if the image can't be read (e.g. unsupported environment,
 * fully transparent image).
 */
export async function getAverageColorFromImage(dataUrl: string): Promise<string | null> {
  if (typeof document === 'undefined') return null

  try {
    const img = await loadImage(dataUrl)
    const sampleSize = 32
    const canvas = document.createElement('canvas')
    canvas.width = sampleSize
    canvas.height = sampleSize
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.drawImage(img, 0, 0, sampleSize, sampleSize)
    const { data } = ctx.getImageData(0, 0, sampleSize, sampleSize)

    let r = 0
    let g = 0
    let b = 0
    let opaquePixelCount = 0
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3]
      if (alpha === 0) continue
      r += data[i]
      g += data[i + 1]
      b += data[i + 2]
      opaquePixelCount++
    }
    if (opaquePixelCount === 0) return null

    const toHex = (channel: number) =>
      Math.round(channel / opaquePixelCount)
        .toString(16)
        .padStart(2, '0')
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  } catch (error) {
    console.warn('Failed to extract average color from logo image:', error)
    return null
  }
}
