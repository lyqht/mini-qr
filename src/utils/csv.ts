export interface SimpleCSVData {
  url: string
  frameText?: string
  fileName?: string
}

export type VCardOptionalFields =
  | 'org'
  | 'position'
  | 'phonework'
  | 'phoneprivate'
  | 'phonemobile'
  | 'email'
  | 'website'
  | 'street'
  | 'zipcode'
  | 'city'
  | 'state'
  | 'country'
  | 'version'
  | 'frameText'

export interface VCardCSVData extends Partial<Record<VCardOptionalFields, string>> {
  firstName: string
  lastName: string
  fileName?: string
}

export type CSVData = SimpleCSVData | VCardCSVData

export interface CSVParsingResult {
  data: CSVData[]
  isValid: boolean
  error?: string
}

/**
 * Validates if the CSV header indicates a vCard structure
 * @param header The CSV header row
 * @returns boolean indicating if the CSV is a vCard structure
 */
export const isVCardStructure = (header: string): boolean => {
  const headers = header
    .toLowerCase()
    .split(',')
    .map((h) => h.trim())
  return headers.includes('firstname') && headers.includes('lastname')
}

/**
 * Splits CSV content into rows while respecting quoted fields with newlines
 * @param csvContent The CSV content as a string
 * @returns Array of row strings
 */
const splitCSVRows = (csvContent: string): string[] => {
  const rows: string[] = []
  let currentRow = ''
  let insideQuotes = false

  for (let i = 0; i < csvContent.length; i++) {
    const char = csvContent[i]

    if (char === '"') {
      insideQuotes = !insideQuotes
      currentRow += char
    } else if (char === '\n' && !insideQuotes) {
      // Only treat newline as row separator if not inside quotes
      if (currentRow.trim() !== '') {
        rows.push(currentRow.replace('\r', ''))
      }
      currentRow = ''
    } else if (char === '\r' && csvContent[i + 1] === '\n' && !insideQuotes) {
      // Handle CRLF line endings
      if (currentRow.trim() !== '') {
        rows.push(currentRow)
      }
      currentRow = ''
      i++ // Skip the \n
    } else {
      currentRow += char
    }
  }

  // Add the last row if it's not empty
  if (currentRow.trim() !== '') {
    rows.push(currentRow.replace('\r', ''))
  }

  return rows
}

/**
 * Parses a CSV string into structured data
 * @param csvContent The CSV content as a string
 * @returns CSVParsingResult containing parsed data and validation status
 */
export const parseCSV = (csvContent: string): CSVParsingResult => {
  try {
    const lines = splitCSVRows(csvContent)
    if (lines.length === 0) {
      return { data: [], isValid: false, error: 'Empty CSV file' }
    }

    const header = lines[0].toLowerCase()
    const headers = header.split(',').map((h) => h.trim().toLowerCase())
    const isVCard = isVCardStructure(header)
    const startIndex = 1
    const data: CSVData[] = []

    if (isVCard) {
      for (let i = startIndex; i < lines.length; i++) {
        // Split by comma but respect quoted values
        const values: string[] = []
        let currentValue = ''
        let insideQuotes = false

        for (let j = 0; j < lines[i].length; j++) {
          const char = lines[i][j]
          if (char === '"') {
            insideQuotes = !insideQuotes
          } else if (char === ',' && !insideQuotes) {
            values.push(currentValue.trim().replace(/^["']|["']$/g, ''))
            currentValue = ''
          } else {
            currentValue += char
          }
        }
        values.push(currentValue.trim().replace(/^["']|["']$/g, ''))

        const vCardData: Partial<VCardCSVData> = {
          firstName: values[headers.indexOf('firstname')] || '',
          lastName: values[headers.indexOf('lastname')] || ''
        }

        // Map optional fields if they exist in the header
        const optionalFields: VCardOptionalFields[] = [
          'org',
          'position',
          'phonework',
          'phoneprivate',
          'phonemobile',
          'email',
          'website',
          'street',
          'zipcode',
          'city',
          'state',
          'country',
          'version',
          'frameText'
        ]

        optionalFields.forEach((field) => {
          const index = headers.indexOf(field.toLowerCase())
          if (index !== -1 && values[index]) {
            vCardData[field as keyof VCardCSVData] = values[index]
          }
        })

        // Handle fileName separately since it's not in VCardOptionalFields
        const fileNameIndex = headers.indexOf('filename')
        if (fileNameIndex !== -1) {
          vCardData.fileName = values[fileNameIndex] || ''
        }

        data.push(vCardData as VCardCSVData)
      }
    } else {
      // Handle simple URL/text structure
      for (let i = startIndex; i < lines.length; i++) {
        // Split by comma but respect quoted values
        const values: string[] = []
        let currentValue = ''
        let insideQuotes = false

        for (let j = 0; j < lines[i].length; j++) {
          const char = lines[i][j]
          if (char === '"') {
            insideQuotes = !insideQuotes
          } else if (char === ',' && !insideQuotes) {
            values.push(currentValue.trim().replace(/^["']|["']$/g, ''))
            currentValue = ''
          } else {
            currentValue += char
          }
        }
        values.push(currentValue.trim().replace(/^["']|["']$/g, ''))

        const [url, frameText, fileName] = values
        data.push({ url, frameText, fileName })
      }
    }

    return { data, isValid: true }
  } catch (error) {
    return {
      data: [],
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error parsing CSV'
    }
  }
}

/**
 * Validates if the CSV data is properly formatted
 * @param data The parsed CSV data
 * @returns boolean indicating if the data is valid
 */
export const validateCSVData = (data: CSVData[]): boolean => {
  if (data.length === 0) return false

  return data.every((row) => {
    const isVCardStructure = 'firstName' in row
    if (isVCardStructure) {
      return row.firstName && row.lastName
    } else {
      return row.url && row.url.trim() !== ''
    }
  })
}
