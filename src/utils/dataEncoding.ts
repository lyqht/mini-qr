/** Escapes special characters for vCard format: \ , ; */
const escapeVCard = (val: string): string => (val ? val.replace(/([\\,;])/g, '\\$1') : '')

/** Escapes special characters for WiFi format: \ ; , : " */
const escapeWiFi = (val: string): string => (val ? val.replace(/([\\;,:"'])/g, '\\$1') : '')

/** Escapes special characters for iCalendar format: \ , ; */
const escapeICal = (val: string): string => (val ? val.replace(/([\\,;])/g, '\\$1') : '')

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

export const generateTextData = (data: { text: string }): string => {
  return data.text || ''
}

export const generateUrlData = (data: { url: string }): string => {
  if (!data.url) return ''
  return data.url.startsWith('http://') || data.url.startsWith('https://')
    ? data.url
    : `https://${data.url}`
}

export const generateEmailData = (data: {
  address: string
  subject?: string
  body?: string
}): string => {
  if (!data.address) return ''
  const parts: string[] = []
  if (data.subject) parts.push(`subject=${encodeURIComponent(data.subject)}`)
  if (data.body) parts.push(`body=${encodeURIComponent(data.body)}`)
  return `mailto:${data.address}${parts.length > 0 ? '?' + parts.join('&') : ''}`
}

export const generatePhoneData = (data: { phone: string }): string => {
  return data.phone ? `tel:${data.phone}` : ''
}

export const generateSmsData = (data: { phone: string; message?: string }): string => {
  return data.phone ? `SMSTO:${data.phone}:${data.message || ''}` : ''
}

export const generateWifiData = (data: {
  ssid: string
  password?: string
  encryption: 'nopass' | 'WEP' | 'WPA'
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
}): string => {
  const lines: string[] = []
  lines.push('BEGIN:VCARD')
  lines.push('VERSION:3.0')

  const firstName = escapeVCard(data.firstName || '')
  const lastName = escapeVCard(data.lastName || '')
  if (firstName || lastName) {
    lines.push(`N:${lastName};${firstName};;;`)
    lines.push(`FN:${firstName} ${lastName}`.trim())
  }

  if (data.org) lines.push(`ORG:${escapeVCard(data.org)}`)
  if (data.position) lines.push(`TITLE:${escapeVCard(data.position)}`)
  if (data.phoneWork) lines.push(`TEL;TYPE=WORK,VOICE:${escapeVCard(data.phoneWork)}`)
  if (data.phonePrivate) lines.push(`TEL;TYPE=HOME,VOICE:${escapeVCard(data.phonePrivate)}`)
  if (data.phoneMobile) lines.push(`TEL;TYPE=CELL,VOICE:${escapeVCard(data.phoneMobile)}`)
  if (data.email) lines.push(`EMAIL:${escapeVCard(data.email)}`)
  if (data.website) lines.push(`URL:${escapeVCard(data.website)}`)

  const adrParts = [
    '',
    '', // PO Box, Extended Addr
    escapeVCard(data.street || ''),
    escapeVCard(data.city || ''),
    escapeVCard(data.state || ''),
    escapeVCard(data.zipcode || ''),
    escapeVCard(data.country || '')
  ]
  if (adrParts.some((part) => part !== '')) {
    lines.push(`ADR;TYPE=WORK:;;${adrParts.join(';')}`)
  }

  lines.push('END:VCARD')
  return lines.join('\n')
}

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
        result.parsedData.phoneWork = line.substring(line.indexOf(':') + 1).trim()
      } else if (line.match(/^TEL[^:]*(?:TYPE=HOME|HOME)[^:]*:/i)) {
        result.parsedData.phonePrivate = line.substring(line.indexOf(':') + 1).trim()
      } else if (line.match(/^TEL[^:]*(?:TYPE=CELL|CELL|TYPE=MOBILE|MOBILE)[^:]*:/i)) {
        result.parsedData.phoneMobile = line.substring(line.indexOf(':') + 1).trim()
      } else if (
        line.match(/^TEL[^:]*/i) &&
        !result.parsedData.phoneWork &&
        !result.parsedData.phonePrivate &&
        !result.parsedData.phoneMobile
      ) {
        result.parsedData.phoneMobile = line.substring(line.indexOf(':') + 1).trim()
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
