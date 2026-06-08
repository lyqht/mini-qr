/**
 * Registry of individually selectable QR-code configuration fields used by
 * Simple Mode. The data input is intentionally NOT part of this registry — it
 * is always visible. Everything here is hidden in Simple Mode until the user
 * pins it via the "Customize fields" panel.
 */

export type QRViewMode = 'simple' | 'full'

export interface SimpleFieldGroup {
  /** Group heading translation key. */
  labelKey: string
  fields: { key: string; labelKey: string }[]
}

/**
 * Grouped registry driving the "Customize fields" checklist. Group order and
 * field order here is the order shown in the panel.
 */
export const SIMPLE_MODE_FIELD_GROUPS: SimpleFieldGroup[] = [
  {
    labelKey: 'Preset & style',
    fields: [{ key: 'preset', labelKey: 'Preset' }]
  },
  {
    labelKey: 'Logo',
    fields: [
      { key: 'logoImage', labelKey: 'Logo image URL' },
      { key: 'logoBackground', labelKey: 'With background' }
    ]
  },
  {
    labelKey: 'Colors',
    fields: [
      { key: 'backgroundColor', labelKey: 'Background color' },
      { key: 'dotsColor', labelKey: 'Dots color' },
      { key: 'cornersSquareColor', labelKey: 'Corners Square color' },
      { key: 'cornersDotColor', labelKey: 'Corners Dot color' }
    ]
  },
  {
    labelKey: 'Dimensions',
    fields: [
      { key: 'width', labelKey: 'Width (px)' },
      { key: 'height', labelKey: 'Height (px)' },
      { key: 'borderRadius', labelKey: 'Border radius (px)' },
      { key: 'margin', labelKey: 'Margin (px)' },
      { key: 'imageMargin', labelKey: 'Image margin (px)' },
      { key: 'imageSize', labelKey: 'Image size (ratio)' }
    ]
  },
  {
    labelKey: 'Shapes',
    fields: [
      { key: 'dotsType', labelKey: 'Dots type' },
      { key: 'cornersSquareType', labelKey: 'Corners Square type' },
      { key: 'cornersDotType', labelKey: 'Corners Dot type' }
    ]
  },
  {
    labelKey: 'Error correction level',
    fields: [{ key: 'errorCorrectionLevel', labelKey: 'Error correction level' }]
  },
  {
    labelKey: 'Frame settings',
    fields: [{ key: 'frame', labelKey: 'Frame settings' }]
  }
]

/** Flat list of every valid field key. */
export const SIMPLE_MODE_FIELD_KEYS = SIMPLE_MODE_FIELD_GROUPS.flatMap((g) =>
  g.fields.map((f) => f.key)
)

export type SimpleFieldKey = (typeof SIMPLE_MODE_FIELD_KEYS)[number]

const FIELD_KEY_SET = new Set<string>(SIMPLE_MODE_FIELD_KEYS)

export function isValidSimpleFieldKey(key: string): key is SimpleFieldKey {
  return FIELD_KEY_SET.has(key)
}

/**
 * Normalizes a stored/untrusted list of field keys: drops unknown keys and
 * duplicates, returns [] for anything that is not an array. Order is preserved.
 */
export function sanitizeSimpleFields(keys: unknown): SimpleFieldKey[] {
  if (!Array.isArray(keys)) return []
  const seen = new Set<string>()
  const result: SimpleFieldKey[] = []
  for (const key of keys) {
    if (typeof key === 'string' && isValidSimpleFieldKey(key) && !seen.has(key)) {
      seen.add(key)
      result.push(key)
    }
  }
  return result
}

/**
 * A field is visible in full mode always; in simple mode only when the user
 * has pinned it.
 */
export function isFieldVisibleInMode(
  mode: QRViewMode,
  pinnedFields: readonly string[],
  key: string
): boolean {
  return mode === 'full' || pinnedFields.includes(key)
}
