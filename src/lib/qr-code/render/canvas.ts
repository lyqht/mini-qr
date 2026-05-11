export interface RasterParams {
  svgString: string
  width: number
  height: number
  mimeType: 'image/png' | 'image/jpeg'
  quality?: number
  background?: string
  fontFamily?: string
}

/**
 * Rasterise an SVG string into a Blob. Browser-only — relies on the platform
 * Image loader to parse SVG and Canvas2D `toBlob` to encode.
 *
 * Throws on tainted-canvas SecurityError when the SVG references a
 * cross-origin resource without proper CORS headers.
 */
export async function rasterizeSvg(params: RasterParams): Promise<Blob> {
  const { svgString, width, height, mimeType, quality, background, fontFamily } = params

  if (typeof document === 'undefined') {
    throw new Error('rasterizeSvg requires a browser environment')
  }

  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
  if (fontFamily && fonts) {
    await fonts.ready
  }

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  try {
    const img = await loadImage(url)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not acquire 2d rendering context')
    if (background) {
      ctx.fillStyle = background
      ctx.fillRect(0, 0, width, height)
    }
    ctx.drawImage(img, 0, 0, width, height)
    return await canvasToBlob(canvas, mimeType, quality)
  } finally {
    URL.revokeObjectURL(url)
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load SVG into image'))
    img.src = url
  })
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number
): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    try {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b)
          else reject(new Error(`Canvas could not be encoded to ${mimeType}`))
        },
        mimeType,
        quality
      )
    } catch (err) {
      reject(err as Error)
    }
  })
}
