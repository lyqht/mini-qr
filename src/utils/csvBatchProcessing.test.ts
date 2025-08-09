import { describe, it, expect } from 'vitest'
import { processCsvDataForBatch, generateBatchExportFilename } from './csvBatchProcessing'
import type { CSVData } from './csv'

describe('CSV Batch Processing', () => {
  describe('processCsvDataForBatch', () => {
    it('processes simple URL data correctly', () => {
      const csvData: CSVData[] = [
        { url: 'https://example.com', frameText: 'Example', fileName: 'example_site' },
        { url: 'https://google.com', frameText: 'Google', fileName: '' },
        { url: 'https://github.com', frameText: '', fileName: 'github_main' }
      ]

      const result = processCsvDataForBatch(csvData)

      expect(result.urls).toEqual([
        'https://example.com',
        'https://google.com',
        'https://github.com'
      ])
      expect(result.frameTexts).toEqual(['Example', 'Google', ''])
      expect(result.fileNames).toEqual(['example_site', '', 'github_main'])
      expect(result.hasCustomFrameText).toBe(true)
    })

    it('processes vCard data correctly', () => {
      const csvData: CSVData[] = [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          frameText: 'Contact John',
          fileName: 'john_doe'
        },
        {
          firstName: 'Jane',
          lastName: 'Smith',
          org: 'Tech Corp',
          position: 'CEO',
          frameText: '',
          fileName: ''
        }
      ]

      const result = processCsvDataForBatch(csvData)

      expect(result.urls).toHaveLength(2)
      expect(result.urls[0]).toContain('BEGIN:VCARD')
      expect(result.urls[0]).toContain('FN:John Doe')
      expect(result.frameTexts).toEqual(['Contact John', ''])
      expect(result.fileNames).toEqual(['john_doe', ''])
      expect(result.hasCustomFrameText).toBe(true)
    })

    it('maintains array alignment with empty values', () => {
      const csvData: CSVData[] = [
        { url: 'https://site1.com', frameText: 'Site 1', fileName: '' },
        { url: 'https://site2.com', frameText: '', fileName: 'site2_file' },
        { url: 'https://site3.com', frameText: '', fileName: '' }
      ]

      const result = processCsvDataForBatch(csvData)

      expect(result.urls).toHaveLength(3)
      expect(result.frameTexts).toHaveLength(3)
      expect(result.fileNames).toHaveLength(3)
      expect(result.frameTexts).toEqual(['Site 1', '', ''])
      expect(result.fileNames).toEqual(['', 'site2_file', ''])
    })

    it('correctly identifies when no custom frame text exists', () => {
      const csvData: CSVData[] = [
        { url: 'https://site1.com', frameText: '', fileName: 'file1' },
        { url: 'https://site2.com', frameText: '', fileName: 'file2' }
      ]

      const result = processCsvDataForBatch(csvData)

      expect(result.hasCustomFrameText).toBe(false)
    })

    it('handles mixed vCard and URL data', () => {
      const csvData: CSVData[] = [
        { url: 'https://example.com', frameText: 'Example' },
        { firstName: 'Bob', lastName: 'Johnson', email: 'bob@test.com' }
      ]

      const result = processCsvDataForBatch(csvData)

      expect(result.urls).toHaveLength(2)
      expect(result.urls[0]).toBe('https://example.com')
      expect(result.urls[1]).toContain('BEGIN:VCARD')
    })
  })

  describe('generateBatchExportFilename', () => {
    it('prioritizes custom fileName over frameText', () => {
      const usedFilenames = new Set<string>()
      const filename = generateBatchExportFilename(
        'https://example.com',
        'Example Frame',
        'custom_name',
        0,
        usedFilenames
      )

      expect(filename).toBe('custom_name')
    })

    it('uses frameText when fileName is empty', () => {
      const usedFilenames = new Set<string>()
      const filename = generateBatchExportFilename(
        'https://example.com',
        'Frame Text',
        '',
        0,
        usedFilenames
      )

      expect(filename).toBe('Frame Text')
    })

    it('generates filename from URL when both fileName and frameText are empty', () => {
      const usedFilenames = new Set<string>()
      const filename = generateBatchExportFilename(
        'https://example.com/about',
        '',
        '',
        0,
        usedFilenames
      )

      expect(filename).toBe('about')
    })

    it('extracts name from vCard FN field', () => {
      const usedFilenames = new Set<string>()
      const vCardData = `BEGIN:VCARD
VERSION:4.0
FN:John Doe
END:VCARD`

      const filename = generateBatchExportFilename(vCardData, '', '', 0, usedFilenames)

      expect(filename).toBe('John_Doe')
    })

    it('handles duplicate filenames by appending index', () => {
      const usedFilenames = new Set<string>(['example'])
      const filename = generateBatchExportFilename(
        'https://example.com',
        'example',
        '',
        5,
        usedFilenames
      )

      expect(filename).toBe('example-5')
    })

    it('generates fallback filename for invalid URL segments', () => {
      const usedFilenames = new Set<string>()
      const filename = generateBatchExportFilename(
        'https://example.com/###/',
        '',
        '',
        3,
        usedFilenames
      )

      expect(filename).toBe('example_com')
    })

    it('uses index-based fallback for simple strings', () => {
      const usedFilenames = new Set<string>()
      const filename = generateBatchExportFilename('simple-text', '', '', 7, usedFilenames)

      expect(filename).toBe('simple-text')
    })

    it('tracks used filenames across multiple calls', () => {
      const usedFilenames = new Set<string>()

      const filename1 = generateBatchExportFilename(
        'https://example.com',
        'test',
        '',
        0,
        usedFilenames
      )

      const filename2 = generateBatchExportFilename(
        'https://different.com',
        'test',
        '',
        1,
        usedFilenames
      )

      expect(filename1).toBe('test')
      expect(filename2).toBe('test-1')
      expect(usedFilenames.size).toBe(2)
    })
  })
})
