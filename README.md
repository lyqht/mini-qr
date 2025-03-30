# Mini QR

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

An app to create beautiful QR codes and scan various QR code types.

<div style="display:flex; flex-direction:row; flex-wrap:wrap; justify-content:center; gap:8px;">
    <a href="https://esteetey.dev"><img width="100" src="public/presets/lyqht.svg" /></a>
    <a href="https://www.padlet.com"><img width="100" src="public/presets/padlet.svg" /></a>
    <a href="https://www.uilicious.com">
    <img width="100" src="public/presets/uilicious.svg" />
    </a>
    <a href="https://www.supabase.com"><img width="100" src="public/presets/supabase-green.svg" /></a>
    <a href="https://www.vercel.com"><img width="100" src="public/presets/vercel-dark.svg" /></a>
    <a href="https://viteconf.org/"><img width="100" src="public/presets/viteconf2023.svg" /></a>
</div>

## Features

- ✅ Accessible: minimally WCAG A compliant
- 🎨 Customizable colors and styles
- 🖼️ Export to PNG, JPG, SVG
- 📋 Copy to clipboard
- 🌓 Light/dark/system-preference mode toggle
- 🎲 Randomize style button
- 🌐 Available in 30+ languages
- 💾 Save & Load QR Code config
- 🖼️ Upload custom image for logo
- 🎭 Presets: Pre-crafted QR code styles
- 🖌️ Frame customization: Add text labels and style the frame around your QR code
- 🛡️ Error correction level: affects the size of the QR code and logo within. Use lower correction levels for bigger pieces of data to ensure that it can be read.
- 📱 QR Code Scanner: Scan QR codes using your camera or by uploading images, with intelligent detection for URLs, emails, phone numbers, WiFi credentials, and more
- 📦 Batch data export: Import a CSV file with multiple data strings and export QR codes for them all at once.
- 📲 PWA Support: Install MiniQR as a desktop or mobile app

### Installation as PWA

<details>
<summary>MiniQR can also be installed as a Progressive Web App (PWA) on your device</summary>

1. **Desktop (Chrome/Edge)**:

   - Visit [mini-qr.vercel.app](https://mini-qr.vercel.app)
   - Click the install icon (➕) in the address bar
   - Click "Install" in the prompt

2. **Mobile (Android)**:

   - Visit [mini-qr.vercel.app](https://mini-qr.vercel.app)
   - Tap the "Add to Home Screen" option in your browser menu
   - Tap "Install" or "Add"

3. **iOS (Safari)**:
   - Visit [mini-qr.vercel.app](https://mini-qr.vercel.app)
   - Tap the Share button
   - Scroll down and tap "Add to Home Screen"
   - Tap "Add"

Once installed, MiniQR will work offline and provide a native app-like experience.

</details>

## Demo

Try it out [here](https://mini-qr.vercel.app/) ✨

https://github.com/lyqht/mini-qr/assets/35736525/991b2d7e-f168-4354-9091-1678d2c1bddb

<details>
<summary>Batch data export (added in v0.9.0)</summary>

https://github.com/user-attachments/assets/fef17e6a-c226-4136-9501-8d3e951671e0

</details>

<details>
<summary>Scanning QR code (added in v0.13.0)</summary>

https://github.com/user-attachments/assets/5ad58b35-0a16-43a4-839a-e2197bfc273a

</details>

<details>
<summary>Basic frame settings (added in v0.15.0)</summary>

https://github.com/user-attachments/assets/e160d60d-3c7f-4bbb-908c-efd11fec20e8

</details>

## Self-hosting with Docker 🐋

Mini-QR can easily be self-hosted. We provide a [docker-compose.yml](docker-compose.yml) file as well as our own images. We are using GitHub's `ghrc.io` Container Registry.

```bash
wget https://github.com/lyqht/mini-qr/raw/main/docker-compose.yml

docker compose up -d
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.
