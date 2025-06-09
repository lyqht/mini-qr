import { describe, it, expect } from 'vitest'
import {
  generateTextData,
  generateUrlData,
  generateEmailData,
  generatePhoneData,
  generateSmsData,
  generateWifiData,
  generateVCardData,
  generateLocationData,
  generateEventData,
  detectDataType,
  escapeVCard,
  escapeWiFi,
  escapeICal
} from './dataEncoding'

describe('Data Encoding Functions', () => {
  it('generateTextData returns correct string', () => {
    expect(generateTextData({ text: 'Hello World' })).toBe('Hello World')
    expect(generateTextData({ text: '' })).toBe('')
  })

  it('generateUrlData formats URL correctly', () => {
    expect(generateUrlData({ url: 'example.com' })).toBe('https://example.com')
    expect(generateUrlData({ url: 'http://example.com' })).toBe('http://example.com')
    expect(generateUrlData({ url: 'https://example.com' })).toBe('https://example.com')
    expect(generateUrlData({ url: '' })).toBe('')
  })

  it('generateEmailData formats mailto string correctly', () => {
    expect(generateEmailData({ address: 'test@example.com' })).toBe('mailto:test@example.com')
    expect(generateEmailData({ address: 'test@example.com', subject: 'Hi' })).toBe(
      'mailto:test@example.com?subject=Hi'
    )
    expect(generateEmailData({ address: 'test@example.com', body: 'Hello there' })).toBe(
      'mailto:test@example.com?body=Hello%20there'
    )
    expect(
      generateEmailData({ address: 'test@example.com', cc: 'a@test.com', bcc: 'b@test.com' })
    ).toBe('mailto:test@example.com?cc=a%40test.com&bcc=b%40test.com')
    expect(
      generateEmailData({
        address: 'test@example.com',
        subject: 'Hi & Bye',
        body: 'Line 1\nLine 2'
      })
    ).toBe('mailto:test@example.com?subject=Hi%20%26%20Bye&body=Line%201%0ALine%202')
    expect(
      generateEmailData({ address: 'test@example.com', subject: 'Hello', cc: 'a@test.com' })
    ).toBe('mailto:test@example.com?subject=Hello&cc=a%40test.com')
    expect(generateEmailData({ address: '' })).toBe('')
  })

  it('generateEmailData handles multiple emails in CC/BCC correctly', () => {
    expect(
      generateEmailData({
        address: 'test@example.com',
        cc: 'cc1@test.com,cc2@test.com',
        bcc: 'bcc1@test.com,bcc2@test.com'
      })
    ).toBe(
      'mailto:test@example.com?cc=cc1%40test.com%2Ccc2%40test.com&bcc=bcc1%40test.com%2Cbcc2%40test.com'
    )
  })

  it('generatePhoneData formats tel string correctly', () => {
    expect(generatePhoneData({ phone: '+123456789' })).toBe('tel:+123456789')
    expect(generatePhoneData({ phone: '' })).toBe('')
  })

  it('generateSmsData formats SMSTO string correctly', () => {
    expect(generateSmsData({ phone: '+12345' })).toBe('SMSTO:+12345:')
    expect(generateSmsData({ phone: '+12345', message: 'Hello' })).toBe('SMSTO:+12345:Hello')
    expect(generateSmsData({ phone: '' })).toBe('')
  })

  it('generateWifiData formats WIFI string correctly', () => {
    expect(generateWifiData({ ssid: 'MyNet', encryption: 'WPA', password: 'pass123' })).toBe(
      'WIFI:T:WPA;S:MyNet;P:pass123;;'
    )
    expect(generateWifiData({ ssid: 'MyNet', encryption: 'WPA', password: 'pass;123"' })).toBe(
      'WIFI:T:WPA;S:MyNet;P:pass\\;123\\";;'
    ) // Escaping
    expect(generateWifiData({ ssid: 'MyNet', encryption: 'nopass' })).toBe(
      'WIFI:T:nopass;S:MyNet;;;'
    )
    expect(
      generateWifiData({ ssid: 'HiddenNet', encryption: 'WPA', password: 'abc', hidden: true })
    ).toBe('WIFI:T:WPA;S:HiddenNet;P:abc;H:true;;')
    expect(generateWifiData({ ssid: '', encryption: 'WPA' })).toBe('')
  })

  it('generateVCardData formats vCard string correctly', () => {
    expect(generateVCardData({ firstName: 'John', lastName: 'Doe' })).toBe(
      'BEGIN:VCARD\nVERSION:3.0\nN:Doe;John;;;\nFN:John Doe\nEND:VCARD'
    )
    expect(generateVCardData({ email: 'j.doe@example.com' })).toBe(
      'BEGIN:VCARD\nVERSION:3.0\nEMAIL:j.doe@example.com\nEND:VCARD'
    )

    // Test vCard 2.1 format
    expect(
      generateVCardData({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phoneWork: '+1234567890',
        version: '2'
      })
    ).toBe(
      'BEGIN:VCARD\nVERSION:2.1\nN:Doe;John;;;\nFN:John Doe\nTEL;WORK;VOICE:+1234567890\nEMAIL;INTERNET:john.doe@example.com\nEND:VCARD'
    )

    // Test vCard 3.0 format
    expect(
      generateVCardData({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phoneWork: '+1234567890',
        version: '3'
      })
    ).toBe(
      'BEGIN:VCARD\nVERSION:3.0\nN:Doe;John;;;\nFN:John Doe\nTEL;TYPE=WORK,VOICE:+1234567890\nEMAIL:john.doe@example.com\nEND:VCARD'
    )

    // Test vCard 4.0 format
    expect(
      generateVCardData({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phoneWork: '+1234567890',
        version: '4'
      })
    ).toBe(
      'BEGIN:VCARD\nVERSION:4.0\nN:Doe;John;;;\nFN:John Doe\nTEL;TYPE=work,voice;VALUE=uri:tel:+1234567890\nEMAIL;TYPE=work:john.doe@example.com\nEND:VCARD'
    )
  })

  it('generateLocationData formats geo string correctly', () => {
    expect(generateLocationData({ latitude: 40.7128, longitude: -74.006 })).toBe(
      'geo:40.7128,-74.006'
    )
    expect(generateLocationData({ latitude: '40.7128', longitude: '-74.0060' })).toBe(
      'geo:40.7128,-74.0060'
    )
    expect(generateLocationData({ latitude: 'invalid', longitude: -74 })).toBe('')
  })

  it('generateEventData formats VCALENDAR string correctly', () => {
    const startTime = new Date(Date.UTC(2025, 0, 15, 10, 0, 0)) // Jan 15, 2025 10:00:00 UTC
    const endTime = new Date(Date.UTC(2025, 0, 15, 11, 0, 0)) // Jan 15, 2025 11:00:00 UTC
    const expectedStart = '20250115T100000Z'
    const expectedEnd = '20250115T110000Z'

    const result = generateEventData({ title: 'Meeting', startTime, endTime })
    expect(result).toContain('BEGIN:VCALENDAR')
    expect(result).toContain('VERSION:2.0')
    expect(result).toContain('BEGIN:VEVENT')
    expect(result).toContain('SUMMARY:Meeting')
    expect(result).toContain(`DTSTART:${expectedStart}`)
    expect(result).toContain(`DTEND:${expectedEnd}`)
    expect(result).toContain('DTSTAMP:') // Check if timestamp exists
    expect(result).toContain('END:VEVENT')
    expect(result).toContain('END:VCALENDAR')

    const resultStringDates = generateEventData({
      title: 'Party',
      startTime: '2024-12-25T18:00:00Z',
      endTime: '2024-12-25T22:00:00Z'
    })
    expect(resultStringDates).toContain('SUMMARY:Party')
    expect(resultStringDates).toContain('DTSTART:20241225T180000Z')
    expect(resultStringDates).toContain('DTEND:20241225T220000Z')
    expect(generateEventData({})).toContain('BEGIN:VCALENDAR')
  })

  it('generateVCardData formats full address correctly for vCard 3.0', () => {
    const data = {
      firstName: 'Jane',
      lastName: 'Smith',
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipcode: '90210',
      country: 'USA'
    }
    const expectedVCard = `BEGIN:VCARD
VERSION:3.0
N:Smith;Jane;;;
FN:Jane Smith
ADR;TYPE=WORK:;;123 Main St;Anytown;CA;90210;USA
END:VCARD`
    expect(generateVCardData(data)).toBe(expectedVCard)
  })

  it('generateVCardData formats partial address correctly for vCard 2.1', () => {
    const data = {
      firstName: 'Jane',
      lastName: 'Smith',
      city: 'Othertown',
      country: 'Canada',
      version: '2'
    }
    const expectedVCard = `BEGIN:VCARD
VERSION:2.1
N:Smith;Jane;;;
FN:Jane Smith
ADR;WORK:;;;Othertown;;;Canada
END:VCARD`
    expect(generateVCardData(data)).toBe(expectedVCard)
  })

  it('generateVCardData formats address correctly for vCard 4.0', () => {
    const data = {
      firstName: 'Jane',
      lastName: 'Smith',
      street: '456 Side St',
      city: 'Metropolis',
      zipcode: '12345',
      version: '4'
    }
    const expectedVCard = `BEGIN:VCARD
VERSION:4.0
N:Smith;Jane;;;
FN:Jane Smith
ADR;TYPE=work:;;456 Side St;Metropolis;;12345;
END:VCARD`
    expect(generateVCardData(data)).toBe(expectedVCard)
  })

  it('generateVCardData omits ADR field when no address parts are provided', () => {
    const data = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@test.com'
      // No address fields
    }
    const expectedVCard = `BEGIN:VCARD
VERSION:3.0
N:Smith;Jane;;;
FN:Jane Smith
EMAIL:jane@test.com
END:VCARD`
    expect(generateVCardData(data)).toBe(expectedVCard)
  })
})

