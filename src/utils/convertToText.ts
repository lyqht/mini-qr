import { qrMatrixToText, type AsciiFormat } from '@/lib/qr-code'
import { downloadBlob } from '@/utils/download'

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

export function downloadAsciiText(
  input: TextExportInput,
  filename: string,
  wrap: 'md' | 'txt'
): void {
  try {
    const body = wrap === 'md' ? getMarkdownText(input) : getAsciiText(input)
    const mime = wrap === 'md' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8'
    const blob = new Blob([body], { type: mime })
    downloadBlob(blob, filename)
  } catch (error) {
    console.error('Error generating text export:', error)
  }
}

export async function copyAsciiTextToClipboard(input: TextExportInput): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(getAsciiText(input))
    return true
  } catch (error) {
    console.error('Error copying QR text to clipboard:', error)
    return false
  }
}
