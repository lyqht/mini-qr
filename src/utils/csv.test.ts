import { describe, it, expect } from 'vitest'
import { isVCardStructure, parseCSV, validateCSVData, type CSVData } from './csv'

describe('CSV Utility Functions', () => {
  describe('isVCardStructure', () => {
    it('identifies vCard structure correctly', () => {
      expect(isVCardStructure('firstname,lastname,email')).toBe(true)
      expect(isVCardStructure('Firstname,LastName,Org')).toBe(true)
      expect(isVCardStructure('url,frameText')).toBe(false)
      expect(isVCardStructure('')).toBe(false)
    })
  })

  describe('parseCSV', () => {
    it('parses vCard CSV structure correctly', () => {
      const csvContent = `firstname,lastname,email,phonework,frameText
John,Doe,john@example.com,+1234567890,John's QR
Jane,Smith,jane@example.com,+0987654321,Jane's QR`

      const result = parseCSV(csvContent)
      expect(result.isValid).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data[0]).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phonework: '+1234567890',
        frameText: "John's QR"
      })
    })

    it('parses vCard CSV with fileName correctly', () => {
      const csvContent = `firstname,lastname,email,fileName
John,Doe,john@example.com,john_doe_card
Jane,Smith,jane@example.com,jane_smith_card`

      const result = parseCSV(csvContent)
      expect(result.isValid).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data[0]).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        fileName: 'john_doe_card'
      })
      expect(result.data[1]).toEqual({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        fileName: 'jane_smith_card'
      })
    })

    it('parses simple URL/text CSV structure correctly', () => {
      const csvContent = `url,frameText
https://example.com,Example QR
https://test.com,Test QR`

      const result = parseCSV(csvContent)
      expect(result.isValid).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data[0]).toEqual({
        url: 'https://example.com',
        frameText: 'Example QR',
        fileName: undefined
      })
    })

    it('parses CSV with fileName column correctly', () => {
      const csvContent = `url,frameText,fileName
https://example.com,Example QR,example_site
https://test.com,Test QR,test_site
https://docs.com,,documentation`

      const result = parseCSV(csvContent)
      expect(result.isValid).toBe(true)
      expect(result.data).toHaveLength(3)
      expect(result.data[0]).toEqual({
        url: 'https://example.com',
        frameText: 'Example QR',
        fileName: 'example_site'
      })
      expect(result.data[2]).toEqual({
        url: 'https://docs.com',
        frameText: '',
        fileName: 'documentation'
      })
    })

    it('parses CSV with empty fileName correctly', () => {
      const csvContent = `url,frameText,fileName
https://mini-qr.com/,MiniQR Home,
https://docs.example.com/,,documentation`

      const result = parseCSV(csvContent)
      expect(result.isValid).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data[0]).toEqual({
        url: 'https://mini-qr.com/',
        frameText: 'MiniQR Home',
        fileName: ''
      })
      expect(result.data[1]).toEqual({
        url: 'https://docs.example.com/',
        frameText: '',
        fileName: 'documentation'
      })
    })

    it('handles empty CSV content', () => {
      const result = parseCSV('')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Empty CSV file')
    })

    it('handles malformed CSV content', () => {
      // TODO: add functionality for this malformed csv content handling
      // const csvContent = `invalid,csv,content\nwith,newline`
      // const result = parseCSV(csvContent)
      // expect(result.isValid).toBe(false)
    })

    it('handles quoted values correctly', () => {
      const csvContent = `firstname,lastname,email
"John, Jr.",Doe,"john@example.com"
Jane,"Smith, PhD","jane@example.com"`

      const result = parseCSV(csvContent)
      expect(result.isValid).toBe(true)
      expect(result.data[0]).toEqual({
        firstName: 'John, Jr.',
        lastName: 'Doe',
        email: 'john@example.com'
      })
    })
  })

  describe('validateCSVData', () => {
    it('validates vCard data correctly', () => {
      const validVCardData: CSVData[] = [
        { firstName: 'John', lastName: 'Doe' },
        { firstName: 'Jane', lastName: 'Smith' }
      ]
      expect(validateCSVData(validVCardData)).toBe(true)

      const invalidVCardData: CSVData[] = [
        { firstName: 'John', lastName: '' },
        { firstName: '', lastName: 'Smith' }
      ]
      expect(validateCSVData(invalidVCardData)).toBe(false)
    })

    it('validates simple URL/text data correctly', () => {
      const validUrlData: CSVData[] = [{ url: 'https://example.com' }, { url: 'https://test.com' }]
      expect(validateCSVData(validUrlData)).toBe(true)

      const invalidUrlData: CSVData[] = [{ url: 'https://example.com' }, { url: '' }]
      expect(validateCSVData(invalidUrlData)).toBe(false)
    })

    it('handles empty data array', () => {
      expect(validateCSVData([])).toBe(false)
    })

    it('handles mixed data types', () => {
      const mixedData: CSVData[] = [
        { firstName: 'John', lastName: 'Doe' },
        { url: 'https://example.com' }
      ]
      expect(validateCSVData(mixedData)).toBe(true)
    })
  })
})
