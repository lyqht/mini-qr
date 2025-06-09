/** Generic function to escape special characters in a string */
const escapeSpecialChars = (val: string, charsToEscape: string): string => {
  if (!val) return ''
  const regex = new RegExp(`([${charsToEscape.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}])`, 'g')
  return val.replace(regex, '\\$1')
}

/**
 * Escapes special characters for vCard format: \ , ;
 * Based on RFC 6350 (vCard 4.0) and RFC 2426 (vCard 3.0)
 * @see https://datatracker.ietf.org/doc/html/rfc6350
 * @see https://datatracker.ietf.org/doc/html/rfc2426
 */
export const escapeVCard = (val: string): string => escapeSpecialChars(val, '\\,;')

/**
 * Escapes special characters for WiFi format: \ ; , : " '
 * Based on WPA/WPA2 Enterprise Configuration Specification
 * @see https://github.com/zxing/zxing/wiki/Barcode-Contents#wi-fi-network-config-android-ios-11
 */
export const escapeWiFi = (val: string): string => escapeSpecialChars(val, '\\;,:"\'')

/**
 * Escapes special characters for iCalendar format: \ , ;
 * Based on RFC 5545 (iCalendar)
 * @see https://datatracker.ietf.org/doc/html/rfc5545
 */
export const escapeICal = (val: string): string => escapeSpecialChars(val, '\\,;')

/** Formats a Date object or date string into YYYYMMDDTHHMMSSZ format for iCalendar */
const formatICalDateTime = (dateTime: string | Date): string => {
  try {
    const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime
    if (isNaN(date.getTime())) return '' // Invalid date
    return (
      date.getUTCFullYear() +
      ('0' + (date.getUTCMonth() + 1)).slice(-2) +
      ('0' + date.getUTCDate()).slice(-2) +
      'T' +
      ('0' + date.getUTCHours()).slice(-2) +
      ('0' + date.getUTCMinutes()).slice(-2) +
      ('0' + date.getUTCSeconds()).slice(-2) +
      'Z'
    )
  } catch (e) {
    console.error('Error formatting iCal date:', e)
    return ''
  }
}

// --- Data Type Generators ---

/**
 * Generates plain text data for QR code
 * @param {object} data - Text data to encode
 * @param {string} data.text - The text content to encode
 * @returns {string} - Formatted text string
 */
export const generateTextData = (data: { text: string }): string => {
  return data.text || ''
}

/**
 * Generates a URL string for QR code, ensuring proper http/https prefix
 * @param {object} data - URL data to encode
 * @param {string} data.url - The URL to encode, with or without protocol
 * @returns {string} - Formatted URL string with protocol
 */
export const generateUrlData = (data: { url: string }): string => {
  if (!data.url) return ''
  return data.url.startsWith('http://') || data.url.startsWith('https://')
    ? data.url
    : `https://${data.url}`
}

/**
 * Generates a mailto URI string for email QR codes
 * @param {object} data - Email data to encode
 * @param {string} data.address - Email address of the recipient
 * @param {string} [data.subject] - Optional email subject
 * @param {string} [data.body] - Optional email body text
 * @param {string} [data.cc] - Optional CC recipients
 * @param {string} [data.bcc] - Optional BCC recipients
 * @returns {string} - Formatted mailto URI string
 */
export const generateEmailData = (data: {
  address: string
  subject?: string
  body?: string
  cc?: string
  bcc?: string
}): string => {
  if (!data.address) return ''
  const parts: string[] = []
  if (data.subject) parts.push(`subject=${encodeURIComponent(data.subject)}`)
  if (data.body) parts.push(`body=${encodeURIComponent(data.body)}`)
  if (data.cc) parts.push(`cc=${encodeURIComponent(data.cc)}`)
  if (data.bcc) parts.push(`bcc=${encodeURIComponent(data.bcc)}`)
  return `mailto:${data.address}${parts.length > 0 ? '?' + parts.join('&') : ''}`
}

/**
 * Generates a tel URI string for phone number QR codes
 * @param {object} data - Phone data to encode
 * @param {string} data.phone - Phone number to call
 * @returns {string} - Formatted tel URI string
 */
