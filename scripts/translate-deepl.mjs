#!/usr/bin/env node
/**
 * translate-deepl.mjs
 *
 * Fills MISSING translations in locales/<lang>.json using the DeepL API.
 * - Never overwrites existing real translations.
 * - Skips locales not supported by DeepL (leaves them for Crowdin/human).
 * - Supports --dry-run (no writes) and --locale=<code> (restrict to specific locales).
 *
 * Run: DEEPL_API_KEY=<key> node scripts/translate-deepl.mjs [--dry-run] [--locale=de] [--locale=fr]
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = join(__dirname, '..')
const LOCALES_DIR = join(ROOT, 'locales')

// ANSI colours (match sync-i18n.mjs style)
const GREEN = '\x1b[0;32m'
const YELLOW = '\x1b[1;33m'
const RED = '\x1b[0;31m'
const CYAN = '\x1b[0;36m'
const NC = '\x1b[0m'

const log = (color, msg) => console.log(`${color}${msg}${NC}`)

// ---------------------------------------------------------------------------
// Pure exports — these are unit-tested and have NO side effects at import time
// ---------------------------------------------------------------------------

/**
 * Map of repo locale code (filename without .json) -> DeepL target_lang code.
 * Locales NOT in this map are skipped (left to human/Crowdin translation).
 * English-family locales are intentionally excluded.
 */
export const LOCALE_TO_DEEPL = {
  ar: 'AR',
  bg: 'BG',
  cs: 'CS',
  da: 'DA',
  de: 'DE',
  el: 'EL',
  es: 'ES',
  et: 'ET',
  fi: 'FI',
  fr: 'FR',
  hu: 'HU',
  id: 'ID',
  it: 'IT',
  ja: 'JA',
  ko: 'KO',
  lt: 'LT',
  lv: 'LV',
  nl: 'NL',
  pl: 'PL',
  ro: 'RO',
  ru: 'RU',
  sk: 'SK',
  sl: 'SL',
  sv: 'SV',
  tr: 'TR',
  uk: 'UK',
  nb: 'NB',
  no: 'NB',
  pt: 'PT-PT',
  'pt-PT': 'PT-PT',
  'pt-BR': 'PT-BR',
  zh: 'ZH',
  'zh-HANS': 'ZH',
}

export const ENGLISH_VARIANTS = new Set(['en', 'en-GB', 'en-US'])

// Tokens like {count}, {index} that must survive translation unchanged.
const PLACEHOLDER_RE = /\{[^}]+\}/g

/**
 * Returns the keys in enJson that are "gaps" in localeJson — i.e. need translation.
 * A gap is: key absent, value is empty string, or value still equals the English
 * source (untranslated copy). Keys whose value already differs from English are
 * NEVER returned (we never overwrite a real translation).
 */
export function findGapKeys(enJson, localeJson) {
  return Object.keys(enJson).filter((key) => {
    if (!(key in localeJson)) return true
    const v = localeJson[key]
    return v === '' || v === enJson[key]
  })
}

/**
 * True if every {placeholder} token in `source` also appears in `translated`.
 * Used to reject translations that mangled interpolation tokens.
 */
export function placeholdersPreserved(source, translated) {
  if (typeof translated !== 'string') return false
  const inSource = source.match(PLACEHOLDER_RE) || []
  return inSource.every((token) => translated.includes(token))
}

// ---------------------------------------------------------------------------
// Impure runner helpers
// ---------------------------------------------------------------------------

/**
 * Returns the appropriate DeepL API host based on the API key type.
 * Free keys end with ':fx'.
 */
function deeplHost(apiKey) {
  return apiKey.endsWith(':fx') ? 'https://api-free.deepl.com' : 'https://api.deepl.com'
}

/**
 * Translates an array of texts to the given DeepL target language.
 * Returns translated texts in the same order as input.
 * Throws on non-OK HTTP response.
 * @param {string} apiKey
 * @param {string[]} texts
 * @param {string} targetLang
 * @param {number} [attempt=0] — internal retry counter; at most one retry on 429
 */
async function translateBatch(apiKey, texts, targetLang, attempt = 0) {
  const url = `${deeplHost(apiKey)}/v2/translate`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 30_000)

  let response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: texts,
        target_lang: targetLang,
        source_lang: 'EN',
        preserve_formatting: true,
      }),
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timer)
  }

  if (response.status === 429 && attempt === 0) {
    const retryAfter = Number(response.headers.get('Retry-After')) || 5
    log(YELLOW, `  ⚠ DeepL rate-limited (429); retrying after ${retryAfter}s…`)
    await new Promise((r) => setTimeout(r, retryAfter * 1000))
    return translateBatch(apiKey, texts, targetLang, 1)
  }

  if (!response.ok) {
    const bodyText = await response.text()
    throw new Error(`DeepL API error ${response.status}: ${bodyText}`)
  }

  const data = await response.json()
  if (!Array.isArray(data?.translations) || data.translations.length !== texts.length) {
    throw new Error(
      `DeepL returned unexpected response: expected ${texts.length} translations, got ${data?.translations?.length}`,
    )
  }
  return data.translations.map((t) => t.text)
}

