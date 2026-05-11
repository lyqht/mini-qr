import type { ECLevel, ImageConfig } from '../types'

export interface ImagePlacement {
  x: number
  y: number
  size: number
  margin: number
  hidesCell: (r: number, c: number) => boolean
}

export interface PlacementInput {
  image: ImageConfig
  count: number
  moduleSize: number
  offset: number
  totalSize: number
  errorCorrectionLevel: ECLevel
}

// Per qr-code-styling: imageSize is a fraction of the QR's error-correction
// capacity, NOT a fraction of the QR width. Multiplying by the EC factor caps
// the image at the share of modules the QR can survive losing. Same numbers
// as the upstream library so visual parity holds.
const EC_FACTOR: Record<ECLevel, number> = { L: 0.07, M: 0.15, Q: 0.25, H: 0.3 }

/**
 * Compute where the centre logo lands inside the QR area plus the matrix-cell
 * mask used to skip body dots underneath. The image is sized to fit within
 * the QR's error-correction budget, mirroring qr-code-styling's formula:
 *
 *   maxHiddenDots = floor(imageSize * EC_FACTOR[level] * count^2)
 *   maxHiddenAxisDots = floor(sqrt(maxHiddenDots))
 */
export function computeImagePlacement(input: PlacementInput): ImagePlacement {
  const { image, count, moduleSize, offset, totalSize, errorCorrectionLevel } = input
  const sizeRatio = clamp01(image.sizeRatio ?? 0.4)
  const marginPx = Math.max(0, image.margin ?? 0)

  const maxHiddenDots = Math.floor(sizeRatio * EC_FACTOR[errorCorrectionLevel] * count * count)
  let maxAxisDots = Math.floor(Math.sqrt(Math.max(0, maxHiddenDots)))
  // Keep the mask odd so it stays symmetric around the matrix centre — matches
  // qr-code-styling's centring and avoids off-by-one drift at small sizes.
  if (maxAxisDots % 2 === 0 && maxAxisDots > 1) maxAxisDots -= 1
  if (maxAxisDots < 1) maxAxisDots = 1

  const imageSizeInPx = maxAxisDots * moduleSize
  const x = offset + (count * moduleSize - imageSizeInPx) / 2
  const y = offset + (count * moduleSize - imageSizeInPx) / 2 // square only in v1

  void totalSize

  const hideBackground = image.hideBackgroundDots ?? true
  if (!hideBackground) {
    return { x, y, size: imageSizeInPx, margin: marginPx, hidesCell: () => false }
  }

  const centreModule = (count - 1) / 2
  const half = (maxAxisDots - 1) / 2
  const minR = Math.floor(centreModule - half)
  const maxR = Math.ceil(centreModule + half)
  const minC = minR
  const maxC = maxR
  return {
    x,
    y,
    size: imageSizeInPx,
    margin: marginPx,
    hidesCell: (r: number, c: number) => r >= minR && r <= maxR && c >= minC && c <= maxC
  }
}

function clamp01(v: number): number {
  if (Number.isNaN(v)) return 0.4
  if (v < 0) return 0
  if (v > 1) return 1
  return v
}
