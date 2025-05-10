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

      const result = parseCSV(csvContent, true)
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

    it('parses simple URL/text CSV structure correctly', () => {
      const csvContent = `https://example.com,Example QR
https://test.com,Test QR`

      const result = parseCSV(csvContent)
      expect(result.isValid).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data[0]).toEqual({
        url: 'https://example.com',
        frameText: 'Example QR'
      })
    })

    it('handles empty CSV content', () => {
      const result = parseCSV('')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Empty CSV file')
    })

    it('handles malformed CSV content', () => {
      const result = parseCSV('invalid,csv,content\nwith,newline')
      expect(result.isValid).toBe(true) // Still valid as it can parse the content
      expect(result.data).toHaveLength(2)
    })

    it('respects ignoreHeader option', () => {
      const csvContent = `firstname,lastname,email
John,Doe,john@example.com
Jane,Smith,jane@example.com`

      const resultWithHeader = parseCSV(csvContent, false)
      expect(resultWithHeader.data).toHaveLength(3) // Includes header as data

      const resultWithoutHeader = parseCSV(csvContent, true)
      expect(resultWithoutHeader.data).toHaveLength(2) // Excludes header
    })

    it('handles quoted values correctly', () => {
      const csvContent = `firstname,lastname,email
"John, Jr.",Doe,"john@example.com"
Jane,"Smith, PhD","jane@example.com"`

      const result = parseCSV(csvContent, true)
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
