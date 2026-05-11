import type { DotShape } from '../types'
import { getNeighbor, isFinderRegion, type Matrix } from './neighbors'

export interface DotsRenderArgs {
  matrix: Matrix
  count: number
  moduleSize: number
  offset: number
  shape: DotShape
  hideCell?: (r: number, c: number) => boolean
}

/**
 * Aggregate every dark body cell into a single SVG `path d` string. Caller
 * wraps the result in `<path fill="..." />`. Finder regions are skipped.
 */
export function buildDotsPath(args: DotsRenderArgs): string {
  const { matrix, count, moduleSize, offset, shape, hideCell } = args
  const parts: string[] = []
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (!matrix[r][c]) continue
      if (isFinderRegion(r, c, count)) continue
      if (hideCell && hideCell(r, c)) continue
      const x = offset + c * moduleSize
      const y = offset + r * moduleSize
      parts.push(cellPath(shape, x, y, moduleSize, r, c, matrix, count))
    }
  }
  return parts.join(' ')
}

function cellPath(
  shape: DotShape,
  x: number,
  y: number,
  s: number,
  r: number,
  c: number,
  matrix: Matrix,
  count: number
): string {
  switch (shape) {
    case 'square':
      return squarePath(x, y, s)
    case 'dots':
      return circlePath(x + s / 2, y + s / 2, s / 2)
    case 'rounded':
      return roundedSquarePath(x, y, s, s * 0.25)
    case 'extra-rounded':
      return cornerAwarePath(x, y, s, r, c, matrix, count, s * 0.5)
    case 'classy':
      return classyPath(x, y, s, r, c, matrix, count, s * 0.3)
    case 'classy-rounded':
      return classyPath(x, y, s, r, c, matrix, count, s * 0.5)
    default:
      return squarePath(x, y, s)
  }
}

function squarePath(x: number, y: number, s: number): string {
  return `M${x} ${y}h${s}v${s}h${-s}z`
}

function circlePath(cx: number, cy: number, r: number): string {
  return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`
}

function roundedSquarePath(x: number, y: number, s: number, radius: number): string {
  const r = Math.min(radius, s / 2)
  return (
    `M${x + r} ${y}` +
    `h${s - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}` +
    `v${s - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}` +
    `h${-(s - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}` +
    `v${-(s - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z`
  )
}

/**
 * Per-cell corner rounding driven by neighbour cells. Each of the four cell
 * corners is rounded only when both adjacent cardinal neighbours are absent —
 * matches qr-code-styling's `extra-rounded` look.
 */
function cornerAwarePath(
  x: number,
  y: number,
  s: number,
  r: number,
  c: number,
  matrix: Matrix,
  count: number,
  radius: number
): string {
  const rad = Math.min(radius, s / 2)
  const top = getNeighbor(r - 1, c, matrix, count)
  const bottom = getNeighbor(r + 1, c, matrix, count)
  const left = getNeighbor(r, c - 1, matrix, count)
  const right = getNeighbor(r, c + 1, matrix, count)

  const tl = !top && !left
  const tr = !top && !right
  const br = !bottom && !right
  const bl = !bottom && !left

  return buildCornerPath(x, y, s, rad, { tl, tr, br, bl })
}

function classyPath(
  x: number,
  y: number,
  s: number,
  r: number,
  c: number,
  matrix: Matrix,
  count: number,
  radius: number
): string {
  const rad = Math.min(radius, s / 2)
  const top = getNeighbor(r - 1, c, matrix, count)
  const bottom = getNeighbor(r + 1, c, matrix, count)
  const left = getNeighbor(r, c - 1, matrix, count)
  const right = getNeighbor(r, c + 1, matrix, count)
  const tl = !top && !left
  const br = !bottom && !right
  return buildCornerPath(x, y, s, rad, { tl, tr: false, br, bl: false })
}

interface CornerFlags {
  tl: boolean
  tr: boolean
  br: boolean
  bl: boolean
}

/**
 * Emit a cell path with a configurable subset of corners rounded. The starting
 * point is the top edge just past the top-left corner; we trace clockwise.
 */
function buildCornerPath(
  x: number,
  y: number,
  s: number,
  rad: number,
  corners: CornerFlags
): string {
  const startX = corners.tl ? x + rad : x
  let d = `M${startX} ${y}`

  // top edge -> top-right
  const topRunLength = s - (corners.tl ? rad : 0) - (corners.tr ? rad : 0)
  d += `h${topRunLength}`
  if (corners.tr) d += `a${rad} ${rad} 0 0 1 ${rad} ${rad}`

  // right edge -> bottom-right
  const rightRunLength = s - (corners.tr ? rad : 0) - (corners.br ? rad : 0)
  d += `v${rightRunLength}`
  if (corners.br) d += `a${rad} ${rad} 0 0 1 ${-rad} ${rad}`

  // bottom edge -> bottom-left
  const bottomRunLength = s - (corners.br ? rad : 0) - (corners.bl ? rad : 0)
  d += `h${-bottomRunLength}`
  if (corners.bl) d += `a${rad} ${rad} 0 0 1 ${-rad} ${-rad}`

  // left edge -> top-left
  const leftRunLength = s - (corners.bl ? rad : 0) - (corners.tl ? rad : 0)
  d += `v${-leftRunLength}`
  if (corners.tl) d += `a${rad} ${rad} 0 0 1 ${rad} ${-rad}`

  d += 'z'
  return d
}
