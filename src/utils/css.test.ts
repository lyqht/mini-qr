import { describe, it, expect } from 'vitest'
import { isValidCSSColor, isValidCSSLength } from './css'

describe('isValidCSSColor', () => {
  it('accepts hex colors', () => {
    expect(isValidCSSColor('#000')).toBe(true)
    expect(isValidCSSColor('#000000')).toBe(true)
    expect(isValidCSSColor('#00000080')).toBe(true)
  })

  it('accepts rgb/rgba colors', () => {
    expect(isValidCSSColor('rgb(0, 0, 0)')).toBe(true)
    expect(isValidCSSColor('rgba(0, 0, 0, 0.5)')).toBe(true)
  })

  it('accepts hsl/hsla colors', () => {
    expect(isValidCSSColor('hsl(0, 100%, 50%)')).toBe(true)
    expect(isValidCSSColor('hsla(0, 100%, 50%, 0.5)')).toBe(true)
  })

  it('accepts named colors and transparent', () => {
    expect(isValidCSSColor('red')).toBe(true)
    expect(isValidCSSColor('transparent')).toBe(true)
  })

  it('rejects invalid color values', () => {
    expect(isValidCSSColor('')).toBe(false)
    expect(isValidCSSColor('#gg0000')).toBe(false)
    expect(isValidCSSColor('16px')).toBe(false)
  })
})

describe('isValidCSSLength', () => {
  it('accepts 0 without a unit', () => {
    expect(isValidCSSLength('0')).toBe(true)
  })

  it('accepts common length units', () => {
    for (const unit of ['px', 'em', 'rem', '%', 'vw', 'vh', 'pt', 'cm', 'mm']) {
      expect(isValidCSSLength(`8${unit}`)).toBe(true)
    }
  })

  it('accepts decimal values', () => {
    expect(isValidCSSLength('1.5rem')).toBe(true)
  })

  it('rejects bare numbers and invalid strings', () => {
    expect(isValidCSSLength('16')).toBe(false)
    expect(isValidCSSLength('')).toBe(false)
    expect(isValidCSSLength('#000')).toBe(false)
  })
})
