/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BASE_PATH?: string
  readonly VITE_HIDE_CREDITS?: string
  readonly VITE_DEFAULT_PRESET?: string
  readonly VITE_DEFAULT_DATA_TO_ENCODE?: string
  readonly VITE_QR_CODE_PRESETS?: string
  readonly VITE_FRAME_PRESET?: string
  readonly VITE_FRAME_PRESETS?: string
  readonly VITE_DISABLE_LOCAL_STORAGE?: string
  readonly VITE_QR_CREATE_SIMPLE_FULL_MODE_TOGGLE?: string
  readonly VITE_FIELDS_VISIBLE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