export const generatePhoneData = (data: { phone: string }): string => {
  return data.phone ? `tel:${data.phone}` : ''
}

/**
 * Generates an SMS string for SMS QR codes
 * @param {object} data - SMS data to encode
 * @param {string} data.phone - Phone number to text
 * @param {string} [data.message] - Optional message content
 * @returns {string} - Formatted SMS URI string
 */
export const generateSmsData = (data: { phone: string; message?: string }): string => {
  return data.phone ? `SMSTO:${data.phone}:${data.message || ''}` : ''
}

/**
 * Generates a WiFi network string for WiFi QR codes
 * @param {object} data - WiFi data to encode
 * @param {string} data.ssid - Network name (SSID)
 * @param {string} [data.password] - Network password
 * @param {'nopass' | 'WEP' | 'WPA'} data.encryption - Security type (nopass, WEP, or WPA/WPA2)
 * @param {boolean} [data.hidden] - Whether the network is hidden (not broadcasting SSID)
 * @returns {string} - Formatted WiFi string
 */
export const generateWifiData = (data: {
  ssid: string
  encryption: 'nopass' | 'WEP' | 'WPA'
  password?: string
  hidden?: boolean
}): string => {
  if (!data.ssid) return ''
  const ssid = escapeWiFi(data.ssid)
  const encryption = data.encryption
  const hidden = data.hidden ? 'H:true;' : ''

  if (encryption === 'nopass') {
    return `WIFI:T:nopass;S:${ssid};;${hidden};`
  } else {
    const password = escapeWiFi(data.password || '')
    return `WIFI:T:${encryption};S:${ssid};P:${password};${hidden};`
  }
}

/**
 * Generates a vCard format string from contact information
 * @param {object} data - Contact information to encode in vCard format
 * @param {string} [data.firstName] - First name of the contact
 * @param {string} [data.lastName] - Last name of the contact
 * @param {string} [data.org] - Organization name
 * @param {string} [data.position] - Job title or position
 * @param {string} [data.phoneWork] - Work phone number
 * @param {string} [data.phonePrivate] - Home/private phone number
 * @param {string} [data.phoneMobile] - Mobile phone number
 * @param {string} [data.email] - Email address
 * @param {string} [data.website] - Website URL
 * @param {string} [data.street] - Street address
 * @param {string} [data.zipcode] - Postal/ZIP code
 * @param {string} [data.city] - City
 * @param {string} [data.state] - State/province
 * @param {string} [data.country] - Country
 * @param {string} [data.version] - vCard version to generate:
 *   - '2': Generates vCard 2.1 format (older, simplest format)
 *   - '3': Generates vCard 3.0 format (default, widely compatible)
 *   - '4': Generates vCard 4.0 format (newest standard with additional features)
 * @returns {string} - Formatted vCard string
 */
