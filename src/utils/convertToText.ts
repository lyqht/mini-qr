import { qrMatrixToText, type AsciiFormat } from '@/lib/qr-code'

export interface TextExportInput {
  matrix: boolean[][]
  format: AsciiFormat
  quietZone?: number
}

export function getAsciiText(input: TextExportInput): string {
  return qrMatrixToText(input.matrix, input.format, { quietZone: input.quietZone })
}

export function getMarkdownText(input: TextExportInput): string {
  const body = getAsciiText(input)
  return '```\n' + body + '\n```\n'
}
