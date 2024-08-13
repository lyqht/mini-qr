# mini-qr-code-generator

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

A customizable QR code generator to create beautiful and unique QR codes.

<div style="display:flex; flex-direction:row; flex-wrap:wrap; justify-content:center; gap:8px;">
    <a href="https://github.com/lyqht"><img width="100" src="public/presets/lyqht.svg" /></a>
    <a href="https://www.padlet.com"><img width="100" src="public/presets/padlet.svg" /></a>
    <a href="https://www.uilicious.com">
    <img width="100" src="public/presets/uilicious.svg" />
    </a>
    <a href="https://www.supabase.com"><img width="100" src="public/presets/supabase-green.svg" /></a>
    <a href="https://www.vercel.com"><img width="100" src="public/presets/vercel-dark.svg" /></a>
    <a href="https://viteconf.org/"><img width="100" src="public/presets/viteconf2023.svg" /></a>
</div>

## Demo

https://github.com/lyqht/mini-qr/assets/35736525/991b2d7e-f168-4354-9091-1678d2c1bddb


## Self-hosting with Docker 🐋
Mini-QR can easily be self-hosted. We provide a [docker-compose.yml](docker-compose.yml) file as well as our own images. We are using GitHub's `ghrc.io` Container Registry.

```bash
wget https://github.com/lyqht/mini-qr/raw/main/docker-compose.yml

docker compose up -d
```

## Features

- Generate QR codes with custom colors and styles
- Support for various output formats, including SVG and PNG
- Copy to clipboard
- UI respects user's light/dark mode preferences
- Randomize style button
- Available in 29 languages thanks to [deepl-translate-github-action](https://github.com/lyqht/deepl-translate-github-action)
- Save & Load QR Code config
- Upload custom image for logo
- Presets: Pre-crafted QR code styles are available as immediate usage/ reference. Refer to samples above!
- User can choose to include background or obtain a transparent QR code
- Error correction level selection - this will affect the size of the qr code and image within.