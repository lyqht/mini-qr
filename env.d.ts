/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BASE_PATH?: string
  readonly VITE_HIDE_CREDITS?: string
  readonly VITE_DEFAULT_PRESET?: string
  readonly VITE_QR_CODE_PRESETS?: string
  readonly VITE_FRAME_PRESET?: string
  readonly VITE_FRAME_PRESETS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
