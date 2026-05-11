import type { CornerDotShape, CornerSquareShape } from '../types'
import { finderOrigins } from './neighbors'

export interface CornersRenderArgs {
  count: number
  moduleSize: number
  offset: number
  shape: CornerSquareShape | CornerDotShape
}

/**
 * Three 7×1-module-thick finder square outlines (top-left, top-right,
 * bottom-left) emitted as one aggregated SVG path with `fill-rule="evenodd"`
 * so the inner cut-out renders as a hole.
 */
export function buildCornerSquaresPath(args: {
  count: number
  moduleSize: number
  offset: number
  shape: CornerSquareShape
}): string {
  const { count, moduleSize, offset, shape } = args
  const parts: string[] = []
  for (const o of finderOrigins(count)) {
    const x = offset + o.col * moduleSize
    const y = offset + o.row * moduleSize
    const outerSize = 7 * moduleSize
    const innerSize = 5 * moduleSize
    const innerX = x + moduleSize
    const innerY = y + moduleSize
    switch (shape) {
      case 'square':
        parts.push(rectPath(x, y, outerSize))
        parts.push(reverseRectPath(innerX, innerY, innerSize))
        break
      case 'rounded':
        parts.push(roundedRectPath(x, y, outerSize, outerSize * 0.125))
        parts.push(reverseRoundedRectPath(innerX, innerY, innerSize, innerSize * 0.125))
        break
      case 'extra-rounded':
        parts.push(roundedRectPath(x, y, outerSize, outerSize * 0.25))
        parts.push(reverseRoundedRectPath(innerX, innerY, innerSize, innerSize * 0.25))
        break
      case 'dot':
        parts.push(circlePath(x + outerSize / 2, y + outerSize / 2, outerSize / 2))
        parts.push(reverseCirclePath(innerX + innerSize / 2, innerY + innerSize / 2, innerSize / 2))
        break
    }
  }
  return parts.join(' ')
}

/**
 * The 3×3 inner dot of each finder pattern. Aggregated path again so the whole
 * lot is a single `<path>` element.
 */
export function buildCornerDotsPath(args: {
  count: number
  moduleSize: number
  offset: number
  shape: CornerDotShape
}): string {
  const { count, moduleSize, offset, shape } = args
  const parts: string[] = []
  for (const o of finderOrigins(count)) {
    const innerX = offset + (o.col + 2) * moduleSize
    const innerY = offset + (o.row + 2) * moduleSize
    const innerSize = 3 * moduleSize
    if (shape === 'dot') {
      parts.push(circlePath(innerX + innerSize / 2, innerY + innerSize / 2, innerSize / 2))
    } else if (shape === 'rounded') {
      parts.push(roundedRectPath(innerX, innerY, innerSize, innerSize * 0.25))
    } else {
      parts.push(rectPath(innerX, innerY, innerSize))
    }
  }
  return parts.join(' ')
}

function rectPath(x: number, y: number, s: number): string {
  return `M${x} ${y}h${s}v${s}h${-s}z`
}

function reverseRectPath(x: number, y: number, s: number): string {
  // counter-clockwise so evenodd cuts a hole
  return `M${x} ${y}v${s}h${s}v${-s}z`
}

function roundedRectPath(x: number, y: number, s: number, radius: number): string {
  const r = Math.min(radius, s / 2)
  return (
    `M${x + r} ${y}` +
    `h${s - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}` +
    `v${s - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}` +
    `h${-(s - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}` +
    `v${-(s - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z`
  )
}

function reverseRoundedRectPath(x: number, y: number, s: number, radius: number): string {
  const r = Math.min(radius, s / 2)
  return (
    `M${x + r} ${y}` +
    `a${r} ${r} 0 0 0 ${-r} ${r}` +
    `v${s - 2 * r}a${r} ${r} 0 0 0 ${r} ${r}` +
    `h${s - 2 * r}a${r} ${r} 0 0 0 ${r} ${-r}` +
    `v${-(s - 2 * r)}a${r} ${r} 0 0 0 ${-r} ${-r}z`
  )
}

function circlePath(cx: number, cy: number, r: number): string {
  return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`
}

function reverseCirclePath(cx: number, cy: number, r: number): string {
  return `M${cx - r} ${cy}a${r} ${r} 0 1 1 ${2 * r} 0a${r} ${r} 0 1 1 ${-2 * r} 0z`
}
