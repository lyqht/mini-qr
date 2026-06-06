import { describe, expect, it } from 'vitest'
import {
  findGapKeys,
  placeholdersPreserved,
  LOCALE_TO_DEEPL,
  ENGLISH_VARIANTS
} from '../../scripts/translate-deepl.mjs'

describe('findGapKeys', () => {
  const en = { Save: 'Save', Cancel: 'Cancel', ar: 'Arabic' }

  it('flags absent keys', () => {
    expect(findGapKeys(en, { Save: 'Speichern' })).toEqual(['Cancel', 'ar'])
  })

  it('flags empty-string values', () => {
    expect(findGapKeys(en, { Save: '', Cancel: 'Abbrechen', ar: 'Arabisch' })).toEqual(['Save'])
  })

  it('flags untranslated copies (value identical to English source)', () => {
    expect(findGapKeys(en, { Save: 'Save', Cancel: 'Abbrechen', ar: 'Arabisch' })).toEqual(['Save'])
  })

  it('never flags a real translation that differs from English', () => {
    const full = { Save: 'Speichern', Cancel: 'Abbrechen', ar: 'Arabisch' }
    expect(findGapKeys(en, full)).toEqual([])
  })
})

describe('placeholdersPreserved', () => {
  it('passes when all tokens survive', () => {
    expect(placeholdersPreserved('{count} items', '{count} Elemente')).toBe(true)
  })

  it('fails when a token is dropped or mangled', () => {
    expect(placeholdersPreserved('{count} items', 'Elemente')).toBe(false)
    expect(placeholdersPreserved('{index} / {count}', '{index} von {anzahl}')).toBe(false)
  })

  it('passes for strings with no placeholders', () => {
    expect(placeholdersPreserved('Save', 'Speichern')).toBe(true)
  })

  it('returns false when translated is missing', () => {
    expect(placeholdersPreserved('{count} items', undefined as unknown as string)).toBe(false)
  })
})

describe('locale map', () => {
  it('maps norwegian variants to NB and excludes english family', () => {
    expect(LOCALE_TO_DEEPL.no).toBe('NB')
    expect(LOCALE_TO_DEEPL.nb).toBe('NB')
    expect(ENGLISH_VARIANTS.has('en-GB')).toBe(true)
    expect('en' in LOCALE_TO_DEEPL).toBe(false)
  })

  it('does not include unsupported languages like Thai or Hindi', () => {
    expect('th' in LOCALE_TO_DEEPL).toBe(false)
    expect('hi' in LOCALE_TO_DEEPL).toBe(false)
  })
})
