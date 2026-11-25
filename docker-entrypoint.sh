#!/bin/sh
# Writes dist/config.js from runtime environment variables so that the
# prebuilt image can be configured without rebuilding.
set -e

node -e '
const fs = require("fs")
const config = {}
if (process.env.DEFAULT_LOGO) config.defaultLogo = process.env.DEFAULT_LOGO
fs.writeFileSync(
  "dist/config.js",
  "window.__MINI_QR_CONFIG__ = " + JSON.stringify(config) + "\n"
)
' || echo "warning: could not write dist/config.js, using built-in defaults" >&2

exec "$@"
