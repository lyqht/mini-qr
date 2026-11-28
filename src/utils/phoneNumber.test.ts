import { describe, expect, it } from 'vitest'
import { isPhoneNumber } from './phoneNumber'

describe('isPhoneNumber', () => {
  it.each(['tel:91234567', '+6591234567', '+65 9123 4567', '(555) 123-4567', '555-123-4567'])(
    'treats %s as a phone number',
    (value) => {
      expect(isPhoneNumber(value)).toBe(true)
    }
  )

  it.each(['5901234123457', '036000291452', '12345', '2026', '2026.11.28', '+12', 'MINI-QR-1234'])(
    'treats %s as text',
    (value) => {
      expect(isPhoneNumber(value)).toBe(false)
    }
  )
})
