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