export const generateVCardData = (data: {
  firstName?: string
  lastName?: string
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
}): string => {
  const lines: string[] = []
  lines.push('BEGIN:VCARD')

  const version = data.version || '3'
  lines.push(`VERSION:${version === '2' ? '2.1' : version === '4' ? '4.0' : '3.0'}`)

  const firstName = escapeVCard(data.firstName || '')
  const lastName = escapeVCard(data.lastName || '')
  if (firstName || lastName) {
    lines.push(`N:${lastName};${firstName};;;`)
    lines.push(`FN:${firstName} ${lastName}`.trim())
  }

  if (data.org) lines.push(`ORG:${escapeVCard(data.org)}`)
  if (data.position) lines.push(`TITLE:${escapeVCard(data.position)}`)

  // Format telephone entries based on vCard version
  if (data.phoneWork) {
    if (version === '2') {
      lines.push(`TEL;WORK;VOICE:${escapeVCard(data.phoneWork)}`)
    } else if (version === '4') {
      lines.push(`TEL;TYPE=work,voice;VALUE=uri:tel:${escapeVCard(data.phoneWork)}`)
    } else {
      lines.push(`TEL;TYPE=WORK,VOICE:${escapeVCard(data.phoneWork)}`)
    }
  }

  if (data.phonePrivate) {
    if (version === '2') {
      lines.push(`TEL;HOME;VOICE:${escapeVCard(data.phonePrivate)}`)
    } else if (version === '4') {
      lines.push(`TEL;TYPE=home,voice;VALUE=uri:tel:${escapeVCard(data.phonePrivate)}`)
    } else {
      lines.push(`TEL;TYPE=HOME,VOICE:${escapeVCard(data.phonePrivate)}`)
    }
  }

  if (data.phoneMobile) {
    if (version === '2') {
      lines.push(`TEL;CELL;VOICE:${escapeVCard(data.phoneMobile)}`)
    } else if (version === '4') {
      lines.push(`TEL;TYPE=cell,voice;VALUE=uri:tel:${escapeVCard(data.phoneMobile)}`)
    } else {
      lines.push(`TEL;TYPE=CELL,VOICE:${escapeVCard(data.phoneMobile)}`)
    }
  }

  // Email format differs by version
  if (data.email) {
    if (version === '2') {
      lines.push(`EMAIL;INTERNET:${escapeVCard(data.email)}`)
    } else if (version === '4') {
      lines.push(`EMAIL;TYPE=work:${escapeVCard(data.email)}`)
    } else {
      lines.push(`EMAIL:${escapeVCard(data.email)}`)
    }
  }

  // URL format
  if (data.website) {
    if (version === '4') {
      lines.push(`URL;TYPE=work:${escapeVCard(data.website)}`)
    } else {
      lines.push(`URL:${escapeVCard(data.website)}`)
    }
  }

  const street = escapeVCard(data.street || '')
  const city = escapeVCard(data.city || '')
  const state = escapeVCard(data.state || '')
  const zipcode = escapeVCard(data.zipcode || '')
  const country = escapeVCard(data.country || '')
  const addressComponents = [street, city, state, zipcode, country]

  // Only add ADR if at least one address component is present
  if (addressComponents.some((part) => part !== '')) {
    const adrString = `${street};${city};${state};${zipcode};${country}` // Construct the address parts string
    if (version === '2') {
      lines.push(`ADR;WORK:;;${adrString}`)
    } else if (version === '4') {
      lines.push(`ADR;TYPE=work:;;${adrString}`)
    } else {
      lines.push(`ADR;TYPE=WORK:;;${adrString}`)
    }
  }

  lines.push('END:VCARD')
  return lines.join('\n')
}

/**
 * Generates a geographic location URI string for location QR codes
 * @param {object} data - Location data to encode
 * @param {number|string} data.latitude - Latitude coordinate
 * @param {number|string} data.longitude - Longitude coordinate
 * @returns {string} - Formatted geo URI string
 */
export const generateLocationData = (data: {
  latitude: number | string
  longitude: number | string
}): string => {
  // Convert to string to preserve formatting, then validate if needed
  const latStr = String(data.latitude)
  const lonStr = String(data.longitude)

  // Basic validation (optional, could be more robust)
  if (isNaN(parseFloat(latStr)) || isNaN(parseFloat(lonStr))) {
    return ''
  }
  return `geo:${latStr},${lonStr}`
}

/**
 * Generates a calendar event string in iCalendar format for event QR codes
 * @param {object} data - Calendar event data to encode
 * @param {string} [data.title] - Event title/summary
 * @param {string} [data.location] - Event location
 * @param {string|Date} [data.startTime] - Event start time
 * @param {string|Date} [data.endTime] - Event end time
 * @returns {string} - Formatted iCalendar string
 */
