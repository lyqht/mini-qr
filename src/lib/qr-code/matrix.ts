import qrcode from 'qrcode-generator'
import type { ECLevel } from './types'
import { utf8StringToBytes } from './utf8'

let overrideInstalled = false

function ensureUtf8Override(): void {
  if (overrideInstalled) return
  const factory = qrcode as unknown as {
    stringToBytes: (s: string) => number[]
    stringToBytesFuncs?: Record<string, (s: string) => number[]>
  }
  factory.stringToBytes = utf8StringToBytes
  // v1.x exposed `stringToBytesFuncs`; v2.x dropped it. Keep both paths so
  // future SJIS callers still get UTF-8 for Byte mode.
  if (factory.stringToBytesFuncs) {
    factory.stringToBytesFuncs['UTF-8'] = utf8StringToBytes
  }
  overrideInstalled = true
}

export const MAX_DATA_BYTES: Record<ECLevel, number> = { L: 2953, M: 2331, Q: 1663, H: 1273 }

export interface QRCapacity {
  byteLength: number
  maxBytes: number
  moduleCount: number | null
}

export function measureQRCapacity(data: string, ecLevel: ECLevel): QRCapacity {
  ensureUtf8Override()
  const byteLength = utf8StringToBytes(data).length
  const maxBytes = MAX_DATA_BYTES[ecLevel]
  if (byteLength > maxBytes) return { byteLength, maxBytes, moduleCount: null }
  const qr = qrcode(0, ecLevel)
  qr.addData(data, 'Byte')
  qr.make()
  return { byteLength, maxBytes, moduleCount: qr.getModuleCount() }
}

export interface QRMatrix {
  matrix: boolean[][]
  count: number
}

export function buildMatrix(data: string, ecLevel: ECLevel): QRMatrix {
  if (!data) {
    throw new Error('QR code data must be a non-empty string')
  }
  ensureUtf8Override()
  const qr = qrcode(0, ecLevel)
  try {
    qr.addData(data, 'Byte')
    qr.make()
  } catch (err) {
    throw new Error(
      `Failed to build QR matrix for input of byte-length ${
        utf8StringToBytes(data).length
      } at EC level ${ecLevel}: ${(err as Error).message}`
    )
  }
  const count = qr.getModuleCount()
  const matrix: boolean[][] = []
  for (let r = 0; r < count; r++) {
    const row: boolean[] = []
    for (let c = 0; c < count; c++) row.push(qr.isDark(r, c))
    matrix.push(row)
  }
  return { matrix, count }
}
