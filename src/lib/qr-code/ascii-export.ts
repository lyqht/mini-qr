export type AsciiFormat = 'ascii' | 'unicode-half' | 'unicode-full'

export interface AsciiExportOptions {
  /** Modules of quiet zone around the QR. Defaults to 2. */
  quietZone?: number
  /** Override the dark/light glyphs (applies to 'ascii' and 'unicode-full'). */
  glyphs?: { dark: string; light: string }
}

const DEFAULT_QUIET_ZONE = 2
const DEFAULT_GLYPHS: Record<'ascii' | 'unicode-full', { dark: string; light: string }> = {
  ascii: { dark: '##', light: '  ' },
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

  // unicode-full and unicode-half implemented in later tasks
  return ''
}