export const generateEventData = (data: {
  title?: string
  location?: string
  startTime?: string | Date
  endTime?: string | Date
}): string => {
  const lines: string[] = []
  lines.push('BEGIN:VEVENT')

  if (data.title) lines.push(`SUMMARY:${escapeICal(data.title)}`)
  if (data.location) lines.push(`LOCATION:${escapeICal(data.location)}`)

  const dtStart = data.startTime ? formatICalDateTime(data.startTime) : ''
  const dtEnd = data.endTime ? formatICalDateTime(data.endTime) : ''

  if (dtStart) lines.push(`DTSTART:${dtStart}`)
  if (dtEnd) lines.push(`DTEND:${dtEnd}`)
  // Optionally add DTSTAMP (creation timestamp)
  lines.push(`DTSTAMP:${formatICalDateTime(new Date())}`)

  lines.push('END:VEVENT')

  // Wrap in VCALENDAR
  return `BEGIN:VCALENDAR\nVERSION:2.0\n${lines.join('\n')}\nEND:VCALENDAR`
}

// --- Data Detection ---

/**
 * Detect data type from a string and parse it into structured data
 * @param {string} data - The input string to detect and parse
 * @returns {object} Object containing detected type and parsed data fields
 *   with the following properties:
 *   - type: One of 'text', 'url', 'email', 'phone', 'sms', 'wifi', 'vcard', 'location', 'event'
 *   - parsedData: An object with fields appropriate for the detected type
 *
 * For vCard detection, the function detects the vCard version (2.1, 3.0, or 4.0)
 * and extracts personal information fields into parsedData, including:
 *   - firstName, lastName: Name components
 *   - org: Organization name
 *   - position: Job title or position
 *   - phoneWork, phonePrivate, phoneMobile: Contact numbers
 *   - email: Email address
 *   - website: URL
 *   - street, city, state, zipcode, country: Address components
 *   - version: Detected vCard version mapped to '2', '3', or '4'
 */
