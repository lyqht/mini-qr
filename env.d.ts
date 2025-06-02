/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HIDE_CREDITS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