describe('Data Type Detection Functions', () => {
  it('detectDataType identifies plain text', () => {
    const result = detectDataType('Hello World')
    expect(result.type).toBe('text')
    expect(result.parsedData.text).toBe('Hello World')
  })

  it('detectDataType identifies URLs', () => {
    const result = detectDataType('https://example.com')
    expect(result.type).toBe('url')
    expect(result.parsedData.url).toBe('https://example.com')
  })

  it('detectDataType identifies email links', () => {
    const result = detectDataType(
      'mailto:test@example.com?subject=Hello&body=Hi%20there&cc=cc@test.com&bcc=b@test.com'
    )
    expect(result.type).toBe('email')
    expect(result.parsedData.address).toBe('test@example.com')
    expect(result.parsedData.subject).toBe('Hello')
    expect(result.parsedData.body).toBe('Hi there')
    expect(result.parsedData.cc).toBe('cc@test.com')
    expect(result.parsedData.bcc).toBe('b@test.com')
  })

  it('detectDataType identifies email links with multiple CC/BCC addresses', () => {
    const result = detectDataType(
      'mailto:test@example.com?subject=Hello&body=Hi%20there&cc=cc1@test.com,cc2@test.com&bcc=bcc1@test.com,bcc2@test.com'
    )
    expect(result.type).toBe('email')
    expect(result.parsedData.address).toBe('test@example.com')
    expect(result.parsedData.subject).toBe('Hello')
    expect(result.parsedData.body).toBe('Hi there')
    expect(result.parsedData.cc).toBe('cc1@test.com,cc2@test.com')
    expect(result.parsedData.bcc).toBe('bcc1@test.com,bcc2@test.com')
  })

  it('detectDataType identifies phone numbers', () => {
    const result = detectDataType('tel:+123456789')
    expect(result.type).toBe('phone')
    expect(result.parsedData.phone).toBe('+123456789')
  })

  it('detectDataType identifies SMS messages', () => {
    const result1 = detectDataType('SMSTO:+12345:Hello there')
    expect(result1.type).toBe('sms')
    expect(result1.parsedData.phone).toBe('+12345')
    expect(result1.parsedData.message).toBe('Hello there')

    const result2 = detectDataType('sms:+12345?body=Hello%20there')
    expect(result2.type).toBe('sms')
    expect(result2.parsedData.phone).toBe('+12345')
    expect(result2.parsedData.message).toBe('Hello there')
  })

  it('detectDataType identifies WiFi credentials', () => {
    const result = detectDataType('WIFI:T:WPA;S:MyNetwork;P:password123;H:true;;')
    expect(result.type).toBe('wifi')
    expect(result.parsedData.ssid).toBe('MyNetwork')
    expect(result.parsedData.encryption).toBe('wpa')
    expect(result.parsedData.password).toBe('password123')
    expect(result.parsedData.hidden).toBe(true)
  })

  it('detectDataType identifies vCard data', () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
N:Doe;John;Q.,Public
FN:John Doe
TEL;TYPE=WORK,VOICE:(111) 555-1212
TEL;TYPE=HOME,VOICE:(404) 555-1212
TEL;TYPE=CELL,VOICE:(404) 555-1213
EMAIL:johndoe@example.com
URL:https://www.example.com
ADR;TYPE=HOME:;;42 Plantation St.;Baytown;LA;30314;USA
END:VCARD`

    const result = detectDataType(vcard)
    expect(result.type).toBe('vcard')
    expect(result.parsedData.firstName).toBe('John')
    expect(result.parsedData.lastName).toBe('Doe')
    expect(result.parsedData.phoneWork).toBe('(111) 555-1212')
    expect(result.parsedData.phonePrivate).toBe('(404) 555-1212')
    expect(result.parsedData.phoneMobile).toBe('(404) 555-1213')
    expect(result.parsedData.email).toBe('johndoe@example.com')
    expect(result.parsedData.website).toBe('https://www.example.com')
    expect(result.parsedData.street).toBe('42 Plantation St.')
    expect(result.parsedData.city).toBe('Baytown')
    expect(result.parsedData.state).toBe('LA')
    expect(result.parsedData.zipcode).toBe('30314')
    expect(result.parsedData.country).toBe('USA')
    expect(result.parsedData.version).toBe('3')

    // Test vCard 2.1 detection
    const vcard21 = `BEGIN:VCARD
VERSION:2.1
N:Doe;John;;;
FN:John Doe
TEL;WORK;VOICE:+1234567890
EMAIL;INTERNET:john.doe@example.com
END:VCARD`

    const result21 = detectDataType(vcard21)
    expect(result21.type).toBe('vcard')
    expect(result21.parsedData.firstName).toBe('John')
    expect(result21.parsedData.lastName).toBe('Doe')
    expect(result21.parsedData.phoneWork).toBe('+1234567890')
    expect(result21.parsedData.email).toBe('john.doe@example.com')
    expect(result21.parsedData.version).toBe('2')

    // Test vCard 4.0 detection
    const vcard40 = `BEGIN:VCARD
VERSION:4.0
N:Doe;John;;;
FN:John Doe
TEL;TYPE=work,voice;VALUE=uri:tel:+1234567890
EMAIL;TYPE=work:john.doe@example.com
END:VCARD`

    const result40 = detectDataType(vcard40)
    expect(result40.type).toBe('vcard')
    expect(result40.parsedData.firstName).toBe('John')
    expect(result40.parsedData.lastName).toBe('Doe')
    expect(result40.parsedData.phoneWork).toBe('+1234567890')
    expect(result40.parsedData.email).toBe('john.doe@example.com')
    expect(result40.parsedData.version).toBe('4')
  })

  it('detectDataType identifies geo location data', () => {
    const result = detectDataType('geo:40.7128,-74.0060')
    expect(result.type).toBe('location')
    expect(result.parsedData.latitude).toBe('40.7128')
    expect(result.parsedData.longitude).toBe('-74.0060')
  })

  it('detectDataType identifies calendar events', () => {
    const event = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:Team Meeting
LOCATION:Conference Room A
DTSTART:20240115T100000Z
DTEND:20240115T110000Z
END:VEVENT
END:VCALENDAR`

    const result = detectDataType(event)
    expect(result.type).toBe('event')
    expect(result.parsedData.title).toBe('Team Meeting')
    expect(result.parsedData.location).toBe('Conference Room A')
    expect(result.parsedData.startTime).toContain('2024-01-15T10:00:00')
    expect(result.parsedData.endTime).toContain('2024-01-15T11:00:00')
  })
})

