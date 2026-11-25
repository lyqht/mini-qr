import type { Options as StyledQRCodeProps } from '@/lib/qr-code'
import type { FrameStyle } from './framePresets'
import { isValidQRCodeConfig } from './qrCodePresets'
import { sanitizeSimpleFields, type QRViewMode, type SimpleFieldKey } from './simpleModeFields'

export interface QRCodeFrameConfig {
  text: string
  position: 'top' | 'bottom' | 'left' | 'right'
  style: FrameStyle
  /** Side captions only: caption column width in px (default 200). */
  captionWidth?: number
}

export interface QRCodeConfig {
  props: StyledQRCodeProps & { name?: string }
  style: {
    borderRadius: string
    background?: string
  }
  frame?: QRCodeFrameConfig | null
}

export const QR_CODE_STORAGE_KEY = 'qrCodeConfig'
export const LAST_LOADED_LOCALLY_PRESET_KEY = 'Last saved locally'
export const LOADED_FROM_FILE_PRESET_KEY = 'Loaded from file'
export const CUSTOM_LOADED_PRESET_KEYS = [
  LAST_LOADED_LOCALLY_PRESET_KEY,
  LOADED_FROM_FILE_PRESET_KEY
] as const

export function isLocalStorageEnabled(): boolean {
  return import.meta.env?.VITE_DISABLE_LOCAL_STORAGE !== 'true'
}

export function hasStoredQRConfig(): boolean {
  return localStorage.getItem(QR_CODE_STORAGE_KEY) !== null
}

export function serializeQRConfig(
  props: StyledQRCodeProps & { name?: string },
  style: { borderRadius: string; background?: string },
  frame: QRCodeFrameConfig | null
): QRCodeConfig {
  return { props, style, frame }
}

export function saveQRConfig(config: QRCodeConfig): void {
  localStorage.setItem(QR_CODE_STORAGE_KEY, JSON.stringify(config))
}

export function loadQRConfig(): QRCodeConfig | null {
  const stored = localStorage.getItem(QR_CODE_STORAGE_KEY)
  if (!stored) return null
  try {
    const parsed: unknown = JSON.parse(stored)
    if (!isValidQRCodeConfig(parsed)) return null
    return parsed
  } catch {
    return null
  }
}

// --- Simple Mode view preferences -----------------------------------------
// Persisted separately from the QR config so toggling the view never mutates
// the stored design. Both reads tolerate missing/corrupt values by returning a
// safe default, mirroring loadQRConfig.

export const QR_VIEW_MODE_STORAGE_KEY = 'qrViewMode'
export const QR_SIMPLE_FIELDS_STORAGE_KEY = 'qrSimpleFields'

export function saveViewMode(mode: QRViewMode): void {
  localStorage.setItem(QR_VIEW_MODE_STORAGE_KEY, mode)
}

export function loadViewMode(): QRViewMode | null {
  const stored = localStorage.getItem(QR_VIEW_MODE_STORAGE_KEY)
  return stored === 'simple' || stored === 'full' ? stored : null
}

export function saveSimpleFields(keys: SimpleFieldKey[]): void {
  localStorage.setItem(QR_SIMPLE_FIELDS_STORAGE_KEY, JSON.stringify(keys))
}

export function loadSimpleFields(): SimpleFieldKey[] {
  const stored = localStorage.getItem(QR_SIMPLE_FIELDS_STORAGE_KEY)
  if (!stored) return []
  try {
    return sanitizeSimpleFields(JSON.parse(stored))
  } catch {
    return []
  }
}