const BATCH_SIZE = 50

/**
 * Main entry point — reads locale files, finds gaps, translates, writes back.
 */
async function main() {
  const apiKey = process.env.DEEPL_API_KEY
  if (!apiKey) {
    console.error(
      `${RED}Error: DEEPL_API_KEY environment variable is not set.${NC}\n` +
        `Set it before running: DEEPL_API_KEY=<your-key> node scripts/translate-deepl.mjs`,
    )
    process.exit(1)
  }

  // Parse argv flags
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const localeFilter = new Set(
    args.filter((a) => a.startsWith('--locale=')).map((a) => a.replace('--locale=', '')),
  )

  if (dryRun) {
    log(YELLOW, '🔍 Dry-run mode — no files will be written')
  }

  // Load source (English) locale
  const enPath = join(LOCALES_DIR, 'en.json')
  const en = JSON.parse(readFileSync(enPath, 'utf8'))

  const localeFiles = readdirSync(LOCALES_DIR)
    .filter((f) => f.endsWith('.json') && f !== 'en.json')
    .sort()

  let totalFilled = 0
  let totalSkippedPlaceholder = 0
  const localeErrors = []

  for (const file of localeFiles) {
    const code = file.replace(/\.json$/, '')

    // Skip English variants
    if (ENGLISH_VARIANTS.has(code)) {
      log(CYAN, `⏭  skip ${code} (English variant)`)
      continue
    }

    // Skip locales not supported by DeepL
    if (!(code in LOCALE_TO_DEEPL)) {
      log(CYAN, `⏭  skip ${code} (not DeepL-supported)`)
      continue
    }

    // Skip if locale filter given and this code isn't in it
    if (localeFilter.size > 0 && !localeFilter.has(code)) {
      continue
    }

    try {
      const localePath = join(LOCALES_DIR, file)
      const locale = JSON.parse(readFileSync(localePath, 'utf8'))
      // Snapshot before mutation so we can classify absent vs previously-present keys
      const originalLocale = { ...locale }

      const gaps = findGapKeys(en, locale)
      if (gaps.length === 0) {
        log(GREEN, `✓ ${code}: up to date`)
        continue
      }

      const targetLang = LOCALE_TO_DEEPL[code]
      log(YELLOW, `🌐 ${code} (${targetLang}): translating ${gaps.length} gap(s)…`)

      const sourceTexts = gaps.map((k) => en[k])
      const translatedTexts = []

      for (let i = 0; i < sourceTexts.length; i += BATCH_SIZE) {
        const batchTexts = sourceTexts.slice(i, i + BATCH_SIZE)
        const batchTranslated = await translateBatch(apiKey, batchTexts, targetLang)
        translatedTexts.push(...batchTranslated)
      }

      let filled = 0
      let skippedPlaceholder = 0

      for (let i = 0; i < gaps.length; i++) {
        const key = gaps[i]
        const source = sourceTexts[i]
        const translated = translatedTexts[i]

        if (!placeholdersPreserved(source, translated)) {
          log(
            RED,
            `  ⚠ ${code}: placeholder mangle in "${key}" — source="${source}" translated="${translated}" — skipping`,
          )
          skippedPlaceholder++
          continue
        }

        locale[key] = translated
        filled++
      }

      totalFilled += filled
      totalSkippedPlaceholder += skippedPlaceholder

      const placeholderNote = skippedPlaceholder > 0 ? `, skipped ${skippedPlaceholder} (placeholder)` : ''
      const alreadyTranslated = Object.keys(en).length - gaps.length
      log(
        GREEN,
        `✓ ${code}: filled ${filled}${placeholderNote}, ${alreadyTranslated} already translated`,
      )

      if (filled === 0) {
        log(YELLOW, `  nothing new to write for ${file}`)
        continue
      }

      // Preserve key order: existing keys in their original order with updated values;
      // append keys that were absent (in en key order) at the end.
      // Use a Set for O(1) membership checks.
      const absentKeySet = new Set(gaps.filter((k) => !(k in originalLocale)))
      const orderedKeys = [
        ...Object.keys(originalLocale),
        ...Object.keys(en).filter((k) => absentKeySet.has(k)),
      ]

      const merged = {}
      for (const k of orderedKeys) {
        if (k in locale) {
          merged[k] = locale[k]
        }
      }

      if (!dryRun) {
        writeFileSync(localePath, JSON.stringify(merged, null, 2) + '\n')
      } else {
        log(YELLOW, `  [dry-run] would write ${file}`)
      }
    } catch (err) {
      log(RED, `✗ ${code}: failed — ${err.message}`)
      localeErrors.push(code)
    }
  }

  log(GREEN, `\n✅ Done — total filled: ${totalFilled}, skipped (placeholder): ${totalSkippedPlaceholder}`)

  if (localeErrors.length > 0) {
    log(RED, `\n✗ ${localeErrors.length} locale(s) failed: ${localeErrors.join(', ')}`)
    process.exit(1)
  }
}

// ---------------------------------------------------------------------------
// Entry-point guard — only run main() when executed directly, not when imported
// ---------------------------------------------------------------------------
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
