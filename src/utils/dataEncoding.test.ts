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
  detectDataType
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
      generateEmailData({
        address: 'test@example.com',
        subject: 'Hi & Bye',
        body: 'Line 1\nLine 2'
      })
    ).toBe('mailto:test@example.com?subject=Hi%20%26%20Bye&body=Line%201%0ALine%202')
    expect(generateEmailData({ address: '' })).toBe('')
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
    const result = detectDataType('mailto:test@example.com?subject=Hello&body=Hi%20there')
    expect(result.type).toBe('email')
    expect(result.parsedData.address).toBe('test@example.com')
    expect(result.parsedData.subject).toBe('Hello')
    expect(result.parsedData.body).toBe('Hi there')
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
