# ASCII / Unicode QR Code Export — Design

**Issue:** [#208 — Generate QR Codes, in ASCII, E-ASCII and Unicode](https://github.com/lyqht/mini-qr/issues/208)

**Goal:** Let users export the QR code as text (ASCII or Unicode block characters) so it can be used in plain-text contexts (terminals, emails, READMEs, chat). Also expose a function from the internal QR code library to obtain the text representation of a matrix.

## Scope

In scope:
- Three text formats:
  - **ASCII** — 7-bit, two-char dark/light (`"##"` / `"  "`).
  - **Unicode half-blocks** — packs two matrix rows into one text row using `▀ ▄ █ ' '`.
  - **Unicode full-blocks** — `"██"` / `"  "`.
- A new "ASCII" export button in single mode that opens a preview modal.
- The modal previews all three formats and exposes, per format: **Download .md**, **Download .txt**, **Copy**.
- A frame-label warning banner in the modal when the QR has a frame configured (frame label text is excluded from the export).
- Batch export support — when `exportMode === Batch`, the modal switches to a "download all" mode that zips one `.md` / `.txt` per CSV row, per chosen format.
- Pure library function `qrMatrixToText(matrix, format, options)` re-exported from `@/lib/qr-code`.
- Unit tests for the converter and the UI wrapper.
- Storybook story showing the three formats side-by-side.

Out of scope:
- CP437 / DOS-style "extended ASCII" format. The linked qr2eascii style uses Unicode block characters in practice; we cover that with the Unicode formats.
- Translating the new i18n keys into all 30+ locales — only English added in this PR; other locales fall back to English until translators update them.
- Including the frame label text in the ASCII output. Frames are an image-styling concept; the text export is QR modules only.
- A separate "ASCII" button per format (rejected in favor of a single button + modal with previews).

## Architecture

Three layers, mirroring how PNG/JPG/SVG are organized today.

### 1. Core converter — `src/lib/qr-code/ascii-export.ts`

Pure, DOM-free function. Takes a boolean matrix and returns a string.

```ts
export type AsciiFormat = 'ascii' | 'unicode-half' | 'unicode-full'

export interface AsciiExportOptions {
  /** Modules of quiet zone around the QR. Defaults to 2. */
  quietZone?: number
  /** Override the dark/light glyphs (applies to 'ascii' and 'unicode-full'). */
  glyphs?: { dark: string; light: string }
}

export function qrMatrixToText(
  matrix: boolean[][],
  format: AsciiFormat,
  options?: AsciiExportOptions
): string
```

**Format details (defaults):**

| Format         | Dark glyph | Light glyph | Notes                                                       |
| -------------- | ---------- | ----------- | ----------------------------------------------------------- |
| `ascii`        | `"##"`     | `"  "`      | Two chars wide so the result is square in monospaced fonts. |
| `unicode-full` | `"██"`     | `"  "`      | Same width strategy as `ascii`.                             |
| `unicode-half` | `▀ ▄ █ ' '`| —           | Packs every 2 rows into 1; pads with a light row if odd.    |

For `unicode-half`, for each pair of rows `(top, bottom)`:

- both dark → `█`
- top dark only → `▀`
- bottom dark only → `▄`
- neither → `' '`

**Quiet zone:** prepends and appends `quietZone` light rows; pads each row with `quietZone` light columns on both sides. Default `2`.

**Errors:**
- Throws on empty matrix.
- Throws on non-square or ragged matrix (rows of differing lengths).

**Re-exports:** add `qrMatrixToText` and `AsciiFormat` to `src/lib/qr-code/index.ts`.

### 2. UI wrapper — `src/utils/convertToText.ts`

Bridges the lib to the browser (Blob/clipboard/filesystem). Pure utility, no Vue.

```ts
import { qrMatrixToText, type AsciiFormat } from '@/lib/qr-code'

export interface TextExportInput {
  matrix: boolean[][]
  format: AsciiFormat
  quietZone?: number
}

export function getAsciiText(input: TextExportInput): string
export function getMarkdownText(input: TextExportInput): string
export function downloadAsciiText(
  input: TextExportInput,
  filename: string,
  wrap: 'md' | 'txt'
): void
export async function copyAsciiTextToClipboard(input: TextExportInput): Promise<void>
```

- `getAsciiText` returns the raw converter output.
- `getMarkdownText` wraps the body in a triple-backtick fence with **no language tag** (so monospace rendering is preserved):

  ````
  ```
  <body>
  ```
  ````

- `downloadAsciiText` constructs a `Blob` (`text/markdown;charset=utf-8` or `text/plain;charset=utf-8`) and triggers a download. The blob → object-URL → `<a>.click()` pattern is duplicated from `convertToImage.ts`'s `triggerDownload` (8-line helper, not worth extracting yet).
- `copyAsciiTextToClipboard` uses `navigator.clipboard.writeText` (text, not image — distinct from `copyImageToClipboard`).

### 3. UI component — `src/components/AsciiExportModal.vue`

Sibling of `CopyImageModal.vue`. Props:

```ts
const props = defineProps<{
  open: boolean
  matrix: boolean[][]
  hasFrame: boolean
  filename: string          // base filename, no extension
  exportMode: ExportMode    // imports the existing ExportMode enum
  batchRows?: BatchRow[]    // present iff exportMode === Batch
}>()

defineEmits<{ (e: 'close'): void }>()
```

Layout:

- Header — title + close button.
- **If `hasFrame`** — a yellow info banner: *"Frame label is excluded from text export — the ASCII output contains the QR modules only."* (i18n key `'Frame label excluded from text export'`).
- **Three cards**, one per format (`ascii`, `unicode-half`, `unicode-full`):
  - Format name + 1-line description.
  - **Single mode:** a `<pre>` showing the generated text (`max-h-64 overflow-auto font-mono`), plus **Download .md**, **Download .txt**, **Copy** buttons.
  - **Batch mode:** the preview shows only the first row's output (with a "preview of first row" label) and the buttons become **Download all as .md** / **Download all as .txt** — each produces a ZIP with one file per CSV row.

State:
- `previews` is a `computed` derived from `matrix` and (in batch) `batchRows[0].matrix`, so the modal stays live if data changes while it's open.
- The modal owns its own ZIP construction logic when in batch mode (parallels the existing batch image flow in `QRCodeCreate.vue`).

### 4. Single-mode button integration — `QRCodeCreate.vue`

Add a fourth button immediately after the SVG button in the export-buttons section (~line 1310–1343):

```html
<button
  id="download-qr-text-button"
  class="button"
  @click="openAsciiExportModal"
  :disabled="isExportButtonDisabled"
  :title="isExportButtonDisabled
    ? t('Please enter data to encode first')
    : t('Export QR Code as ASCII or Unicode text')"
  :aria-label="t('Export QR Code as ASCII or Unicode text')"
>
  <!-- Inline SVG with a doc icon + 'TXT' label (matches existing button SVGs) -->
</button>
```

New refs in the script:

```ts
const isAsciiExportModalOpen = ref(false)
const asciiMatrix = computed(() =>
  data.value ? buildMatrix(data.value, errorCorrectionLevel.value).matrix : []
)
function openAsciiExportModal() { isAsciiExportModalOpen.value = true }
```

The modal is mounted alongside `CopyImageModal` and receives `matrix`, `hasFrame: showFrame.value`, `filename: exportFilename.value`, `exportMode: exportMode.value`, and `batchRows` (when in batch mode).

### 5. Batch flow

The batch ZIP currently lives inline in `QRCodeCreate.vue` (around line 894+) for PNG/JPG/SVG. The ASCII batch ZIP is built **inside the modal** when the user clicks "Download all as .md/.txt" — keeps the batch logic colocated with the format it serves and avoids further bloating `QRCodeCreate.vue`.

Per-row processing:

1. For each row's data string, build the matrix with `buildMatrix(data, ecLevel)`.
2. Run `qrMatrixToText(matrix, format, options)`.
3. Wrap as `.md` (fence) or `.txt` (raw).
4. Sanitize the filename from the row's identifier column (same logic the existing batch flow uses).
5. Add to a `JSZip` instance.
6. After all rows, generate the ZIP and trigger download as `qr-codes-ascii-<format>.zip`.

Errors per row are caught and logged, the loop continues — matches the existing batch flow's error handling.

## Testing

### Unit tests — `src/lib/qr-code/ascii-export.test.ts`

| Case                                     | Assertion                                                                                         |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Empty matrix                             | Throws with helpful message.                                                                      |
| Ragged matrix                            | Throws with helpful message.                                                                      |
| `ascii` line count                       | `count + 2 * quietZone` lines.                                                                    |
| `unicode-full` line count                | `count + 2 * quietZone` lines.                                                                    |
| `unicode-half` line count                | `ceil((count + 2 * quietZone) / 2)` lines.                                                        |
| Default quiet zone                       | Quiet zone of 2 light rows/cols around the QR.                                                    |
| `ascii` glyph correctness                | A single-cell `[[true]]` matrix renders as a quiet zone of `"  "` and a center `"##"`.            |
| `unicode-half` glyph map                 | `[[T,F],[F,T]]` produces the right `▀ ▄ █ ' '` mapping for each pair of (top, bottom) cells.      |
| Round-trip (`ascii`)                     | Generate from a known matrix, strip quiet zone, parse `"##"`/`"  "` → boolean matrix equals input. |
| Custom glyphs                            | `{ dark: '*', light: '.' }` overrides apply to `ascii` and `unicode-full`, are ignored by `unicode-half`. |

### Unit tests — `src/utils/convertToText.test.ts`

| Case                       | Assertion                                                                                |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| `getAsciiText`             | Equals raw `qrMatrixToText` output.                                                      |
| `getMarkdownText`          | Begins with `` ```\n ``, ends with `` \n``` ``, contains the raw body verbatim.            |
| `getMarkdownText` no lang  | Fence has **no** language tag (preserves monospace rendering).                            |

### Storybook — `src/lib/qr-code/stories/ascii-export.stories.ts`

Renders `'https://example.com'` matrix in all three formats inside `<pre>` blocks, with a `quietZone` arg control (0–4). Mirrors the existing story setup in `src/lib/qr-code/stories/`.

## i18n

New keys added to `src/locales/en.json`:

```
"Export QR Code as ASCII or Unicode text"
"Export as text"
"ASCII"
"Unicode (half-blocks)"
"Unicode (full-blocks)"
"Download .md"
"Download .txt"
"Copy to clipboard"
"Copied"
"Frame label excluded from text export"
"Frame label is excluded from text export — the ASCII output contains the QR modules only."
"Preview of first row"
"Download all as .md"
"Download all as .txt"
```

Other locales inherit English until translators update them — matches existing repo convention for new features.

## File map

New files:

- `src/lib/qr-code/ascii-export.ts`
- `src/lib/qr-code/ascii-export.test.ts`
- `src/lib/qr-code/stories/ascii-export.stories.ts`
- `src/utils/convertToText.ts`
- `src/utils/convertToText.test.ts`
- `src/components/AsciiExportModal.vue`

Modified files:

- `src/lib/qr-code/index.ts` — re-export `qrMatrixToText`, `AsciiFormat`, `AsciiExportOptions`.
- `src/components/QRCodeCreate.vue` — add ASCII button, modal mount, openers, computed matrix.
- `src/locales/en.json` — new i18n keys.
- `README.md` — add a bullet under Features describing ASCII/Unicode text export.

## Risks & open questions

- **Half-block padding ambiguity** — when matrix height is odd, the last text row encodes (lastModuleRow, lightPadRow). This is documented as a known minor visual artifact, not an error. Pure `ascii` and `unicode-full` formats avoid this if visual fidelity matters.
- **Clipboard permissions** — `navigator.clipboard.writeText` is widely supported; we wrap in try/catch and `console.error` on failure, matching existing patterns. No fallback UI for very old browsers.
- **Large QRs** — A 177×177 (version 40) matrix at `ascii`/`unicode-full` is ~354 chars wide × 177 lines (plus quiet zone). Renders fine in `<pre>` with horizontal overflow; we don't truncate previews.
