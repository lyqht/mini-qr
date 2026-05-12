import { IS_COPY_IMAGE_TO_CLIPBOARD_SUPPORTED } from '@/utils/clipboard'
import { downloadBlob } from '@/utils/download'
import { buildSvgExportString, rasterizeSvg, type SvgExportInput } from '@/lib/qr-code'

export interface ImageExportInput extends SvgExportInput {
  /**
   * Output raster dimensions for PNG/JPG. Defaults to the SVG's natural size
   * (i.e., `size` for no-frame, or the frame's computed outer dimensions).
   */
  targetSize?: { width: number; height: number }
  /** JPEG/PNG encoder quality 0–1 (JPEG only; PNG ignores). */
  quality?: number
  /** Background colour for JPG (no transparency). Defaults to white. */
  jpgBackground?: string
}

interface RenderedSize {
  width: number
  height: number
}

const SVG_VIEWBOX_RE = /viewBox="0 0 ([0-9.]+) ([0-9.]+)"/

function naturalSizeFromSvg(svgString: string): RenderedSize | null {
  const m = SVG_VIEWBOX_RE.exec(svgString)
  if (!m) return null
  return { width: Number(m[1]), height: Number(m[2]) }
}

function pickTargetSize(input: ImageExportInput, svgString: string): RenderedSize {
  if (input.targetSize) return input.targetSize
  const natural = naturalSizeFromSvg(svgString)
  if (natural) return natural
  // Fallback to size hint or a reasonable default.
  const hint = input.size
  if (hint) return hint
  return { width: 400, height: 400 }
}

async function rasterizeFromInput(
  input: ImageExportInput,
  mime: 'image/png' | 'image/jpeg'
): Promise<Blob> {
  const svgString = buildSvgExportString(input)
  const { width, height } = pickTargetSize(input, svgString)
  return rasterizeSvg({
    svgString,
    width,
    height,
    mimeType: mime,
    quality: input.quality,
    background: mime === 'image/jpeg' ? (input.jpgBackground ?? '#ffffff') : undefined
  })
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

/* ---------- PNG ---------- */

export async function getPngBlob(input: ImageExportInput): Promise<Blob> {
  return rasterizeFromInput(input, 'image/png')
}

export async function getPngElement(input: ImageExportInput): Promise<string> {
  const blob = await getPngBlob(input)
  return blobToDataUrl(blob)
}

export async function downloadPngElement(input: ImageExportInput, filename: string): Promise<void> {
  try {
    const blob = await getPngBlob(input)
    downloadBlob(blob, filename)
  } catch (error) {
    console.error('Error generating PNG export:', error)
  }
}

/* ---------- JPG ---------- */

export async function getJpgBlob(input: ImageExportInput): Promise<Blob> {
  return rasterizeFromInput(input, 'image/jpeg')
}

export async function getJpgElement(input: ImageExportInput): Promise<string> {
  const blob = await getJpgBlob(input)
  return blobToDataUrl(blob)
}

export async function downloadJpgElement(input: ImageExportInput, filename: string): Promise<void> {
  try {
    const blob = await getJpgBlob(input)
    downloadBlob(blob, filename)
  } catch (error) {
    console.error('Error generating JPG export:', error)
  }
}

/* ---------- Clipboard ---------- */

export async function copyImageToClipboard(input: ImageExportInput): Promise<void> {
  if (!IS_COPY_IMAGE_TO_CLIPBOARD_SUPPORTED) {
    console.error('Clipboard.write is not supported')
    return
  }
  try {
    const blob = await getPngBlob(input)
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
  } catch (error) {
    console.error('Error copying image to clipboard:', error)
  }
}

/* ---------- SVG (already lib-backed) ---------- */

export function getSvgString(input: SvgExportInput): string {
  return buildSvgExportString(input)
}

/**
 * Build an SVG export string with any external `<image href="http(s)://...">`
 * resources inlined as data URIs. Without this, viewers that sandbox local
 * SVG files (macOS Preview/Quick Look, browsers opened on file://) refuse
 * to fetch the external image and render a broken-image placeholder.
 * On a fetch failure the original href is kept and a warning is logged.
 */
export async function getInlinedSvgString(input: SvgExportInput): Promise<string> {
  return inlineExternalImagesInSvg(buildSvgExportString(input))
}

export function getSvgElement(input: SvgExportInput): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(getSvgString(input))}`
}

export async function downloadSvgElement(input: SvgExportInput, filename: string): Promise<void> {
  try {
    const svgString = await getInlinedSvgString(input)
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    downloadBlob(blob, filename)
  } catch (error) {
    console.error('Error generating SVG export:', error)
  }
}

async function inlineExternalImagesInSvg(svgString: string): Promise<string> {
  // Collect unique external (non-data:) hrefs referenced in the SVG. Targets
  // either `href="..."` or `xlink:href="..."` attribute values.
  const urls = new Set<string>()
  const re = /\b(?:xlink:)?href="([^"]+)"/g
  let m: RegExpExecArray | null
  while ((m = re.exec(svgString)) !== null) {
    const url = m[1]
    if (url.startsWith('data:')) continue
    if (!/^https?:\/\//i.test(url)) continue
    urls.add(url)
  }
  if (urls.size === 0) return svgString

  const replacements = new Map<string, string>()
  await Promise.all(
    Array.from(urls).map(async (url) => {
      try {
        const dataUri = await fetchAsDataUri(url)
        replacements.set(url, dataUri)
      } catch (err) {
        console.warn(`Failed to inline image href for SVG export: ${url}`, err)
      }
    })
  )

  let result = svgString
  for (const [url, dataUri] of replacements) {
    result = result.split(url).join(dataUri)
  }
  return result
}

async function fetchAsDataUri(url: string): Promise<string> {
  const response = await fetch(url, { mode: 'cors' })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const blob = await response.blob()
  return blobToDataUrl(blob)
}
