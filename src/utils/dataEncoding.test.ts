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
  generateEventData
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
