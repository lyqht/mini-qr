import { describe, it, expect } from 'vitest'
import {
  getScanCategory,
  isProductBarcode,
  getFormatLabel,
  getBarcodeSearchUrl
} from './scanFormats'

describe('getScanCategory', () => {
  it('classifies QR-family 2D formats as qr', () => {
    expect(getScanCategory('QR_CODE')).toBe('qr')
    expect(getScanCategory('AZTEC')).toBe('qr')
    expect(getScanCategory('DATA_MATRIX')).toBe('qr')
    expect(getScanCategory('PDF_417')).toBe('qr')
    expect(getScanCategory('MAXICODE')).toBe('qr')
  })

  it('classifies 1D barcode formats as barcode', () => {
    expect(getScanCategory('EAN_13')).toBe('barcode')
    expect(getScanCategory('EAN_8')).toBe('barcode')
    expect(getScanCategory('UPC_A')).toBe('barcode')
    expect(getScanCategory('UPC_E')).toBe('barcode')
    expect(getScanCategory('CODE_128')).toBe('barcode')
    expect(getScanCategory('CODE_39')).toBe('barcode')
    expect(getScanCategory('CODE_93')).toBe('barcode')
    expect(getScanCategory('ITF')).toBe('barcode')
    expect(getScanCategory('CODABAR')).toBe('barcode')
  })

  it('defaults to qr when format is missing or unknown', () => {
    expect(getScanCategory(undefined)).toBe('qr')
    expect(getScanCategory('')).toBe('qr')
    expect(getScanCategory('SOMETHING_NEW')).toBe('qr')
  })
})

describe('isProductBarcode', () => {
  it('is true for retail numeric symbologies', () => {
    expect(isProductBarcode('EAN_13')).toBe(true)
    expect(isProductBarcode('EAN_8')).toBe(true)
    expect(isProductBarcode('UPC_A')).toBe(true)
    expect(isProductBarcode('UPC_E')).toBe(true)
  })

  it('is false for non-retail barcodes and QR formats', () => {
    expect(isProductBarcode('CODE_128')).toBe(false)
    expect(isProductBarcode('CODE_39')).toBe(false)
    expect(isProductBarcode('QR_CODE')).toBe(false)
    expect(isProductBarcode(undefined)).toBe(false)
  })
})

describe('getFormatLabel', () => {
  it('returns friendly labels for known formats', () => {
    expect(getFormatLabel('EAN_13')).toBe('EAN-13')
    expect(getFormatLabel('UPC_A')).toBe('UPC-A')
    expect(getFormatLabel('CODE_128')).toBe('Code 128')
    expect(getFormatLabel('QR_CODE')).toBe('QR Code')
    expect(getFormatLabel('DATA_MATRIX')).toBe('Data Matrix')
  })

  it('falls back to a humanized form for unknown formats', () => {
    expect(getFormatLabel('SOME_NEW_CODE')).toBe('Some New Code')
    expect(getFormatLabel(undefined)).toBe('')
    expect(getFormatLabel('')).toBe('')
  })
})

describe('getBarcodeSearchUrl', () => {
  it('builds a web search url for the code value', () => {
    expect(getBarcodeSearchUrl('012345678905')).toBe('https://www.google.com/search?q=012345678905')
  })

  it('encodes values safely', () => {
    expect(getBarcodeSearchUrl('a b&c')).toBe('https://www.google.com/search?q=a%20b%26c')
  })
})
