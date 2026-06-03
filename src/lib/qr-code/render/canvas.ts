export interface RasterParams {
  svgString: string
  width: number
  height: number
  mimeType: 'image/png' | 'image/jpeg'
  quality?: number
  background?: string
  fontFamily?: string
}

interface ImageOverlay {
  href: string
  x: number
  y: number
  width: number
  height: number
}

/**
 * Rasterise an SVG string into a Blob. Browser-only — relies on the platform
 * Image loader to parse SVG and Canvas2D `toBlob` to encode.
 *
 * When the SVG carries an `<image>` element (the centre logo), we strip it
 * before rasterising and draw it directly onto the canvas afterwards.
 * Reason: an SVG loaded via `<img src>` (or via an object URL into an
 * `Image`) is treated as a sandboxed image by the browser and silently
 * refuses to fetch any external resources referenced inside it. The logo
 * would render as a blank slot in the exported PNG/JPG. Drawing the logo
 * directly on the canvas sidesteps that restriction; cross-origin URLs
 * still need permissive CORS, otherwise the logo is skipped and a warning
 * is logged.
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

  const { svg: svgWithoutImage, overlay } = extractImageOverlay(svgString)
  const { viewBoxWidth, viewBoxHeight } = readViewBox(svgString, width, height)

  const blob = new Blob([svgWithoutImage], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  try {
    const img = await loadSvgImage(url)
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

    if (overlay) {
      await drawOverlay(ctx, overlay, width / viewBoxWidth, height / viewBoxHeight)
    }

    return await canvasToBlob(canvas, mimeType, quality)
  } finally {
    URL.revokeObjectURL(url)
  }
}

async function drawOverlay(
  ctx: CanvasRenderingContext2D,
  overlay: ImageOverlay,
  scaleX: number,
  scaleY: number
): Promise<void> {
  try {
    const logo = await loadOverlayImage(overlay.href)
    ctx.drawImage(
      logo,
      overlay.x * scaleX,
      overlay.y * scaleY,
      overlay.width * scaleX,
      overlay.height * scaleY
    )
  } catch (err) {
    console.warn('QR logo failed to load for raster export, skipping:', err)
  }
}

function loadSvgImage(url: string): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load SVG into image'))
    img.src = url
  })
}

function loadOverlayImage(href: string): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    // Only set crossOrigin for non-data URIs — data: URIs don't need it and
    // some older browsers reject the combination.
    if (!href.startsWith('data:')) {
      img.crossOrigin = 'anonymous'
    }
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load overlay image: ${href}`))
    img.src = href
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

function extractImageOverlay(svg: string): { svg: string; overlay: ImageOverlay | null } {
  // Frame.ts lifts the <image> out of the QR group with absolute viewBox
  // coordinates, so we can rely on simple regex extraction here — no parent
  // transforms to compose. The SVG may carry several <image> elements (frame
  // background + centre logo) — scan them all for the external one.
  for (const match of svg.matchAll(/<image\b[^>]*\/>/g)) {
    const attrs = match[0]
    const href = readAttr(attrs, 'href') ?? readAttr(attrs, 'xlink:href')
    if (!href) continue

    // Data URIs render reliably via the SVG path (no sandbox issue — the bytes
    // are inline). Leave them in the SVG; only intercept external URLs which
    // the SVG-loaded-via-img-tag would silently fail to fetch.
    if (href.startsWith('data:')) continue

    const x = parseNumberAttr(attrs, 'x', 0)
    const y = parseNumberAttr(attrs, 'y', 0)
    const width = parseNumberAttr(attrs, 'width', 0)
    const height = parseNumberAttr(attrs, 'height', 0)
    if (width <= 0 || height <= 0) continue
    return {
      svg: svg.replace(attrs, ''),
      overlay: { href, x, y, width, height }
    }
  }
  return { svg, overlay: null }
}

function readAttr(source: string, name: string): string | null {
  const escaped = name.replace(/:/g, '\\:')
  const re = new RegExp(`(?:^|\\s)${escaped}\\s*=\\s*"([^"]*)"`)
  const m = source.match(re)
  return m ? m[1] : null
}

function parseNumberAttr(source: string, name: string, fallback: number): number {
  const raw = readAttr(source, name)
  if (raw == null) return fallback
  const n = parseFloat(raw)
  return Number.isFinite(n) ? n : fallback
}

function readViewBox(
  svg: string,
  fallbackWidth: number,
  fallbackHeight: number
): { viewBoxWidth: number; viewBoxHeight: number } {
  const match = svg.match(/\bviewBox\s*=\s*"([^"]+)"/)
  if (!match) return { viewBoxWidth: fallbackWidth, viewBoxHeight: fallbackHeight }
  const parts = match[1].trim().split(/\s+/).map(Number)
  // viewBox is "min-x min-y width height" — min-x/min-y can legitimately be 0,
  // only width/height must be positive for our scale math to mean anything.
  if (
    parts.length !== 4 ||
    parts.some((n) => !Number.isFinite(n)) ||
    parts[2] <= 0 ||
    parts[3] <= 0
  ) {
    return { viewBoxWidth: fallbackWidth, viewBoxHeight: fallbackHeight }
  }
  return { viewBoxWidth: parts[2], viewBoxHeight: parts[3] }
}
