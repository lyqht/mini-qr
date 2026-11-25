/**
 * Configuration injected at container start (see docker-entrypoint.sh) via
 * /config.js, as opposed to the build-time VITE_* variables.
 */

/**
 * VITE_* settings that can also be set when the container starts. A value set
 * at runtime takes precedence over the one baked in at build time.
 */
export const RUNTIME_ENV_KEYS = [
  'VITE_HIDE_CREDITS',
  'VITE_DEFAULT_PRESET',
  'VITE_DEFAULT_DATA_TO_ENCODE',
  'VITE_QR_CODE_PRESETS',
  'VITE_FRAME_PRESET',
  'VITE_FRAME_PRESETS',
  'VITE_DISABLE_LOCAL_STORAGE',
  'VITE_QR_CREATE_SIMPLE_FULL_MODE_TOGGLE',
  'VITE_FIELDS_VISIBLE',
  'VITE_DISABLE_COLOR_CONTRAST_WARNING'
] as const

export type RuntimeEnvKey = (typeof RUNTIME_ENV_KEYS)[number]

export interface RuntimeConfig {
  /** Logo (URL, same-origin path or data:image URI) used as the default QR code image. */
  defaultLogo?: string
  /** Runtime overrides for VITE_* settings. */
  env?: Partial<Record<RuntimeEnvKey, string>>
}

declare global {
  interface Window {
    __MINI_QR_CONFIG__?: RuntimeConfig
  }
}

export function getRuntimeConfig(): RuntimeConfig {
  if (typeof window === 'undefined') return {}
  return window.__MINI_QR_CONFIG__ ?? {}
}

// Each key is read with a static `import.meta.env.X` so Vite inlines it at
// build time. Built on every call so tests can stub env values.
function buildTimeEnv(): Record<RuntimeEnvKey, string | undefined> {
  return {
    VITE_HIDE_CREDITS: import.meta.env.VITE_HIDE_CREDITS,
    VITE_DEFAULT_PRESET: import.meta.env.VITE_DEFAULT_PRESET,
    VITE_DEFAULT_DATA_TO_ENCODE: import.meta.env.VITE_DEFAULT_DATA_TO_ENCODE,
    VITE_QR_CODE_PRESETS: import.meta.env.VITE_QR_CODE_PRESETS,
    VITE_FRAME_PRESET: import.meta.env.VITE_FRAME_PRESET,
    VITE_FRAME_PRESETS: import.meta.env.VITE_FRAME_PRESETS,
    VITE_DISABLE_LOCAL_STORAGE: import.meta.env.VITE_DISABLE_LOCAL_STORAGE,
    VITE_QR_CREATE_SIMPLE_FULL_MODE_TOGGLE: import.meta.env.VITE_QR_CREATE_SIMPLE_FULL_MODE_TOGGLE,
    VITE_FIELDS_VISIBLE: import.meta.env.VITE_FIELDS_VISIBLE,
    VITE_DISABLE_COLOR_CONTRAST_WARNING: import.meta.env.VITE_DISABLE_COLOR_CONTRAST_WARNING
  }
}

/**
 * Reads a setting, preferring the value set when the container started over
 * the one baked in at build time.
 */
export function getEnv(key: RuntimeEnvKey): string | undefined {
  const runtimeValue = getRuntimeConfig().env?.[key]
  if (runtimeValue !== undefined && runtimeValue !== '') return runtimeValue
  return buildTimeEnv()[key]
}
