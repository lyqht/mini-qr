# ASCII / Unicode QR Text Export — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an ASCII/Unicode text export for QR codes (issue [#208](https://github.com/lyqht/mini-qr/issues/208)) — exposed both as a public library function and as a UI button that opens a preview modal with `.md` / `.txt` download and copy-to-clipboard for three formats: ASCII, Unicode half-block, Unicode full-block.

**Architecture:** Three layers. (1) Pure DOM-free converter `qrMatrixToText(matrix, format, options)` in `src/lib/qr-code/ascii-export.ts`. (2) Browser-side wrapper `src/utils/convertToText.ts` with blob download + clipboard. (3) `AsciiExportModal.vue` component that previews the three formats and exposes per-format actions; integrates into `QRCodeCreate.vue`'s single and batch export flows.

**Tech Stack:** Vue 3 (Composition API), TypeScript, Vitest, Storybook 8, `qrcode-generator` (existing), `jszip` (existing), `vue-i18n` (existing).

**Spec:** `docs/superpowers/specs/2026-05-12-ascii-qr-export-design.md`

---

## File Map

**New files:**
- `src/lib/qr-code/ascii-export.ts` — pure converter (`qrMatrixToText`, `AsciiFormat`, `AsciiExportOptions`).
- `src/lib/qr-code/ascii-export.test.ts` — unit tests for the converter.
- `src/lib/qr-code/stories/ascii-export.stories.ts` — Storybook story for the three formats.
- `src/utils/convertToText.ts` — browser-side wrapper (`getAsciiText`, `getMarkdownText`, `downloadAsciiText`, `copyAsciiTextToClipboard`).
- `src/utils/convertToText.test.ts` — unit tests for the wrapper.
- `src/components/AsciiExportModal.vue` — preview-and-download modal.

**Modified files:**
- `src/lib/qr-code/index.ts` — re-export converter and types.
- `src/components/QRCodeCreate.vue` — add ASCII button, mount modal, pass props.
- `src/locales/en.json` — new i18n keys.
- `README.md` — add feature bullet.

---

## Task 1: Bootstrap the converter file with validation

**Files:**
- Create: `src/lib/qr-code/ascii-export.ts`
- Create: `src/lib/qr-code/ascii-export.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/qr-code/ascii-export.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { qrMatrixToText } from './ascii-export'

describe('qrMatrixToText — validation', () => {
  it('throws on empty matrix', () => {
    expect(() => qrMatrixToText([], 'ascii')).toThrow(/non-empty/)
  })

  it('throws on matrix with zero-length rows', () => {
    expect(() => qrMatrixToText([[]], 'ascii')).toThrow(/non-empty/)
  })

  it('throws on ragged (non-square) matrix', () => {
    const ragged = [
      [true, false],
      [true]
    ]
    expect(() => qrMatrixToText(ragged, 'ascii')).toThrow(/square/)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/lib/qr-code/ascii-export.test.ts`
Expected: All three tests fail with "Cannot find module './ascii-export'".

- [ ] **Step 3: Create the minimal implementation**

