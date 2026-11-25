/**
 * Configuration injected at container start (see docker-entrypoint.sh) via
 * /config.js, as opposed to the build-time VITE_* variables.
 */
export interface RuntimeConfig {
  /** Logo (URL, same-origin path or data:image URI) used as the default QR code image. */
  defaultLogo?: string
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
