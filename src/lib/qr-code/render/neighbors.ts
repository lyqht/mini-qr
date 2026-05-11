export type Matrix = boolean[][]

export function getNeighbor(r: number, c: number, matrix: Matrix, count: number): boolean {
  if (r < 0 || c < 0 || r >= count || c >= count) return false
  return matrix[r][c]
}

/**
 * Cells inside one of the three 7×7 finder patterns (top-left, top-right,
 * bottom-left). Body-dot rendering skips these so the corner-square and
 * corner-dot drawers own those regions exclusively.
 */
export function isFinderRegion(r: number, c: number, count: number): boolean {
  const inTL = r < 7 && c < 7
  const inTR = r < 7 && c >= count - 7
  const inBL = r >= count - 7 && c < 7
  return inTL || inTR || inBL
}

export interface FinderOrigin {
  row: number
  col: number
}

export function finderOrigins(count: number): FinderOrigin[] {
  return [
    { row: 0, col: 0 },
    { row: 0, col: count - 7 },
    { row: count - 7, col: 0 }
  ]
}
