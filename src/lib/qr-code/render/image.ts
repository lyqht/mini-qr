import type { ImageConfig } from '../types'

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
}

/**
 * Compute where the centre logo lands inside the QR area plus the matrix-cell
 * mask used to skip body dots underneath. The mask snaps to module
 * boundaries so the cut-out doesn't leave sliver-dots peeking through.
 */
export function computeImagePlacement(input: PlacementInput): ImagePlacement {
  const { image, count, moduleSize, offset, totalSize } = input
  const sizeRatio = clamp01(image.sizeRatio ?? 0.4)
  const margin = Math.max(0, image.margin ?? 0)
  const innerArea = totalSize - 2 * offset
  const targetSize = innerArea * sizeRatio
  const size = Math.max(moduleSize, targetSize)
  const x = (totalSize - size) / 2
  const y = (totalSize - size) / 2

  const hideBackground = image.hideBackgroundDots ?? true
  if (!hideBackground) {
    return { x, y, size, margin, hidesCell: () => false }
  }
  const maskHalf = (size + margin * 2) / 2
  const centreModule = count / 2
  const maskHalfInModules = maskHalf / moduleSize
  const minR = Math.floor(centreModule - maskHalfInModules)
  const maxR = Math.ceil(centreModule + maskHalfInModules) - 1
  const minC = minR
  const maxC = maxR
  return {
    x,
    y,
    size,
    margin,
    hidesCell: (r: number, c: number) => r >= minR && r <= maxR && c >= minC && c <= maxC
  }
}

function clamp01(v: number): number {
  if (Number.isNaN(v)) return 0.4
  if (v < 0) return 0
  if (v > 1) return 1
  return v
}
