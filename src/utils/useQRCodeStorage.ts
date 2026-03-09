import type { Options as StyledQRCodeProps } from 'qr-code-styling'
import type { FrameStyle } from './framePresets'
import { isValidQRCodeConfig } from './qrCodePresets'

export interface QRCodeFrameConfig {
  text: string
  position: 'top' | 'bottom' | 'left' | 'right'
  style: FrameStyle
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
