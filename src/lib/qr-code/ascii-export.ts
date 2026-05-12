export type AsciiFormat = 'ascii' | 'unicode-half' | 'unicode-full'

export interface AsciiExportOptions {
  /** Modules of quiet zone around the QR. Defaults to 4 (QR spec minimum). */
  quietZone?: number
  /** Override the dark/light glyphs (applies to 'ascii' and 'unicode-full'). */
  glyphs?: { dark: string; light: string }
}

const DEFAULT_QUIET_ZONE = 4
// ASCII uses INVERTED polarity: '#' chars fill the QR's light/background
// modules so they form a solid mass in monospace, while spaces leave the
// dark/data modules visually empty. Scanners accept inverted QRs, and the
// result is more reliably scannable than dark='##' because '#' glyphs have
// internal whitespace that breaks up "dark" bars when rendered.
const DEFAULT_GLYPHS: Record<'ascii' | 'unicode-full', { dark: string; light: string }> = {
  ascii: { dark: '  ', light: '##' },
  'unicode-full': { dark: '██', light: '  ' }
}

function validateMatrix(matrix: boolean[][]): number {
  if (!matrix.length || !matrix[0]?.length) {
    throw new Error('qrMatrixToText requires a non-empty matrix')
  }
  const size = matrix.length
  for (const row of matrix) {
    if (row.length !== size) {
      throw new Error('qrMatrixToText requires a square matrix')
    }
  }
  return size
}

function padWithQuietZone(matrix: boolean[][], quietZone: number): boolean[][] {
  if (quietZone <= 0) return matrix
  const size = matrix.length
  const paddedSize = size + 2 * quietZone
  const lightRow: boolean[] = new Array(paddedSize).fill(false)
  const padded: boolean[][] = []
  for (let i = 0; i < quietZone; i++) padded.push([...lightRow])
  for (const row of matrix) {
    const padRow = new Array(quietZone).fill(false)
    padded.push([...padRow, ...row, ...padRow])
  }
  for (let i = 0; i < quietZone; i++) padded.push([...lightRow])
  return padded
}

function renderPaired(padded: boolean[][], dark: string, light: string): string {
  return padded.map((row) => row.map((cell) => (cell ? dark : light)).join('')).join('\n')
}

function renderHalfBlocks(padded: boolean[][]): string {
  const lines: string[] = []
  const width = padded[0].length
  for (let r = 0; r < padded.length; r += 2) {
    const top = padded[r]
    const bottom = padded[r + 1] ?? new Array(width).fill(false)
    let line = ''
    for (let c = 0; c < width; c++) {
      const t = top[c]
      const b = bottom[c]
      if (t && b) line += '█'
      else if (t && !b) line += '▀'
      else if (!t && b) line += '▄'
      else line += ' '
    }
    lines.push(line)
  }
  return lines.join('\n')
}

export function qrMatrixToText(
  matrix: boolean[][],
  format: AsciiFormat,
  options: AsciiExportOptions = {}
): string {
  validateMatrix(matrix)
  const quietZone = options.quietZone ?? DEFAULT_QUIET_ZONE
  const padded = padWithQuietZone(matrix, quietZone)

  if (format === 'ascii') {
    const g = options.glyphs ?? DEFAULT_GLYPHS.ascii
    return renderPaired(padded, g.dark, g.light)
  }

  if (format === 'unicode-full') {
    const g = options.glyphs ?? DEFAULT_GLYPHS['unicode-full']
    return renderPaired(padded, g.dark, g.light)
  }

  if (format === 'unicode-half') {
    return renderHalfBlocks(padded)
  }

  const exhaustive: never = format
  throw new Error(`Unknown ASCII format: ${exhaustive}`)
}
