import { IS_COPY_IMAGE_TO_CLIPBOARD_SUPPORTED } from '@/utils/clipboard'
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

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 200)
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
    triggerDownload(blob, filename)
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
    triggerDownload(blob, filename)
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

export function getSvgElement(input: SvgExportInput): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(getSvgString(input))}`
}

export function downloadSvgElement(input: SvgExportInput, filename: string): void {
  try {
    const svgString = getSvgString(input)
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    triggerDownload(blob, filename)
  } catch (error) {
    console.error('Error generating SVG export:', error)
  }
}
