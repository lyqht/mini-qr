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

> [Review of 'MiniQR' that makes it easy to create good-looking QR codes](https://gigazine.net/gsc_news/en/20241104-qr-code-generator-miniqr/) - Gigazine, an Osaka based tech news website, one of the top 25 news sites by TIME.com

- ✅ Accessible: minimally WCAG A compliant
- 🎨 Customizable colors and styles
- 🖼️ Export to PNG, JPG & SVG\*
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
- 📝 Data templates: Support for various data types including text, URLs, emails, phone numbers, SMS, WiFi credentials, vCards, locations, and calendar events

\*SVG export has limited support and may not display correctly in all software. For more information, please refer to [CONTRIBUTING.md](CONTRIBUTING.md).

## Demo

Try it out [here](https://mini-qr-code-generator.vercel.app/) ✨

<details>

<summary>Frame text included in batch export (added in v0.17.0)</summary>

https://github.com/user-attachments/assets/c6db8fd5-ec36-43be-b6e3-a42e1b7dc3cb

</details>

<details>
<summary>Data templates (added in v0.16.0)</summary>

https://github.com/user-attachments/assets/863f9330-2645-4d23-88aa-04f5f5beaa67

</details>

<details>
<summary>Basic frame settings (added in v0.15.0)</summary>

https://github.com/user-attachments/assets/e160d60d-3c7f-4bbb-908c-efd11fec20e8

</details>

<details>
<summary>Scanning QR code (added in v0.13.0)</summary>

https://github.com/user-attachments/assets/5ad58b35-0a16-43a4-839a-e2197bfc273a

</details>

<details>
<summary>Batch data export (added in v0.9.0)</summary>

https://github.com/user-attachments/assets/fef17e6a-c226-4136-9501-8d3e951671e0

</details>

<details>

<summary>MVP - presets, languages, dark/light mode (v0.3.0)</summary>

https://github.com/lyqht/mini-qr/assets/35736525/991b2d7e-f168-4354-9091-1678d2c1bddb

</details>

## Self-hosting

For full self-hosting instructions including Docker setup, environment variables, custom presets, and deployment scenarios, see [SELF_HOSTING.md](SELF_HOSTING.md).

## Contributing

[![All Contributors](https://img.shields.io/github/all-contributors/lyqht/mini-qr?color=ee8449&style=flat-square)](#contributors) [![Crowdin](https://badges.crowdin.net/miniqr/localized.svg)](https://crowdin.com/project/miniqr)

Translations & bug fixes are welcome!
For all other matters, before opening an issue or contacting the project maintainer, please read up on to [CONTRIBUTING.md](CONTRIBUTING.md).

---

Thank you for everyone here for taking their time out to improve MiniQR 🧡

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/tenekev"><img src="https://avatars.githubusercontent.com/u/30023563?v=4?s=48" width="48px;" alt="tenekev"/><br /><sub><b>tenekev</b></sub></a><br /><a href="https://github.com/lyqht/mini-qr/commits?author=tenekev" title="Code">💻</a> <a href="https://github.com/lyqht/mini-qr/commits?author=tenekev" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://zainf.dev/"><img src="https://avatars.githubusercontent.com/u/6315466?v=4?s=48" width="48px;" alt="Zain Fathoni"/><br /><sub><b>Zain Fathoni</b></sub></a><br /><a href="#design-zainfathoni" title="Design">🎨</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/katullo11"><img src="https://avatars.githubusercontent.com/u/129339155?v=4?s=48" width="48px;" alt="Francesco"/><br /><sub><b>Francesco</b></sub></a><br /><a href="#translation-katullo11" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/ssrahul96"><img src="https://avatars.githubusercontent.com/u/15570570?v=4?s=48" width="48px;" alt="Rahul Somasundaram"/><br /><sub><b>Rahul Somasundaram</b></sub></a><br /><a href="https://github.com/lyqht/mini-qr/commits?author=ssrahul96" title="Code">💻</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/tecking"><img src="https://avatars.githubusercontent.com/u/479934?v=4?s=48" width="48px;" alt="tecking"/><br /><sub><b>tecking</b></sub></a><br /><a href="#translation-tecking" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/davidxhk"><img src="https://avatars.githubusercontent.com/u/37938921?v=4?s=48" width="48px;" alt="David Xie"/><br /><sub><b>David Xie</b></sub></a><br /><a href="https://github.com/lyqht/mini-qr/commits?author=davidxhk" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/pcbimon"><img src="https://avatars.githubusercontent.com/u/8252967?v=4?s=48" width="48px;" alt="Patipat Chewprecha"/><br /><sub><b>Patipat Chewprecha</b></sub></a><br /><a href="#translation-pcbimon" title="Translation">🌍</a> <a href="https://github.com/lyqht/mini-qr/commits?author=pcbimon" title="Code">💻</a> <a href="https://github.com/lyqht/mini-qr/commits?author=pcbimon" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/itsAnuga"><img src="https://avatars.githubusercontent.com/u/828450?v=4?s=48" width="48px;" alt="Johan Ekström"/><br /><sub><b>Johan Ekström</b></sub></a><br /><a href="https://github.com/lyqht/mini-qr/commits?author=itsAnuga" title="Code">💻</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://furycode.org/"><img src="https://avatars.githubusercontent.com/u/22378039?v=4?s=48" width="48px;" alt="Klemens Graf"/><br /><sub><b>Klemens Graf</b></sub></a><br /><a href="https://github.com/lyqht/mini-qr/commits?author=klemensgraf" title="Code">💻</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/unililium"><img src="https://avatars.githubusercontent.com/u/3117172?v=4?s=48" width="48px;" alt="林都"/><br /><sub><b>林都</b></sub></a><br /><a href="https://github.com/lyqht/mini-qr/commits?author=unililium" title="Code">💻</a> <a href="#translation-unililium" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/seals187"><img src="https://avatars.githubusercontent.com/u/86856086?v=4?s=48" width="48px;" alt="seals187"/><br /><sub><b>seals187</b></sub></a><br /><a href="https://github.com/lyqht/mini-qr/pulls?q=is%3Apr+reviewed-by%3Aseals187" title="Reviewed Pull Requests">👀</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/olvier"><img src="https://avatars.githubusercontent.com/u/13106409?v=4?s=48" width="48px;" alt="olvier"/><br /><sub><b>olvier</b></sub></a><br /><a href="https://github.com/lyqht/mini-qr/pulls?q=is%3Apr+reviewed-by%3Aolvier" title="Reviewed Pull Requests">👀</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/matthewberryman"><img src="https://avatars.githubusercontent.com/u/2288238?v=4?s=48" width="48px;" alt="Matthew Berryman"/><br /><sub><b>Matthew Berryman</b></sub></a><br /><a href="https://github.com/lyqht/mini-qr/commits?author=matthewberryman" title="Code">💻</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/Mr-Robot-ops"><img src="https://avatars.githubusercontent.com/u/55334802?v=4?s=48" width="48px;" alt="Mr-robot-ops"/><br /><sub><b>Mr-robot-ops</b></sub></a><br /><a href="#translation-Mr-Robot-ops" title="Translation">🌍</a> <a href="https://github.com/lyqht/mini-qr/commits?author=Mr-Robot-ops" title="Code">💻</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/danktankk"><img src="https://avatars.githubusercontent.com/u/34148516?v=4?s=48" width="48px;" alt="danktankk"/><br /><sub><b>danktankk</b></sub></a><br /><a href="https://github.com/lyqht/mini-qr/commits?author=danktankk" title="Code">💻</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/clausjs"><img src="https://avatars.githubusercontent.com/u/12068849?v=4?s=48" width="48px;" alt="Joseph Claus"/><br /><sub><b>Joseph Claus</b></sub></a><br /><a href="https://github.com/lyqht/mini-qr/commits?author=clausjs" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/kennydude"><img src="https://avatars.githubusercontent.com/u/198294?v=4?s=48" width="48px;" alt="Joe Simpson"/><br /><sub><b>Joe Simpson</b></sub></a><br /><a href="https://github.com/lyqht/mini-qr/commits?author=kennydude" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/toha-tiger"><img src="https://avatars.githubusercontent.com/u/8455781?v=4?s=48" width="48px;" alt="toha-tiger"/><br /><sub><b>toha-tiger</b></sub></a><br /><a href="https://github.com/lyqht/mini-qr/commits?author=toha-tiger" title="Code">💻</a> <a href="#design-toha-tiger" title="Design">🎨</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/Kolophonium0"><img src="https://avatars.githubusercontent.com/u/24278823?v=4?s=48" width="48px;" alt="Yannik Herbst"/><br /><sub><b>Yannik Herbst</b></sub></a><br /><a href="#question-Kolophonium0" title="Answering Questions">💬</a></td>
      <td align="center" valign="top" width="16.66%"><a href="http://solovjov.net/"><img src="https://avatars.githubusercontent.com/u/11983427?v=4?s=48" width="48px;" alt="Mikhail Solovev"/><br /><sub><b>Mikhail Solovev</b></sub></a><br /><a href="#translation-r3bers" title="Translation">🌍</a></td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td align="center" size="13px" colspan="6">
        <img src="https://raw.githubusercontent.com/all-contributors/all-contributors-cli/1b8533af435da9854653492b1327a23a4dbd0a10/assets/logo-small.svg">
          <a href="https://all-contributors.js.org/docs/en/bot/usage">Add your contributions</a>
        </img>
      </td>
    </tr>
  </tfoot>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