export const detectDataType = (
  data: string
): {
  type: 'text' | 'url' | 'email' | 'phone' | 'sms' | 'wifi' | 'vcard' | 'location' | 'event'
  parsedData: Record<string, string | boolean>
} => {
  // Default result
  const result: {
    type: 'text' | 'url' | 'email' | 'phone' | 'sms' | 'wifi' | 'vcard' | 'location' | 'event'
    parsedData: Record<string, string | boolean>
  } = {
    type: 'text',
    parsedData: { text: data }
  }

  if (!data) return result

  // vCard detection
  if (data.match(/^BEGIN:VCARD/i)) {
    result.type = 'vcard'
    result.parsedData = {}

    // Extract name with a more precise pattern
    const fullContent = data.replace(/\r/g, '').split('\n')

    // Detect vCard version
    const versionLine = fullContent.find((line) => line.match(/^VERSION:/i))
    if (versionLine) {
      const versionValue = versionLine.substring(8).trim()

      // Map version string to our selection values
      if (versionValue === '2.1') {
        result.parsedData.version = '2'
      } else if (versionValue === '3.0') {
        result.parsedData.version = '3'
      } else if (versionValue === '4.0') {
        result.parsedData.version = '4'
      }
    } else {
      // If no version found, default to v3
      result.parsedData.version = '3'
    }

    // Find the N: field
    const nField = fullContent.find((line) => line.match(/^N:/i))
    if (nField) {
      const nameParts = nField.substring(2).split(';')
      if (nameParts.length >= 2) {
        result.parsedData.lastName = nameParts[0].trim()
        result.parsedData.firstName = nameParts[1].trim()
      }
    }

    // Extract formatted name (if no name found)
    if (!result.parsedData.firstName && !result.parsedData.lastName) {
      const fnField = fullContent.find((line) => line.match(/^FN:/i))
      if (fnField) {
        const fnValue = fnField.substring(3).trim()
        const parts = fnValue.split(' ')
        if (parts.length > 1) {
          result.parsedData.firstName = parts[0]
          result.parsedData.lastName = parts.slice(1).join(' ')
        } else {
          result.parsedData.firstName = fnValue
        }
      }
    }

    // Extract organization
    const orgField = fullContent.find((line) => line.match(/^ORG:/i))
    if (orgField) {
      result.parsedData.org = orgField.substring(4).trim()
    }

    // Extract position/title
    const titleField = fullContent.find((line) => line.match(/^TITLE:/i))
    if (titleField) {
      result.parsedData.position = titleField.substring(6).trim()
    }

    // Extract phone numbers
    for (const line of fullContent) {
      if (line.match(/^TEL[^:]*(?:TYPE=WORK|WORK)[^:]*:/i)) {
        let phoneValue = line.substring(line.indexOf(':') + 1).trim()
        // For vCard 4.0, remove the "tel:" prefix
        if (phoneValue.startsWith('tel:')) {
          phoneValue = phoneValue.substring(4)
        }
        result.parsedData.phoneWork = phoneValue
      } else if (line.match(/^TEL[^:]*(?:TYPE=HOME|HOME)[^:]*:/i)) {
        let phoneValue = line.substring(line.indexOf(':') + 1).trim()
        // For vCard 4.0, remove the "tel:" prefix
        if (phoneValue.startsWith('tel:')) {
          phoneValue = phoneValue.substring(4)
        }
        result.parsedData.phonePrivate = phoneValue
      } else if (line.match(/^TEL[^:]*(?:TYPE=CELL|CELL|TYPE=MOBILE|MOBILE)[^:]*:/i)) {
        let phoneValue = line.substring(line.indexOf(':') + 1).trim()
        // For vCard 4.0, remove the "tel:" prefix
        if (phoneValue.startsWith('tel:')) {
          phoneValue = phoneValue.substring(4)
        }
        result.parsedData.phoneMobile = phoneValue
      } else if (
        line.match(/^TEL[^:]*/i) &&
        !result.parsedData.phoneWork &&
        !result.parsedData.phonePrivate &&
        !result.parsedData.phoneMobile
      ) {
        let phoneValue = line.substring(line.indexOf(':') + 1).trim()
        // For vCard 4.0, remove the "tel:" prefix
        if (phoneValue.startsWith('tel:')) {
          phoneValue = phoneValue.substring(4)
        }
        result.parsedData.phoneMobile = phoneValue
      }
    }

    // Extract email
    const emailField = fullContent.find((line) => line.match(/^EMAIL[^:]*:/i))
    if (emailField) {
      result.parsedData.email = emailField.substring(emailField.indexOf(':') + 1).trim()
    }

    // Extract website
    const urlField = fullContent.find((line) => line.match(/^URL[^:]*:/i))
    if (urlField) {
      result.parsedData.website = urlField.substring(urlField.indexOf(':') + 1).trim()
    }

    // Extract address
    const addrField = fullContent.find((line) => line.match(/^ADR[^:]*:/i))
    if (addrField) {
      const addressParts = addrField.substring(addrField.indexOf(':') + 1).split(';')
      if (addressParts.length >= 7) {
        result.parsedData.street = addressParts[2].trim()
        result.parsedData.city = addressParts[3].trim()
        result.parsedData.state = addressParts[4].trim()
        result.parsedData.zipcode = addressParts[5].trim()
        result.parsedData.country = addressParts[6].trim()
      }
    }

    return result
  }

  // URL detection
  if (data.match(/^https?:\/\//i)) {
    result.type = 'url'
    result.parsedData = { url: data }
    return result
  }

  // Email detection
  if (data.match(/^mailto:/i)) {
    result.type = 'email'
    result.parsedData = {}

    const emailParts = data.replace(/^mailto:/i, '').split('?')
    result.parsedData.address = emailParts[0] || ''

    if (emailParts[1]) {
      const params = new URLSearchParams(emailParts[1])
      result.parsedData.subject = params.get('subject') || ''
      result.parsedData.body = params.get('body') || ''
      result.parsedData.cc = params.get('cc') || ''
      result.parsedData.bcc = params.get('bcc') || ''
    }

    return result
  }

  // Phone detection
  if (data.match(/^tel:/i)) {
    result.type = 'phone'
    result.parsedData = { phone: data.replace(/^tel:/i, '') }
    return result
  }

  // SMS detection
  if (data.match(/^SMSTO:/i) || data.match(/^sms:/i)) {
    result.type = 'sms'
    result.parsedData = {}

    // Handle both SMSTO: and sms: formats
    if (data.startsWith('SMSTO:')) {
      const smsParts = data.replace(/^SMSTO:/i, '').split(':')

      if (smsParts.length >= 1) {
        result.parsedData.phone = smsParts[0].trim() || ''
      }

      if (smsParts.length >= 2) {
        result.parsedData.message = smsParts[1].trim() || ''
      }
    } else if (data.startsWith('sms:')) {
      // Handle sms:phone?body=message format
      const phone = data.replace(/^sms:/i, '')

      if (phone.includes('?')) {
        const queryIndex = phone.indexOf('?')
        const phoneNumber = phone.substring(0, queryIndex)
        const queryString = phone.substring(queryIndex + 1)

        result.parsedData.phone = phoneNumber.trim()

        const params = new URLSearchParams(queryString)
        result.parsedData.message = params.get('body') || ''
      } else {
        result.parsedData.phone = phone.trim()
      }
    }

    return result
  }

  // WiFi detection
  if (data.match(/^WIFI:/i)) {
    result.type = 'wifi'
    result.parsedData = {}

    // Extract SSID
    const ssidMatch = data.match(/S:([^;]*);/i)
    if (ssidMatch) {
      result.parsedData.ssid = ssidMatch[1] || ''
    }

    // Extract encryption type
    const encMatch = data.match(/T:([^;]*);/i)
    if (encMatch) {
      const encType = encMatch[1].toUpperCase()
      result.parsedData.encryption =
        encType === 'NOPASS' || encType === 'WEP' || encType === 'WPA'
          ? encType.toLowerCase()
          : 'nopass'
    } else {
      result.parsedData.encryption = 'nopass'
    }

    // Extract password
    const passMatch = data.match(/P:([^;]*);/i)
    if (passMatch) {
      result.parsedData.password = passMatch[1] || ''
    }

    // Extract hidden flag
    const hiddenMatch = data.match(/H:(true|false);/i)
    if (hiddenMatch) {
      result.parsedData.hidden = hiddenMatch[1].toLowerCase() === 'true'
    } else {
      result.parsedData.hidden = false
    }

    return result
  }

  // Location detection
  if (data.match(/^geo:/i)) {
    result.type = 'location'
    result.parsedData = {}

    const coords = data.replace(/^geo:/i, '').split(',')
    if (coords.length >= 2) {
      result.parsedData.latitude = coords[0] || ''
      result.parsedData.longitude = coords[1] || ''
    }

    return result
  }

  // Calendar/Event detection (simplified)
  if (data.match(/BEGIN:VCALENDAR/i) || data.match(/BEGIN:VEVENT/i)) {
    result.type = 'event'
    result.parsedData = {}

    const summaryMatch = data.match(/SUMMARY:([^\n\r]*)/i)
    if (summaryMatch) {
      result.parsedData.title = summaryMatch[1] || ''
    }

    const locationMatch = data.match(/LOCATION:([^\n\r]*)/i)
    if (locationMatch) {
      result.parsedData.location = locationMatch[1] || ''
    }

    const startMatch = data.match(/DTSTART(?:[^:]*):([^\n\r]*)/i)
    if (startMatch && startMatch[1]) {
      result.parsedData.startTime = formatDateFromICal(startMatch[1])
    }

    const endMatch = data.match(/DTEND(?:[^:]*):([^\n\r]*)/i)
    if (endMatch && endMatch[1]) {
      result.parsedData.endTime = formatDateFromICal(endMatch[1])
    }

    return result
  }

  // Default to text
  return result
}

/**
 * Converts an iCalendar format date to an ISO string
 * @param {string} iCalDate - Date in iCalendar format (e.g., "20230101T120000Z")
 * @returns {string} ISO date string, or empty string if invalid
 */
function formatDateFromICal(iCalDate: string): string {
  // Handle basic format: YYYYMMDDTHHMMSSZ
  const datePattern = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/
  const match = iCalDate.match(datePattern)

  if (match) {
    try {
      const [, year, month, day, hour, minute, second] = match
      return `${year}-${month}-${day}T${hour}:${minute}:${second}${iCalDate.endsWith('Z') ? 'Z' : ''}`
    } catch (e) {
      console.error('Error parsing iCal date:', e)
    }
  }

  return iCalDate // Return as is if not parseable
}