describe('Escape Functions', () => {
  describe('escapeVCard', () => {
    it('escapes special characters for vCard format', () => {
      expect(escapeVCard('Hello, World')).toBe('Hello\\, World')
      expect(escapeVCard('Name;Surname')).toBe('Name\\;Surname')
      expect(escapeVCard('Back\\slash')).toBe('Back\\\\slash')
      expect(escapeVCard('')).toBe('')
    })

    it('handles multiple special characters', () => {
      expect(escapeVCard('Test,;\\')).toBe('Test\\,\\;\\\\')
    })

    it('preserves non-special characters', () => {
      expect(escapeVCard('Hello World')).toBe('Hello World')
      expect(escapeVCard('12345')).toBe('12345')
      expect(escapeVCard('test@example.com')).toBe('test@example.com')
    })
  })

  describe('escapeWiFi', () => {
    it('escapes special characters for WiFi format', () => {
      expect(escapeWiFi('Network;Name')).toBe('Network\\;Name')
      expect(escapeWiFi('Password:123')).toBe('Password\\:123')
      expect(escapeWiFi('Test,Comma')).toBe('Test\\,Comma')
      expect(escapeWiFi('"Quoted"')).toBe('\\"Quoted\\"')
      expect(escapeWiFi("Single'Quote")).toBe("Single\\'Quote")
      expect(escapeWiFi('Back\\slash')).toBe('Back\\\\slash')
      expect(escapeWiFi('')).toBe('')
    })

    it('handles multiple special characters', () => {
      expect(escapeWiFi('Test;,:"\'\\')).toBe('Test\\;\\,\\:\\"\\\'\\\\')
    })

    it('preserves non-special characters', () => {
      expect(escapeWiFi('MyNetwork')).toBe('MyNetwork')
      expect(escapeWiFi('12345')).toBe('12345')
      expect(escapeWiFi('test@example.com')).toBe('test@example.com')
    })
  })

  describe('escapeICal', () => {
    it('escapes special characters for iCalendar format', () => {
      expect(escapeICal('Event,Name')).toBe('Event\\,Name')
      expect(escapeICal('Location;Room')).toBe('Location\\;Room')
      expect(escapeICal('Back\\slash')).toBe('Back\\\\slash')
      expect(escapeICal('')).toBe('')
    })

    it('handles multiple special characters', () => {
      expect(escapeICal('Test,;\\')).toBe('Test\\,\\;\\\\')
    })

    it('preserves non-special characters', () => {
      expect(escapeICal('Meeting')).toBe('Meeting')
      expect(escapeICal('12345')).toBe('12345')
      expect(escapeICal('test@example.com')).toBe('test@example.com')
    })
  })
})
