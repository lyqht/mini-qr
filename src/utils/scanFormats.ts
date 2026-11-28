export type ScanCategory = 'qr' | 'barcode'

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

const PRODUCT_BARCODE_FORMATS = new Set(['EAN_13', 'EAN_8', 'UPC_A', 'UPC_E'])

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

export function getScanCategory(formatName?: string): ScanCategory {
  if (formatName && BARCODE_FORMATS.has(formatName)) {
    return 'barcode'
  }
  return 'qr'
}

export function isProductBarcode(formatName?: string): boolean {
  return !!formatName && PRODUCT_BARCODE_FORMATS.has(formatName)
}

export function getFormatLabel(formatName?: string): string {
  if (!formatName) return ''
  if (FORMAT_LABELS[formatName]) return FORMAT_LABELS[formatName]
  return formatName
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function getBarcodeSearchUrl(value: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(value)}`
}
