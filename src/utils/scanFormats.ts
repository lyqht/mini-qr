/**
 * Helpers for interpreting the symbology (format) reported by html5-qrcode when a
 * code is scanned. Lets the Scan UI distinguish QR-family 2D codes (which carry
 * rich content like URLs/WiFi/vCards) from 1D retail/industrial barcodes (which
 * are usually raw product/identifier codes).
 *
 * Format names match html5-qrcode's `Html5QrcodeSupportedFormats` enum keys, e.g.
 * `QR_CODE`, `EAN_13`, `CODE_128` (available via the decoded result's
 * `result.format.formatName`).
 */

export type ScanCategory = 'qr' | 'barcode'

/** 1D linear barcode symbologies. Everything else is treated as QR-family. */
const BARCODE_FORMATS = new Set([
  'EAN_13',
  'EAN_8',
  'UPC_A',
  'UPC_E',
  'UPC_EAN_EXTENSION',
  'CODE_128',
  'CODE_39',
  'CODE_93',
  'CODABAR',
  'ITF',
  'RSS_14',
  'RSS_EXPANDED'
])

/** Retail numeric symbologies that map to real-world products worth looking up. */
const PRODUCT_BARCODE_FORMATS = new Set(['EAN_13', 'EAN_8', 'UPC_A', 'UPC_E'])

/** Friendly display labels for known formats. Unknown formats are humanized. */
const FORMAT_LABELS: Record<string, string> = {
  QR_CODE: 'QR Code',
  AZTEC: 'Aztec',
  DATA_MATRIX: 'Data Matrix',
  PDF_417: 'PDF417',
  MAXICODE: 'MaxiCode',
  EAN_13: 'EAN-13',
  EAN_8: 'EAN-8',
  UPC_A: 'UPC-A',
  UPC_E: 'UPC-E',
  UPC_EAN_EXTENSION: 'UPC/EAN Extension',
  CODE_128: 'Code 128',
  CODE_39: 'Code 39',
  CODE_93: 'Code 93',
  CODABAR: 'Codabar',
  ITF: 'ITF',
  RSS_14: 'RSS-14',
  RSS_EXPANDED: 'RSS Expanded'
}

/** Whether a scanned code is a 1D barcode (vs a QR-family 2D code). */
export function getScanCategory(formatName?: string): ScanCategory {
  if (formatName && BARCODE_FORMATS.has(formatName)) {
    return 'barcode'
  }
  return 'qr'
}

/** Whether the format is a retail product barcode worth offering a lookup for. */
export function isProductBarcode(formatName?: string): boolean {
  return !!formatName && PRODUCT_BARCODE_FORMATS.has(formatName)
}

/** Human-readable label for a symbology, e.g. `EAN_13` -> `EAN-13`. */
export function getFormatLabel(formatName?: string): string {
  if (!formatName) return ''
  if (FORMAT_LABELS[formatName]) return FORMAT_LABELS[formatName]
  return formatName
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/** Build a web-search URL to look up a scanned barcode value. */
export function getBarcodeSearchUrl(value: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(value)}`
}
