## v0.28.0 (2026-03-13)
- ✨ Add font family support for QR code frames ([#255](https://github.com/lyqht/mini-qr/pull/255))
- 🐛 issue where frame is clipped in export ([#251](https://github.com/lyqht/mini-qr/pull/251))
- 🔧 update translations ([#254](https://github.com/lyqht/mini-qr/pull/254))
- 🔧 Organize batch export templates into dedicated folder ([#253](https://github.com/lyqht/mini-qr/pull/253))

## v0.27.0 (2026-03-11)
- ✨ Add QR config validation and browser testing setup ([#248](https://github.com/lyqht/mini-qr/pull/248))
- ✨ Add custom filename support for QR code exports ([#232](https://github.com/lyqht/mini-qr/pull/232))
- 🐛 Update docker compose and nginx config ([#250](https://github.com/lyqht/mini-qr/pull/250))
- 🐛 English language label in Russian locale ([#241](https://github.com/lyqht/mini-qr/pull/241))
- 🐛 mobile drawer height issues ([#231](https://github.com/lyqht/mini-qr/pull/231))
- 🐛 drawer content getting clipped ([#224](https://github.com/lyqht/mini-qr/pull/224))
- 🔧 dx: Modify i18n hook and reorganize translations ([#246](https://github.com/lyqht/mini-qr/pull/246))
- 🔧 Upgrade Playwright to v1.58.2 and fix JPG background color handling ([#249](https://github.com/lyqht/mini-qr/pull/249))
- 🔧 Remove Microsoft Clarity analytics for privacy ([#244](https://github.com/lyqht/mini-qr/pull/244))
- 🔧 Migrate to ESLint v9 and update TypeScript tooling ([#233](https://github.com/lyqht/mini-qr/pull/233))
- ♻️ update key "Export as" to "Export QR code" for clarity ([#230](https://github.com/lyqht/mini-qr/pull/230))

## v0.26.4 (2025-10-21)
- 🐛 Improve semantics and a11y of settings section ([#223](https://github.com/lyqht/mini-qr/pull/223))
- 🐛 Improve QR code default text handling and preview consistency ([#222](https://github.com/lyqht/mini-qr/pull/222))
- 🐛 update changelog

## v0.26.3 (2025-10-16)
- ✨ Add multiline frame text support and improve CSV parsing ([#220](https://github.com/lyqht/mini-qr/pull/220))

## v0.26.2 (2025-10-02)
- 🐛 rounded corners not applied consistently ([#217](https://github.com/lyqht/mini-qr/pull/217))

## v0.26.1 (2025-09-26)
- ✨ add paste from clipboard support for scan QR code ([#205](https://github.com/lyqht/mini-qr/pull/205))
- 🐛 rounded corners not applied correctly when exported without frame ([#216](https://github.com/lyqht/mini-qr/pull/216))
- 🐛 autofill frame text with locale fallback ([#214](https://github.com/lyqht/mini-qr/pull/214))
- 🐛 german translations ([#211](https://github.com/lyqht/mini-qr/pull/211))
- 🐛 "English" language name for different translations ([#204](https://github.com/lyqht/mini-qr/pull/204))
- 🔧 add missing languages to locale selector ([#215](https://github.com/lyqht/mini-qr/pull/215))
- ♻️ for better internationalization support ([#212](https://github.com/lyqht/mini-qr/pull/212))

## v0.26.0 (2025-09-01)
- ✨ Add csv format guide ([#194](https://github.com/lyqht/mini-qr/pull/194))
- 🐛 Update links to MiniQR's official website
- 🔧 Fallback to nimiq/qr-scanner library on Html5Qrcode scanFile error ([#199](https://github.com/lyqht/mini-qr/pull/199))
- 📝 Add details on how to build without Docker ([#198](https://github.com/lyqht/mini-qr/pull/198))

## v0.25.0 (2025-08-10)
- ✨ Add custom filename support for batch exports ([#188](https://github.com/lyqht/mini-qr/pull/188))
- ✨ Add sponsor button in footer ([#182](https://github.com/lyqht/mini-qr/pull/182))
- 🐛 Improve .env.example base path ([#184](https://github.com/lyqht/mini-qr/pull/184))
- 🔧 Add post-commit hook for translations ([#191](https://github.com/lyqht/mini-qr/pull/191))

## v0.24.2 (2025-07-01)
- 🔧 Update german translations ([#179](https://github.com/lyqht/mini-qr/pull/179))

## v0.24.1 (2025-06-23)
- 🐛 fixes path mismatch in docker-compose.yml ([#177](https://github.com/lyqht/mini-qr/pull/177))
- 🔧 Accept additional VITE variables as build arguments and set them as environment variables for the build stage ([#173](https://github.com/lyqht/mini-qr/pull/173))

## v0.24.0 (2025-06-21)
- ✨ Add CC and BCC fields to email template ([#169](https://github.com/lyqht/mini-qr/pull/169))
- 🐛 persist disabled frame setting ([#174](https://github.com/lyqht/mini-qr/pull/174))
- 🐛 update changelog

## v0.23.0 (2025-06-08)
- ✨ Add environment variables for presets and local storage configuration ([#167](https://github.com/lyqht/mini-qr/pull/167))
- ✨ add BASE_PATH support for deployment and update environment variables ([#165](https://github.com/lyqht/mini-qr/pull/165))
- ✨ add option to hide maintainer credits ([#163](https://github.com/lyqht/mini-qr/pull/163))
- 🔧 Update italian translations ([#166](https://github.com/lyqht/mini-qr/pull/166))
- 🔧 add VITE_DEFAULT_DATA_TO_ENCODE variable to .env.example, README, docker-compose.yml, and env.d.ts files to provide a default data value for encoding in the app ([#170](https://github.com/lyqht/mini-qr/pull/170))

## v0.22.0 (2025-05-31)
- ✨ Add frame preset feature ([#161](https://github.com/lyqht/mini-qr/pull/161))
- ✨ debounce QR code generation ([#157](https://github.com/lyqht/mini-qr/pull/157))
- ✨ Support multiline frame text ([#156](https://github.com/lyqht/mini-qr/pull/156))

## v0.21.0 (2025-05-27)
- ✨ Add Docker support with multi-stage build and nginx configuration ([#153](https://github.com/lyqht/mini-qr/pull/153))
- 🐛 Update contributors - add @seals187 as contributor and update @pcbimon ([#155](https://github.com/lyqht/mini-qr/pull/155))

## v0.20.0 (2025-05-24)
- ✨ Add all-contributors bot ([#147](https://github.com/lyqht/mini-qr/pull/147))
- 🐛 update readme
- 🐛 phone numbers not showing in batch export ([#142](https://github.com/lyqht/mini-qr/pull/142))
- 📝 Add unililium as a contributor for code ([#148](https://github.com/lyqht/mini-qr/pull/148))
- 🔧 Remove "Ignore header row" option from CSV processing ([#149](https://github.com/lyqht/mini-qr/pull/149))
- 🔧 Bug fix: Copy to clipboard in Safari ([#143](https://github.com/lyqht/mini-qr/pull/143))

## v0.19.0 (2025-05-16)
- ✨ Add vCard support for batch QR code generation ([#136](https://github.com/lyqht/mini-qr/pull/136))
- ✨ add thai language ([#133](https://github.com/lyqht/mini-qr/pull/133))
- 🔧 update th translations ([#141](https://github.com/lyqht/mini-qr/pull/141))
- 🔧 try fix failed deployment due to workbox-window with pnpm
- 🔧 pwa automatic reload ([#137](https://github.com/lyqht/mini-qr/pull/137))
- 🔧 remove unused devbox lock

## v0.18.1 (2025-05-04)
- 🐛 vCard address formatting
- 🐛 generate version script to put commits in correct tags ([#128](https://github.com/lyqht/mini-qr/pull/128))

## v0.18.0 (2025-05-03)
- ✨ Add changelog footer ([#126](https://github.com/lyqht/mini-qr/pull/126))
- 🐛 script adding extra linebreaks in changelog.md
- 🐛 improve URL detection regex to support more comprehensive URLs ([#125](https://github.com/lyqht/mini-qr/pull/125))
- 🔧 disable pwa in dev ([#121](https://github.com/lyqht/mini-qr/pull/121))

## v0.17.1 (2025-04-26)
- 🔧 revert removing SVG option ([#120](https://github.com/lyqht/mini-qr/pull/120))

## v0.17.0 (2025-04-26)
- ✨ Add frame text support for batch QR code generation ([#117](https://github.com/lyqht/mini-qr/pull/117))
- 🔧 Enhance form styling and fix drawer z-index ([#115](https://github.com/lyqht/mini-qr/pull/115))

## v0.16.0 (2025-04-25)
- ✨ Add data templates for QR codes ([#109](https://github.com/lyqht/mini-qr/pull/109))
- ✨ Add Playwright E2E testing framework ([#106](https://github.com/lyqht/mini-qr/pull/106))
- 🐛 italian translations
- 🐛 add overflow-hidden class to the element-to-export div to prevent overflow issues
- 🔧 New Crowdin updates ([#108](https://github.com/lyqht/mini-qr/pull/108))
- 🔧 add crowdin translations
- 🔧 Remove svg export option ([#112](https://github.com/lyqht/mini-qr/pull/112))

## v0.15.0 (2025-03-30)
- ✨ Add camera switching feature to QR code scanner ([#103](https://github.com/lyqht/mini-qr/pull/103))
- ✨ Add QR code frame feature with customizable text and styling ([#100](https://github.com/lyqht/mini-qr/pull/100))
- ✨ Add jpg export ([#99](https://github.com/lyqht/mini-qr/pull/99))
- 🐛 Update README.md
- 🔧 Add translations ([#104](https://github.com/lyqht/mini-qr/pull/104))

## v0.14.0 (2025-03-17)
- ✨ Add PWA support for desktop and mobile installation ([#96](https://github.com/lyqht/mini-qr/pull/96))

## v0.13.1 (2025-03-13)
- 🐛 Improve QR code mobile drawer styling ([#97](https://github.com/lyqht/mini-qr/pull/97))

## v0.13.0 (2025-03-12)
- ✨ Add language selector with auto-detection and persistence ([#90](https://github.com/lyqht/mini-qr/pull/90))
- 🔧 v0.13.0 ([#94](https://github.com/lyqht/mini-qr/pull/94))

## v0.12.0 (2025-03-05)
- 🐛 Improve MiniQR UI ([#88](https://github.com/lyqht/mini-qr/pull/88))
- 🔧 update dependencies versions ([#89](https://github.com/lyqht/mini-qr/pull/89))

## v0.11.0 (2025-02-25)
- ✨ add hackomania 2025 qr code preset ([#86](https://github.com/lyqht/mini-qr/pull/86))
- 🐛 Update ja.json ([#67](https://github.com/lyqht/mini-qr/pull/67))
- 🔧 Update Crowdin configuration file
- 🔧 Put icon into language selector ([#87](https://github.com/lyqht/mini-qr/pull/87))

## v0.10.0 (2024-11-01)
- ✨ Add plain preset ([#66](https://github.com/lyqht/mini-qr/pull/66))
- ✨ Add light/dark mode toggle

## v0.9.3 (2024-10-23)
- ✨ Add contributing guidelines ([#57](https://github.com/lyqht/mini-qr/pull/57))
- ✨ Create FUNDING.yml
- 🐛 border radius not respected for svg output ([#62](https://github.com/lyqht/mini-qr/pull/62))
- 🐛 svg output not rendering in image editor softwares ([#54](https://github.com/lyqht/mini-qr/pull/54))

## v0.9.2 (2024-10-06)
- ✨ Create FUNDING.yml
- 🐛 svg output not rendering in image editor softwares ([#54](https://github.com/lyqht/mini-qr/pull/54))

## v0.9.1 (2024-10-06)
- 🐛 aria-hidden a11y issue on dnd div

## v0.9.0 (2024-10-06)
- 🐛 Update README.md
- 🔧 Batch data export ([#53](https://github.com/lyqht/mini-qr/pull/53))
- 🔧 bump vite from 5.1.2 to 5.1.7 ([#49](https://github.com/lyqht/mini-qr/pull/49))
- 🔧 bump braces from 3.0.2 to 3.0.3 ([#48](https://github.com/lyqht/mini-qr/pull/48))

## v0.8.0 (2024-08-13)
- ✨ Add support for error correction levels ([#46](https://github.com/lyqht/mini-qr/pull/46))

## v0.7.0 (2024-08-08)
- ✨ support transparent background ([#42](https://github.com/lyqht/mini-qr/pull/42))
- ✨ Added Docker support ([#37](https://github.com/lyqht/mini-qr/pull/37))
- ✨ add video demo
- 🐛 a11y issues
- 🐛 combobox dark mode ui
- 🔧 translation of locales/en.json

## v0.6.1 (2024-02-16)
- ✨ add some hackomania2024 presets ([#31](https://github.com/lyqht/mini-qr/pull/31))
- 🐛 combobox dark mode ui
- 🐛 dark mode ui ([#36](https://github.com/lyqht/mini-qr/pull/36))
- 🐛 update dependencies ([#35](https://github.com/lyqht/mini-qr/pull/35))
- 🐛 styling on mobile viewport

## v0.6.0 (2024-02-13)
- ✨ Add shadcn-vue combobox components ([#30](https://github.com/lyqht/mini-qr/pull/30))
- 🔧 update translate github action to only run if PRs are merged
- 🔧 translation of locales/en.json
- 🔧 Rename project and update readme

## v0.5.0 (2024-01-05)
- ✨ add clarity to project
- 🔧 translation of locales/en.json
- 🔧 Feature: Save & Load preset from local storage ([#28](https://github.com/lyqht/mini-qr/pull/28))
- 🔧 Hide copy to clipboard if API is not supported on the browser ([#27](https://github.com/lyqht/mini-qr/pull/27))

## v0.4.0 (2023-12-31)
- ✨ Add SupabasePurple & ViteConf2023 presets ([#19](https://github.com/lyqht/mini-qr/pull/19))
- 🐛 update Padlet preset image URL ([#23](https://github.com/lyqht/mini-qr/pull/23))
- 🐛 og image
- 🐛 missing preset typing
- 🔧 Upgraded dependencies ([#25](https://github.com/lyqht/mini-qr/pull/25))
- 🔧 A11y fixes ([#16](https://github.com/lyqht/mini-qr/pull/16))

## v0.3.0 (2023-08-07)
- ✨ add Pejuang Kode Preset ([#12](https://github.com/lyqht/mini-qr/pull/12))
- ✨ add support for border radius configuration in QR Code generator
- 🐛 update readme and changelog
- 🐛 Update README.md
- 🐛 order of inputs
- 🐛 QR Code Resizing Visually ([#6](https://github.com/lyqht/mini-qr/pull/6))
- 🔧 translation of locales/en.json
- 🔧 rename keys for i18n
- 🔧 translation of locales/en.json
- 🔧 translation of locales/en.json
- 🔧 Add translation, save/load qr config features and update styles ([#1](https://github.com/lyqht/mini-qr/pull/1))
- 🔧 V0.3 ([#15](https://github.com/lyqht/mini-qr/pull/15))
- 🔧 V0.2.0: Add presets feature, eslint/prettier pre-commit husky hook ([#7](https://github.com/lyqht/mini-qr/pull/7))
- 🔧 V0.1 ([#2](https://github.com/lyqht/mini-qr/pull/2))

### v0.2.0 (2023-08-06)

- ✨ Add Presets: Pre-crafted QR code styles available (padletPreset, uiliciousPreset, supabasePreset, vercelLightPreset, vercelDarkPreset)
- 🐛 Refactor styles

### v0.1.0 (2023-08-03)

- ✨ Upload custom image for logo
- 🐛 Fix inconsistencies in button & input styling
- 🐛 Refactor styles
- 🐛 Fix missing inputs for background color and border-radius

### v0.0.0 (2023-03-25)

- ✨ Generate QR codes with custom colors and styles
- ✨ Support SVG and PNG output formats
- ✨ Add Copy to clipboard feature
- ✨ UI respects light/dark mode preferences
- ✨ Add Randomize style button
- 🔧 Available in 29 languages (via deepl-translate-github-action)
- ✨ Save & Load QR Code config

*Changelog generated by `scripts/generate-version.sh`*
