/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HIDE_CREDITS?: string
  readonly BASE_PATH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
