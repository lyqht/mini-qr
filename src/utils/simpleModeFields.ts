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
  /**
   * When set, the group is gated behind an enable toggle (the frame's
   * "Add frame"). Its field checkboxes only appear in the customize panel once
   * the toggle is on, mirroring the real frame settings UI.
   */
  enableToggleLabelKey?: string
  fields: { key: string; labelKey: string }[]
}

/**
 * Grouped registry driving the "Customize fields" checklist. The two groups
 * mirror the two configuration accordion sections — "QR code settings" and
 * "Frame settings" — so the panel matches the layout users already know.
 * Group order and field order here is the order shown in the panel.
 */
export const SIMPLE_MODE_FIELD_GROUPS: SimpleFieldGroup[] = [
  {
    labelKey: 'QR code settings',
    fields: [
      { key: 'preset', labelKey: 'Preset' },
      { key: 'logoImage', labelKey: 'Logo image URL' },
      { key: 'logoBackground', labelKey: 'With background' },
      { key: 'backgroundColor', labelKey: 'Background color' },
      { key: 'dotsColor', labelKey: 'Dots color' },
      { key: 'cornersSquareColor', labelKey: 'Corners Square color' },
      { key: 'cornersDotColor', labelKey: 'Corners Dot color' },
      { key: 'width', labelKey: 'Width (px)' },
      { key: 'height', labelKey: 'Height (px)' },
      { key: 'borderRadius', labelKey: 'Border radius (px)' },
      { key: 'margin', labelKey: 'Margin (px)' },
      { key: 'imageMargin', labelKey: 'Image margin (px)' },
      { key: 'imageSize', labelKey: 'Image size (ratio)' },
      { key: 'dotsType', labelKey: 'Dots type' },
      { key: 'cornersSquareType', labelKey: 'Corners Square type' },
      { key: 'cornersDotType', labelKey: 'Corners Dot type' },
      { key: 'errorCorrectionLevel', labelKey: 'Error correction level' }
    ]
  },
  {
    labelKey: 'Frame settings',
    enableToggleLabelKey: 'Add frame',
    fields: [
      { key: 'framePreset', labelKey: 'Frame preset' },
      { key: 'frameText', labelKey: 'Caption' },
      { key: 'framePosition', labelKey: 'Position' },
      { key: 'frameWidth', labelKey: 'Frame width' },
      { key: 'frameTextColor', labelKey: 'Text color' },
      { key: 'frameBackground', labelKey: 'Background' },
      { key: 'frameBorderColor', labelKey: 'Border color' },
      { key: 'frameBorderWidth', labelKey: 'Border width' },
      { key: 'frameBorderRadius', labelKey: 'Border radius' },
      { key: 'framePadding', labelKey: 'Padding' },
      { key: 'frameFontFamily', labelKey: 'Font family' }
    ]
  }
]

/** Field keys belonging to the frame settings group. */
export const FRAME_FIELD_KEYS = [
  'framePreset',
  'frameText',
  'framePosition',
  'frameWidth',
  'frameTextColor',
  'frameBackground',
  'frameBorderColor',
  'frameBorderWidth',
  'frameBorderRadius',
  'framePadding',
  'frameFontFamily'
] as const

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

/**
 * Parse a `VITE_FIELDS_VISIBLE` env string (comma/whitespace separated field
 * keys) into a validated, de-duplicated list of known field keys.
 */
export function parseVisibleFields(raw: string | undefined | null): SimpleFieldKey[] {
  if (!raw) return []
  return sanitizeSimpleFields(
    raw
      .split(/[\s,]+/)
      .map((part) => part.trim())
      .filter(Boolean)
  )
}

/** Whether any of the given keys belongs to the frame settings group. */
export function hasFrameField(keys: readonly string[]): boolean {
  return keys.some((key) => (FRAME_FIELD_KEYS as readonly string[]).includes(key))
}
