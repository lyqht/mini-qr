export type AsciiFormat = 'ascii' | 'unicode-half' | 'unicode-full'

export interface AsciiExportOptions {
  /** Modules of quiet zone around the QR. Defaults to 2. */
  quietZone?: number
  /** Override the dark/light glyphs (applies to 'ascii' and 'unicode-full'). */
  glyphs?: { dark: string; light: string }
}

export function qrMatrixToText(
  matrix: boolean[][],
  _format: AsciiFormat,
  _options?: AsciiExportOptions
): string {
  if (!matrix.length || !matrix[0]?.length) {
    throw new Error('qrMatrixToText requires a non-empty matrix')
  }
  const size = matrix.length
  for (const row of matrix) {
    if (row.length !== size) {
      throw new Error('qrMatrixToText requires a square matrix')
    }
  }
  return ''
}
