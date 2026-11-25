#!/bin/sh
# Writes dist/config.js from runtime environment variables so that the
# prebuilt image can be configured without rebuilding.
set -e

node -e '
const fs = require("fs")

// Settings that can be set at container start. Each accepts its full
// VITE_* name or the short alias used in SELF_HOSTING.md.
const ENV_KEYS = {
  VITE_HIDE_CREDITS: "HIDE_CREDITS",
  VITE_DEFAULT_PRESET: "DEFAULT_PRESET",
  VITE_DEFAULT_DATA_TO_ENCODE: "DEFAULT_DATA",
  VITE_QR_CODE_PRESETS: "PRESETS",
  VITE_FRAME_PRESET: "FRAME_PRESET",
  VITE_FRAME_PRESETS: "FRAME_PRESETS",
  VITE_DISABLE_LOCAL_STORAGE: "DISABLE_LOCAL_STORAGE",
  VITE_QR_CREATE_SIMPLE_FULL_MODE_TOGGLE: "QR_CREATE_SIMPLE_FULL_MODE_TOGGLE",
  VITE_FIELDS_VISIBLE: "FIELDS_VISIBLE",
  VITE_DISABLE_COLOR_CONTRAST_WARNING: "DISABLE_COLOR_CONTRAST_WARNING"
}

const config = {}
if (process.env.DEFAULT_LOGO) config.defaultLogo = process.env.DEFAULT_LOGO

const env = {}
for (const [key, alias] of Object.entries(ENV_KEYS)) {
  const value = process.env[key] || process.env[alias]
  if (value) env[key] = value
}
if (Object.keys(env).length > 0) config.env = env

fs.writeFileSync(
  "dist/config.js",
  "window.__MINI_QR_CONFIG__ = " + JSON.stringify(config) + "\n"
)
' || echo "warning: could not write dist/config.js, using built-in defaults" >&2

exec "$@"
