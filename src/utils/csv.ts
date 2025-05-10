export interface SimpleCSVData {
  url: string
  frameText?: string
}

export interface VCardCSVData {
  firstName: string
  lastName: string
  org?: string
  position?: string
  phoneWork?: string
  phonePrivate?: string
  phoneMobile?: string
  email?: string
  website?: string
  street?: string
  zipcode?: string
  city?: string
  state?: string
  country?: string
  version?: string
  frameText?: string
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
 * Parses a CSV string into structured data
 * @param csvContent The CSV content as a string
 * @param ignoreHeader Whether to ignore the header row
 * @returns CSVParsingResult containing parsed data and validation status
 */
export const parseCSV = (csvContent: string, ignoreHeader: boolean = false): CSVParsingResult => {
  try {
    const lines = csvContent.split('\n').filter((line) => line.trim() !== '')
    if (lines.length === 0) {
      return { data: [], isValid: false, error: 'Empty CSV file' }
    }

    const processedLines = lines.map((line) => line.replace('\r', ''))
    const header = processedLines[0].toLowerCase()
    const isVCard = isVCardStructure(header)
    const startIndex = ignoreHeader ? 1 : 0
    const data: CSVData[] = []

    if (isVCard) {
      const headers = processedLines[0].split(',').map((h) => h.trim().toLowerCase())

      for (let i = startIndex; i < processedLines.length; i++) {
        // Split by comma but respect quoted values
        const values: string[] = []
        let currentValue = ''
        let insideQuotes = false

        for (let j = 0; j < processedLines[i].length; j++) {
          const char = processedLines[i][j]
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

        const vCardData: VCardCSVData = {
          firstName: values[headers.indexOf('firstname')] || '',
          lastName: values[headers.indexOf('lastname')] || ''
        }

        // Map optional fields if they exist in the header
        const optionalFields = [
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
          'frametext'
        ]

        optionalFields.forEach((field) => {
          const index = headers.indexOf(field)
          if (index !== -1 && values[index]) {
            // Special handling for frameText field
            if (field === 'frametext') {
              vCardData.frameText = values[index]
            } else {
              vCardData[field as keyof VCardCSVData] = values[index]
            }
          }
        })

        data.push(vCardData)
      }
    } else {
      // Handle simple URL/text structure
      for (let i = startIndex; i < processedLines.length; i++) {
        // Split by comma but respect quoted values
        const values: string[] = []
        let currentValue = ''
        let insideQuotes = false

        for (let j = 0; j < processedLines[i].length; j++) {
          const char = processedLines[i][j]
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

        const [url, frameText] = values
        data.push({ url, frameText })
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