Create `src/lib/qr-code/ascii-export.ts`:

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
  _format: AsciiFormat,
  _options?: AsciiExportOptions
): string {
  if (!matrix.length || !matrix[0]?.length) {
    throw new Error('qrMatrixToText requires a non-empty matrix')
  }
  const size = matrix.length
  for (const row of matrix) {
    if (row.length !== size) {
      throw new Error('qrMatrixToText requires a square matrix')
    }
  }
  return ''
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run src/lib/qr-code/ascii-export.test.ts`
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/qr-code/ascii-export.ts src/lib/qr-code/ascii-export.test.ts
git commit -m "feat(qr-lib): scaffold qrMatrixToText with input validation (#208)"
```

---

## Task 2: Implement the `ascii` format

**Files:**
- Modify: `src/lib/qr-code/ascii-export.ts`
- Modify: `src/lib/qr-code/ascii-export.test.ts`

- [ ] **Step 1: Add the failing tests**

Append to `src/lib/qr-code/ascii-export.test.ts`:

```ts
describe('qrMatrixToText — ascii format', () => {
  it('renders dark cells as "##" and light cells as "  "', () => {
    const matrix = [
      [true, false],
      [false, true]
    ]
    const out = qrMatrixToText(matrix, 'ascii', { quietZone: 0 })
    expect(out).toBe(['##  ', '  ##'].join('\n'))
  })

  it('produces count + 2*quietZone lines (default quiet zone = 2)', () => {
    const matrix = [
      [true, false],
      [false, true]
    ]
    const out = qrMatrixToText(matrix, 'ascii')
    expect(out.split('\n')).toHaveLength(2 + 2 * 2)
  })

  it('surrounds the QR with light quiet zone', () => {
    const matrix = [[true]]
    const out = qrMatrixToText(matrix, 'ascii', { quietZone: 1 })
    expect(out.split('\n')).toEqual(['      ', '  ##  ', '      '])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/lib/qr-code/ascii-export.test.ts`
Expected: 3 new tests fail (returns empty string).

- [ ] **Step 3: Implement the ascii branch and quiet-zone helper**

Replace `src/lib/qr-code/ascii-export.ts` with:

```ts
export type AsciiFormat = 'ascii' | 'unicode-half' | 'unicode-full'

export interface AsciiExportOptions {
  /** Modules of quiet zone around the QR. Defaults to 2. */
  quietZone?: number
  /** Override the dark/light glyphs (applies to 'ascii' and 'unicode-full'). */
  glyphs?: { dark: string; light: string }
}

const DEFAULT_QUIET_ZONE = 2
const DEFAULT_GLYPHS: Record<'ascii' | 'unicode-full', { dark: string; light: string }> = {
  ascii: { dark: '##', light: '  ' },
  'unicode-full': { dark: '██', light: '  ' }
}

function validateMatrix(matrix: boolean[][]): number {
  if (!matrix.length || !matrix[0]?.length) {
    throw new Error('qrMatrixToText requires a non-empty matrix')
  }
  const size = matrix.length
  for (const row of matrix) {
    if (row.length !== size) {
      throw new Error('qrMatrixToText requires a square matrix')
    }
  }
  return size
}

function padWithQuietZone(matrix: boolean[][], quietZone: number): boolean[][] {
  if (quietZone <= 0) return matrix
  const size = matrix.length
  const paddedSize = size + 2 * quietZone
  const lightRow: boolean[] = new Array(paddedSize).fill(false)
  const padded: boolean[][] = []
  for (let i = 0; i < quietZone; i++) padded.push([...lightRow])
  for (const row of matrix) {
    const padRow = new Array(quietZone).fill(false)
    padded.push([...padRow, ...row, ...padRow])
  }
  for (let i = 0; i < quietZone; i++) padded.push([...lightRow])
  return padded
}

function renderPaired(
  padded: boolean[][],
  dark: string,
  light: string
): string {
  return padded.map((row) => row.map((cell) => (cell ? dark : light)).join('')).join('\n')
}

export function qrMatrixToText(
  matrix: boolean[][],
  format: AsciiFormat,
  options: AsciiExportOptions = {}
): string {
  validateMatrix(matrix)
  const quietZone = options.quietZone ?? DEFAULT_QUIET_ZONE
  const padded = padWithQuietZone(matrix, quietZone)

  if (format === 'ascii') {
    const g = options.glyphs ?? DEFAULT_GLYPHS.ascii
    return renderPaired(padded, g.dark, g.light)
  }

  // unicode-full and unicode-half implemented in later tasks
  return ''
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run src/lib/qr-code/ascii-export.test.ts`
Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/qr-code/ascii-export.ts src/lib/qr-code/ascii-export.test.ts
git commit -m "feat(qr-lib): implement ascii format for qrMatrixToText (#208)"
```

---

## Task 3: Implement the `unicode-full` format

**Files:**
- Modify: `src/lib/qr-code/ascii-export.ts`
- Modify: `src/lib/qr-code/ascii-export.test.ts`

- [ ] **Step 1: Add the failing tests**

Append to `src/lib/qr-code/ascii-export.test.ts`:

```ts
describe('qrMatrixToText — unicode-full format', () => {
  it('renders dark cells as "██" and light cells as "  "', () => {
    const matrix = [
      [true, false],
      [false, true]
    ]
    const out = qrMatrixToText(matrix, 'unicode-full', { quietZone: 0 })
    expect(out).toBe(['██  ', '  ██'].join('\n'))
  })

  it('produces count + 2*quietZone lines (default quiet zone = 2)', () => {
    const matrix = [
      [true, false],
      [false, true]
    ]
    const out = qrMatrixToText(matrix, 'unicode-full')
    expect(out.split('\n')).toHaveLength(2 + 2 * 2)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/lib/qr-code/ascii-export.test.ts`
Expected: 2 new tests fail.

- [ ] **Step 3: Add the unicode-full branch**

In `src/lib/qr-code/ascii-export.ts`, inside `qrMatrixToText`, before the trailing `return ''`, add:

```ts
  if (format === 'unicode-full') {
    const g = options.glyphs ?? DEFAULT_GLYPHS['unicode-full']
    return renderPaired(padded, g.dark, g.light)
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run src/lib/qr-code/ascii-export.test.ts`
Expected: 8 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/qr-code/ascii-export.ts src/lib/qr-code/ascii-export.test.ts
git commit -m "feat(qr-lib): implement unicode-full format for qrMatrixToText (#208)"
```

---

## Task 4: Implement the `unicode-half` format

**Files:**
- Modify: `src/lib/qr-code/ascii-export.ts`
- Modify: `src/lib/qr-code/ascii-export.test.ts`

- [ ] **Step 1: Add the failing tests**

Append to `src/lib/qr-code/ascii-export.test.ts`:

```ts
describe('qrMatrixToText — unicode-half format', () => {
  it('packs two rows into one line with the four glyphs', () => {
    // (top, bottom): TT→█, TF→▀, FT→▄, FF→' '
    const matrix = [
      [true, false, true, false],
      [true, true, false, false]
    ]
    const out = qrMatrixToText(matrix, 'unicode-half', { quietZone: 0 })
    expect(out).toBe('█▀▄ ')
  })

  it('pads an odd-row matrix with a light row at the bottom', () => {
    const matrix = [[true]]
    const out = qrMatrixToText(matrix, 'unicode-half', { quietZone: 0 })
    expect(out).toBe('▀')
  })

  it('line count is ceil((count + 2*quietZone) / 2)', () => {
    const matrix = [[true]]
    const out = qrMatrixToText(matrix, 'unicode-half', { quietZone: 2 })
    // (1 + 2*2) = 5, ceil(5/2) = 3
    expect(out.split('\n')).toHaveLength(3)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/lib/qr-code/ascii-export.test.ts`
Expected: 3 new tests fail.

- [ ] **Step 3: Implement the unicode-half branch**

In `src/lib/qr-code/ascii-export.ts`, add a helper above `qrMatrixToText`:

```ts
function renderHalfBlocks(padded: boolean[][]): string {
  const lines: string[] = []
  const width = padded[0].length
  for (let r = 0; r < padded.length; r += 2) {
    const top = padded[r]
    const bottom = padded[r + 1] ?? new Array(width).fill(false)
    let line = ''
    for (let c = 0; c < width; c++) {
      const t = top[c]
      const b = bottom[c]
      if (t && b) line += '█'
      else if (t && !b) line += '▀'
      else if (!t && b) line += '▄'
      else line += ' '
    }
    lines.push(line)
  }
  return lines.join('\n')
}
```

Then inside `qrMatrixToText`, before the trailing `return ''`, add:

```ts
  if (format === 'unicode-half') {
    return renderHalfBlocks(padded)
  }
```

The trailing `return ''` can be replaced with an exhaustive-check assertion:

```ts
  const exhaustive: never = format
  throw new Error(`Unknown ASCII format: ${exhaustive}`)
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run src/lib/qr-code/ascii-export.test.ts`
Expected: 11 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/qr-code/ascii-export.ts src/lib/qr-code/ascii-export.test.ts
git commit -m "feat(qr-lib): implement unicode-half format for qrMatrixToText (#208)"
```

---

## Task 5: Custom glyphs option

**Files:**
- Modify: `src/lib/qr-code/ascii-export.test.ts`

- [ ] **Step 1: Add the test**

Append to `src/lib/qr-code/ascii-export.test.ts`:

```ts
describe('qrMatrixToText — glyph overrides', () => {
  it('uses custom glyphs for ascii', () => {
    const matrix = [[true, false]]
    const out = qrMatrixToText(matrix, 'ascii', {
      quietZone: 0,
      glyphs: { dark: '*', light: '.' }
    })
    expect(out).toBe('*.')
  })

  it('uses custom glyphs for unicode-full', () => {
    const matrix = [[true, false]]
    const out = qrMatrixToText(matrix, 'unicode-full', {
      quietZone: 0,
      glyphs: { dark: 'X', light: 'o' }
    })
    expect(out).toBe('Xo')
  })

  it('ignores glyph overrides for unicode-half', () => {
    const matrix = [
      [true, false],
      [false, true]
    ]
    const out = qrMatrixToText(matrix, 'unicode-half', {
      quietZone: 0,
      glyphs: { dark: 'X', light: 'o' }
    })
    expect(out).toBe('▀▄')
  })
})
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `pnpm vitest run src/lib/qr-code/ascii-export.test.ts`
Expected: 14 passed. The implementation already supports custom glyphs for `ascii` and `unicode-full` via the `options.glyphs ?? DEFAULT_GLYPHS[...]` line; `unicode-half` ignores them by construction.

- [ ] **Step 3: Commit**

```bash
git add src/lib/qr-code/ascii-export.test.ts
git commit -m "test(qr-lib): cover custom glyph overrides for qrMatrixToText (#208)"
```

---

## Task 6: Round-trip test (ascii format)

**Files:**
- Modify: `src/lib/qr-code/ascii-export.test.ts`

- [ ] **Step 1: Add the test**

Append:

```ts
describe('qrMatrixToText — round-trip (ascii)', () => {
  it('text → matrix recovers the original', () => {
    const original: boolean[][] = [
      [true, false, true, false],
      [false, true, false, true],
      [true, true, false, false],
      [false, false, true, true]
    ]
    const text = qrMatrixToText(original, 'ascii', { quietZone: 0 })
    const recovered = text.split('\n').map((line) => {
      const cells: boolean[] = []
      for (let i = 0; i < line.length; i += 2) {
        cells.push(line.slice(i, i + 2) === '##')
      }
      return cells
    })
    expect(recovered).toEqual(original)
  })
})
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `pnpm vitest run src/lib/qr-code/ascii-export.test.ts`
Expected: 15 passed.

- [ ] **Step 3: Commit**

```bash
git add src/lib/qr-code/ascii-export.test.ts
git commit -m "test(qr-lib): add ascii round-trip test for qrMatrixToText (#208)"
```

---

## Task 7: Re-export from the library index

**Files:**
- Modify: `src/lib/qr-code/index.ts`

- [ ] **Step 1: Read current exports**

Open `src/lib/qr-code/index.ts`. Confirm the existing structure (named function re-exports followed by a `export type { ... }` block).

- [ ] **Step 2: Add the converter exports**

Edit `src/lib/qr-code/index.ts`. After the existing `export { buildSvgExportString }` line add:

```ts
export { qrMatrixToText } from './ascii-export'
```

In the type block (after `TextPosition`), add:

```ts
export type { AsciiFormat, AsciiExportOptions } from './ascii-export'
```

- [ ] **Step 3: Verify the package compiles**

Run: `pnpm type-check`
Expected: exits 0, no new errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/qr-code/index.ts
git commit -m "feat(qr-lib): re-export qrMatrixToText from public api (#208)"
```

---

## Task 8: Browser-side wrapper — getters and tests

**Files:**
- Create: `src/utils/convertToText.ts`
- Create: `src/utils/convertToText.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/utils/convertToText.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { getAsciiText, getMarkdownText } from './convertToText'

const matrix = [
  [true, false],
  [false, true]
]

describe('convertToText — getAsciiText', () => {
  it('returns the raw qrMatrixToText output', () => {
    const out = getAsciiText({ matrix, format: 'ascii', quietZone: 0 })
    expect(out).toBe(['##  ', '  ##'].join('\n'))
  })
})

describe('convertToText — getMarkdownText', () => {
  it('wraps the body in a triple-backtick fence with no language tag', () => {
    const out = getMarkdownText({ matrix, format: 'ascii', quietZone: 0 })
    expect(out.startsWith('```\n')).toBe(true)
    expect(out.endsWith('\n```\n')).toBe(true)
    expect(out).toContain('##  \n  ##')
  })

  it('does not include a language tag after the opening fence', () => {
    const out = getMarkdownText({ matrix, format: 'ascii', quietZone: 0 })
    const firstLine = out.split('\n')[0]
    expect(firstLine).toBe('```')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/utils/convertToText.test.ts`
Expected: 3 tests fail with "Cannot find module".

- [ ] **Step 3: Create the wrapper module**

Create `src/utils/convertToText.ts`:

```ts
import { qrMatrixToText, type AsciiFormat } from '@/lib/qr-code'

export interface TextExportInput {
  matrix: boolean[][]
  format: AsciiFormat
  quietZone?: number
}

export function getAsciiText(input: TextExportInput): string {
  return qrMatrixToText(input.matrix, input.format, { quietZone: input.quietZone })
}

export function getMarkdownText(input: TextExportInput): string {
  const body = getAsciiText(input)
  return '```\n' + body + '\n```\n'
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run src/utils/convertToText.test.ts`
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add src/utils/convertToText.ts src/utils/convertToText.test.ts
git commit -m "feat(utils): add convertToText with getAsciiText and getMarkdownText (#208)"
```

---

## Task 9: Download + clipboard helpers

**Files:**
- Modify: `src/utils/convertToText.ts`

- [ ] **Step 1: Add the download and clipboard helpers**

Append to `src/utils/convertToText.ts`:

```ts
function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 200)
}

export function downloadAsciiText(
  input: TextExportInput,
  filename: string,
  wrap: 'md' | 'txt'
): void {
  try {
    const body = wrap === 'md' ? getMarkdownText(input) : getAsciiText(input)
    const mime = wrap === 'md' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8'
    const blob = new Blob([body], { type: mime })
    triggerDownload(blob, filename)
  } catch (error) {
    console.error('Error generating text export:', error)
  }
}

export async function copyAsciiTextToClipboard(input: TextExportInput): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(getAsciiText(input))
    return true
  } catch (error) {
    console.error('Error copying QR text to clipboard:', error)
    return false
  }
}
```

- [ ] **Step 2: Verify the package compiles**

Run: `pnpm type-check`
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/utils/convertToText.ts
git commit -m "feat(utils): add downloadAsciiText and copyAsciiTextToClipboard (#208)"
```

---

## Task 10: AsciiExportModal — single mode preview cards

**Files:**
- Create: `src/components/AsciiExportModal.vue`

- [ ] **Step 1: Create the modal component**

Create `src/components/AsciiExportModal.vue`:

```vue
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  copyAsciiTextToClipboard,
  downloadAsciiText,
  getAsciiText,
  type TextExportInput
} from '@/utils/convertToText'
import type { AsciiFormat } from '@/lib/qr-code'

interface BatchRow {
  data: string
  fileName: string
}

const props = withDefaults(
  defineProps<{
    open: boolean
    matrix: boolean[][]
    hasFrame: boolean
    filename: string
    isBatch?: boolean
    batchRows?: BatchRow[]
    ecLevel?: 'L' | 'M' | 'Q' | 'H'
  }>(),
  { isBatch: false, batchRows: () => [], ecLevel: 'Q' }
)

defineEmits<{ (e: 'close'): void }>()

const { t } = useI18n()

interface FormatCard {
  id: AsciiFormat
  label: string
  description: string
}

const cards = computed<FormatCard[]>(() => [
  {
    id: 'ascii',
    label: t('ASCII'),
    description: t('7-bit characters — works in plain text, email, and terminals.')
  },
  {
    id: 'unicode-half',
    label: t('Unicode (half-blocks)'),
    description: t('Compact: two rows packed into one line using ▀ ▄ █ characters.')
  },
  {
    id: 'unicode-full',
    label: t('Unicode (full-blocks)'),
    description: t('Solid block characters (██) — best fidelity in modern fonts.')
  }
])

function preview(format: AsciiFormat): string {
  if (!props.matrix.length) return ''
  return getAsciiText({ matrix: props.matrix, format })
}

const copiedFormat = ref<AsciiFormat | null>(null)

function safeFilename(): string {
  return (props.filename || 'qr-code').replace(/[^a-zA-Z0-9_-]/g, '_')
}

function onDownload(format: AsciiFormat, wrap: 'md' | 'txt') {
  if (!props.matrix.length) return
  const input: TextExportInput = { matrix: props.matrix, format }
  downloadAsciiText(input, `${safeFilename()}.${wrap}`, wrap)
}

async function onCopy(format: AsciiFormat) {
  if (!props.matrix.length) return
  const ok = await copyAsciiTextToClipboard({ matrix: props.matrix, format })
  if (ok) {
    copiedFormat.value = format
    setTimeout(() => {
      if (copiedFormat.value === format) copiedFormat.value = null
    }, 1500)
  }
}

watch(
  () => props.open,
  (open) => {
    if (!open) copiedFormat.value = null
  }
)
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg dark:bg-zinc-900"
    >
      <button
        type="button"
        class="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
        @click="$emit('close')"
        :aria-label="t('Close')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <h3 class="mb-4 text-lg font-medium">{{ t('Export as text') }}</h3>

      <div class="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
        <div v-for="card in cards" :key="card.id" class="rounded-md border border-zinc-200 p-3 dark:border-zinc-700">
          <div class="mb-2 flex items-baseline justify-between gap-2">
            <strong>{{ card.label }}</strong>
            <span class="text-xs text-zinc-500">{{ card.description }}</span>
          </div>
          <pre
            class="max-h-64 overflow-auto whitespace-pre rounded bg-zinc-50 p-2 font-mono text-xs leading-tight dark:bg-zinc-800"
          >{{ preview(card.id) }}</pre>
          <div class="mt-2 flex flex-wrap gap-2">
            <button class="button text-sm" @click="onDownload(card.id, 'md')">
              {{ t('Download .md') }}
            </button>
            <button class="button text-sm" @click="onDownload(card.id, 'txt')">
              {{ t('Download .txt') }}
            </button>
            <button class="button text-sm" @click="onCopy(card.id)">
              {{ copiedFormat === card.id ? t('Copied') : t('Copy to clipboard') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Verify the project compiles**

Run: `pnpm type-check`
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/AsciiExportModal.vue
git commit -m "feat(components): add AsciiExportModal with single-mode previews (#208)"
```

---

## Task 11: Frame-label warning banner

**Files:**
- Modify: `src/components/AsciiExportModal.vue`

- [ ] **Step 1: Add the banner**

In `src/components/AsciiExportModal.vue`, locate the `<h3>` line and insert directly after it (before the `<div class="flex max-h-[70vh] ...">`):

```vue
      <div
        v-if="hasFrame"
        role="note"
        class="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
      >
        {{ t('Frame label is excluded from text export — the ASCII output contains the QR modules only.') }}
      </div>
```

- [ ] **Step 2: Verify the project compiles**

Run: `pnpm type-check`
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/AsciiExportModal.vue
git commit -m "feat(components): warn about frame label exclusion in AsciiExportModal (#208)"
```

---

## Task 12: Wire the ASCII button + modal into QRCodeCreate (single mode)

**Files:**
- Modify: `src/components/QRCodeCreate.vue`

- [ ] **Step 1: Import the modal and matrix builder**

In `src/components/QRCodeCreate.vue`, locate the import block (around line 24-35). After the existing `downloadSvgElement` import line, add the new imports. Find the line:

```ts
import {
  ...
  downloadSvgElement,
  ...
} from '@/utils/convertToImage'
```

Add below the `@/utils/convertToImage` import block:

```ts
import AsciiExportModal from '@/components/AsciiExportModal.vue'
import { buildMatrix } from '@/lib/qr-code'
```

- [ ] **Step 2: Add state and helpers**

Locate the line `const exportFilename = ref('qr-code')` (around line 731). Below it add:

```ts
const isAsciiExportModalOpen = ref(false)
const asciiMatrix = computed<boolean[][]>(() => {
  if (!data.value) return []
  try {
    return buildMatrix(data.value, errorCorrectionLevel.value).matrix
  } catch (err) {
    console.error('Failed to build matrix for ASCII export:', err)
    return []
  }
})
function openAsciiExportModal() {
  isAsciiExportModalOpen.value = true
}
```

If `computed` is not already imported from `'vue'` at the top, extend the existing `vue` import accordingly.

- [ ] **Step 3: Add the ASCII button after the SVG button**

Locate the SVG button's closing `</button>` (around line 1343). Immediately after it (still inside the same export-buttons container), add:

```vue
                <button
                  id="download-qr-text-button"
                  class="button"
                  @click="openAsciiExportModal"
                  :disabled="isExportButtonDisabled"
                  :title="
                    isExportButtonDisabled
                      ? t('Please enter data to encode first')
                      : t('Export QR Code as ASCII or Unicode text')
                  "
                  :aria-label="t('Export QR Code as ASCII or Unicode text')"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <g fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                      <path d="M5 12V5a2 2 0 0 1 2-2h7l5 5v4" />
                      <text
                        x="1"
                        y="22"
                        fill="currentColor"
                        stroke="none"
                        font-size="11px"
                        font-family="monospace"
                        font-weight="600"
                      >
                        TXT
                      </text>
                    </g>
                  </svg>
                </button>
```

- [ ] **Step 4: Mount the modal**

Locate the existing `CopyImageModal` usage in the template (search for `CopyImageModal`). Immediately after the `CopyImageModal` mount, add:

```vue
    <AsciiExportModal
      :open="isAsciiExportModalOpen"
      :matrix="asciiMatrix"
      :has-frame="showFrame"
      :filename="exportFilename"
      :ec-level="errorCorrectionLevel"
      @close="isAsciiExportModalOpen = false"
    />
```

- [ ] **Step 5: Verify the project compiles**

Run: `pnpm type-check`
Expected: exits 0.

- [ ] **Step 6: Smoke test the dev server**

Run: `pnpm dev`
Open the app in a browser. With sample data entered, click the new TXT button. Verify:
- Modal opens with 3 cards showing the three formats.
- `.md` / `.txt` download triggers a file download.
- Copy button briefly shows "Copied".
- When "Add frame" is checked, the yellow warning banner appears.

Stop the dev server after smoke testing.

- [ ] **Step 7: Commit**

```bash
git add src/components/QRCodeCreate.vue
git commit -m "feat(ui): add ASCII text export button to single-mode export row (#208)"
```

---

## Task 13: Extend AsciiExportModal for batch mode

**Files:**
- Modify: `src/components/AsciiExportModal.vue`

- [ ] **Step 1: Import JSZip and helpers**

At the top of `<script setup>` in `src/components/AsciiExportModal.vue`, add:

```ts
import JSZip from 'jszip'
import { buildMatrix } from '@/lib/qr-code'
```

Also extend the existing `convertToText` import to add `getMarkdownText`:

```ts
import {
  copyAsciiTextToClipboard,
  downloadAsciiText,
  getAsciiText,
  getMarkdownText,
  type TextExportInput
} from '@/utils/convertToText'
```

(Currently the import already pulls `getAsciiText`, `downloadAsciiText`, `copyAsciiTextToClipboard`. Add `getMarkdownText`.)

- [ ] **Step 2: Add batch state and the batch download function**

Below the existing `copiedFormat` ref add:

```ts
const isBatchDownloading = ref(false)
const batchProgress = ref({ current: 0, total: 0 })

async function downloadBatchZip(format: AsciiFormat, wrap: 'md' | 'txt') {
  if (!props.isBatch || !props.batchRows || props.batchRows.length === 0) return
  isBatchDownloading.value = true
  batchProgress.value = { current: 0, total: props.batchRows.length }
  try {
    const zip = new JSZip()
    const used = new Set<string>()
    for (let i = 0; i < props.batchRows.length; i++) {
      batchProgress.value.current = i + 1
      const row = props.batchRows[i]
      let matrix: boolean[][]
      try {
        matrix = buildMatrix(row.data, props.ecLevel).matrix
      } catch (err) {
        console.error(`Skipping row ${i}: failed to build matrix`, err)
        continue
      }
      const body =
        wrap === 'md'
          ? getMarkdownText({ matrix, format })
          : getAsciiText({ matrix, format })
      let name = (row.fileName || `qr-${i}`).replace(/[^a-zA-Z0-9_-]/g, '_')
      let candidate = `${name}.${wrap}`
      let suffix = 1
      while (used.has(candidate)) {
        candidate = `${name}_${suffix}.${wrap}`
        suffix++
      }
      used.add(candidate)
      zip.file(candidate, body)
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `qr-codes-ascii-${format}.zip`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 200)
  } catch (err) {
    console.error('Batch ASCII export failed:', err)
  } finally {
    isBatchDownloading.value = false
    batchProgress.value = { current: 0, total: 0 }
  }
}
```

- [ ] **Step 3: Switch the per-card buttons in batch mode**

Replace the existing `<div class="mt-2 flex flex-wrap gap-2">` block inside each card with:

```vue
          <div class="mt-2 flex flex-wrap gap-2">
            <template v-if="!isBatch">
              <button class="button text-sm" @click="onDownload(card.id, 'md')">
                {{ t('Download .md') }}
              </button>
              <button class="button text-sm" @click="onDownload(card.id, 'txt')">
                {{ t('Download .txt') }}
              </button>
              <button class="button text-sm" @click="onCopy(card.id)">
                {{ copiedFormat === card.id ? t('Copied') : t('Copy to clipboard') }}
              </button>
            </template>
            <template v-else>
              <button
                class="button text-sm"
                :disabled="isBatchDownloading || !batchRows?.length"
                @click="downloadBatchZip(card.id, 'md')"
              >
                {{ t('Download all as .md') }}
              </button>
              <button
                class="button text-sm"
                :disabled="isBatchDownloading || !batchRows?.length"
                @click="downloadBatchZip(card.id, 'txt')"
              >
                {{ t('Download all as .txt') }}
              </button>
            </template>
          </div>
```

- [ ] **Step 4: Add a label above each preview in batch mode and a batch progress indicator**

Inside each card, just above the `<pre>`, add:

```vue
          <p v-if="isBatch" class="mb-1 text-xs text-zinc-500">
            {{ t('Preview of first row') }}
          </p>
```

And inside the `pre` interpolation, replace `{{ preview(card.id) }}` with `{{ batchPreview(card.id) }}`, which picks the first batch row in batch mode and falls back to the single-mode matrix otherwise.

Add this helper in `<script setup>` below the existing `preview` function:

```ts
function batchPreview(format: AsciiFormat): string {
  if (props.isBatch && props.batchRows && props.batchRows.length > 0) {
    try {
      const m = buildMatrix(props.batchRows[0].data, props.ecLevel).matrix
      return getAsciiText({ matrix: m, format })
    } catch {
      return ''
    }
  }
  return preview(format)
}
```

Below the closing `</div>` of the cards container (still inside the modal body), add a small progress indicator:

```vue
      <p v-if="isBatchDownloading" class="mt-3 text-sm text-zinc-500">
        {{ t('Generating') }} {{ batchProgress.current }} / {{ batchProgress.total }}…
      </p>
```

- [ ] **Step 5: Verify the project compiles**

Run: `pnpm type-check`
Expected: exits 0.

- [ ] **Step 6: Commit**

```bash
git add src/components/AsciiExportModal.vue
git commit -m "feat(components): add batch ZIP export to AsciiExportModal (#208)"
```

---

## Task 14: Wire batch rows into the modal from QRCodeCreate

**Files:**
- Modify: `src/components/QRCodeCreate.vue`

- [ ] **Step 1: Build a computed for batch rows**

In `src/components/QRCodeCreate.vue`, locate the lines defining `dataStringsFromCsv` and `fileNamesFromCsv` (look near the batch processing region; they are populated from `processCsvDataForBatch`). After the `asciiMatrix` computed from Task 12, add:

```ts
const asciiBatchRows = computed(() =>
  dataStringsFromCsv.value.map((data, i) => ({
    data,
    fileName: fileNamesFromCsv.value[i] ?? `qr-${i}`
  }))
)
```

- [ ] **Step 2: Pass `isBatch` and `batchRows` to the modal**

Find the `<AsciiExportModal />` mount added in Task 12 and replace its props with:

```vue
    <AsciiExportModal
      :open="isAsciiExportModalOpen"
      :matrix="asciiMatrix"
      :has-frame="showFrame"
      :filename="exportFilename"
      :is-batch="exportMode === ExportMode.Batch"
      :batch-rows="asciiBatchRows"
      :ec-level="errorCorrectionLevel"
      @close="isAsciiExportModalOpen = false"
    />
```

- [ ] **Step 3: Verify the project compiles**

Run: `pnpm type-check`
Expected: exits 0.

- [ ] **Step 4: Smoke test batch mode**

Run: `pnpm dev`. Switch to Batch export mode, upload `public/batch_export_templates/url_template.csv` (or any sample CSV), then click the TXT button. Verify each format's "Download all as .md / .txt" produces a ZIP containing one file per CSV row, named `<row>.md` / `<row>.txt`. Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add src/components/QRCodeCreate.vue
git commit -m "feat(ui): pass batch rows to AsciiExportModal for batch text export (#208)"
```

---

## Task 15: Add i18n keys

**Files:**
- Modify: `src/locales/en.json`

- [ ] **Step 1: Add the new keys**

Open `src/locales/en.json`. Add the following keys (preserve alphabetical order if the file is sorted; otherwise append at the end before the closing `}`):

```json
"Export QR Code as ASCII or Unicode text": "Export QR Code as ASCII or Unicode text",
"Export as text": "Export as text",
"ASCII": "ASCII",
"Unicode (half-blocks)": "Unicode (half-blocks)",
"Unicode (full-blocks)": "Unicode (full-blocks)",
"7-bit characters — works in plain text, email, and terminals.": "7-bit characters — works in plain text, email, and terminals.",
"Compact: two rows packed into one line using ▀ ▄ █ characters.": "Compact: two rows packed into one line using ▀ ▄ █ characters.",
"Solid block characters (██) — best fidelity in modern fonts.": "Solid block characters (██) — best fidelity in modern fonts.",
"Download .md": "Download .md",
"Download .txt": "Download .txt",
"Copy to clipboard": "Copy to clipboard",
"Copied": "Copied",
"Close": "Close",
"Frame label is excluded from text export — the ASCII output contains the QR modules only.": "Frame label is excluded from text export — the ASCII output contains the QR modules only.",
"Preview of first row": "Preview of first row",
"Download all as .md": "Download all as .md",
"Download all as .txt": "Download all as .txt",
"Generating": "Generating"
```

If any of these keys already exist (e.g., `"Close"`, `"Copied"`), skip the duplicate.

- [ ] **Step 2: Verify JSON validity**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/locales/en.json', 'utf8'))"`
Expected: exits 0 (no SyntaxError).

- [ ] **Step 3: Run the i18n sync check**

Run: `pnpm sync-i18n` (if available — otherwise skip).
Expected: reports the new keys.

- [ ] **Step 4: Commit**

```bash
git add src/locales/en.json
git commit -m "feat(i18n): add English keys for ASCII text export (#208)"
```

---

## Task 16: Storybook story for the converter

**Files:**
- Create: `src/lib/qr-code/stories/ascii-export.stories.ts`

- [ ] **Step 1: Create the story file**

Create `src/lib/qr-code/stories/ascii-export.stories.ts`:

```ts
import type { Meta, StoryObj } from '@storybook/vue3'
import { defineComponent, h, computed } from 'vue'
import { buildMatrix, qrMatrixToText, type AsciiFormat } from '..'

const AsciiPreview = defineComponent({
  name: 'AsciiPreview',
  props: {
    data: { type: String, default: 'https://github.com/lyqht/mini-qr' },
    format: { type: String as () => AsciiFormat, default: 'ascii' as AsciiFormat },
    quietZone: { type: Number, default: 2 }
  },
  setup(props) {
    const text = computed(() => {
      try {
        const m = buildMatrix(props.data, 'Q').matrix
        return qrMatrixToText(m, props.format, { quietZone: props.quietZone })
      } catch (e) {
        return String(e)
      }
    })
    return () =>
      h(
        'pre',
        {
          style:
            'font-family: monospace; line-height: 1; white-space: pre; padding: 12px; background: #f8f8f8; overflow: auto;'
        },
        text.value
      )
  }
})

const meta: Meta<typeof AsciiPreview> = {
  title: 'QR Lib / ASCII export',
  component: AsciiPreview,
  argTypes: {
    data: { control: 'text' },
    format: {
      control: 'select',
      options: ['ascii', 'unicode-half', 'unicode-full']
    },
    quietZone: { control: { type: 'number', min: 0, max: 6 } }
  },
  args: { data: 'https://github.com/lyqht/mini-qr', quietZone: 2 }
}
export default meta
type Story = StoryObj<typeof AsciiPreview>

export const Ascii: Story = { args: { format: 'ascii' } }
export const UnicodeHalf: Story = { args: { format: 'unicode-half' } }
export const UnicodeFull: Story = { args: { format: 'unicode-full' } }
```

- [ ] **Step 2: Verify Storybook builds**

Run: `pnpm build-storybook --quiet`
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/lib/qr-code/stories/ascii-export.stories.ts
git commit -m "docs(stories): add ASCII export Storybook stories (#208)"
```

---

## Task 17: Update README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add a Features bullet**

In `README.md`, locate the Features list (`## Features` section, around line 18). After the existing bullet for "🖼️ Export to PNG, JPG & SVG" (~line 24), add a new bullet:

```md
- 🔤 Export to ASCII / Unicode text: download as `.md` or `.txt`, or copy to clipboard. Available in single and batch modes.
```

- [ ] **Step 2: Verify the change**

Run: `git diff README.md`
Expected: a single inserted bullet under Features.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs(readme): note ASCII / Unicode text export feature (#208)"
```

---

## Task 18: Final verification

- [ ] **Step 1: Run all tests**

Run: `pnpm vitest run`
Expected: all tests pass, including the new `ascii-export.test.ts` and `convertToText.test.ts`.

- [ ] **Step 2: Run type-check**

Run: `pnpm type-check`
Expected: exits 0.

- [ ] **Step 3: Run lint**

Run: `pnpm lint`
Expected: exits 0 (or only fixes existing warnings).

- [ ] **Step 4: Final manual smoke**

Run: `pnpm dev`. Verify the full end-to-end flow in the browser:
1. Enter a URL → click TXT → modal opens with 3 previews → each `.md` / `.txt` / Copy works.
2. Toggle "Add frame" → warning banner appears at the top of the modal.
3. Switch to Batch mode → upload a CSV → click TXT → "Download all as .md" / ".txt" produce a ZIP per format with one file per row.

Stop the dev server.

- [ ] **Step 5: No commit (final verification only)**

If any issue surfaces in steps 1–4, fix it as an additional follow-up commit before opening the PR.
