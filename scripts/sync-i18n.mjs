#!/usr/bin/env node
/**
 * sync-i18n.mjs
 *
 * Scans the codebase for all translation strings used via t() / $t() and
 * adds any missing strings to locales/en.json.
 * Translation syncing (upload/pre-translate/download) is handled server-side
 * by the Crowdin GitHub integration.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, relative, extname } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = join(__dirname, '..')
const SRC_DIR = join(ROOT, 'src')
const EN_JSON_PATH = join(ROOT, 'locales', 'en.json')

// ANSI colours
const GREEN = '\x1b[0;32m'
const YELLOW = '\x1b[1;33m'
const RED = '\x1b[0;31m'
const NC = '\x1b[0m'

const log = (color, msg) => console.log(`${color}${msg}${NC}`)

// ---------------------------------------------------------------------------
// 1. Collect all source files
// ---------------------------------------------------------------------------
function walkDir(dir, exts, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      walkDir(full, exts, files)
    } else if (exts.includes(extname(entry))) {
      files.push(full)
    }
  }
  return files
}

// ---------------------------------------------------------------------------
// 2. Extract translation strings from a file's content
//
//    Matches:
//      t('some string')   t("some string")
//      $t('some string')  $t("some string")
//
//    Preceded by a non-identifier character to avoid false positives like
//    .split(',') or text.replace(...)
// ---------------------------------------------------------------------------
const T_REGEX = /(?<![a-zA-Z0-9_$])\$?t\s*\(\s*(['"])((?:(?!\1)(?:\\.|[^\\]))*)\1/g

function extractKeys(content) {
  const keys = new Set()
  let match
  T_REGEX.lastIndex = 0
  while ((match = T_REGEX.exec(content)) !== null) {
    const raw = match[2]
    // Unescape basic escape sequences
    const str = raw.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\')
    // Skip blank, whitespace-only, or single-character non-letter strings
    if (!str || str.trim().length === 0) continue
    if (str.length === 1 && !/[a-zA-Z]/.test(str)) continue
    // Skip strings that look like file extensions, CSS selectors, or code patterns
    if (/^[.#]/.test(str)) continue
    // Skip strings that are purely numeric or date format tokens without letters
    if (/^[^a-zA-Z]+$/.test(str) && !/[{}]/.test(str)) continue
    keys.add(str)
  }
  return keys
}

// ---------------------------------------------------------------------------
// 3. Scan src/ and collect all translation keys
// ---------------------------------------------------------------------------
log(YELLOW, '🔍 Scanning source files for translation strings...')

const sourceFiles = walkDir(SRC_DIR, ['.vue', '.ts', '.js'])
const foundKeys = new Set()

for (const file of sourceFiles) {
  const content = readFileSync(file, 'utf8')
  for (const key of extractKeys(content)) {
    foundKeys.add(key)
  }
}

log(GREEN, `✓ Found ${foundKeys.size} unique translation strings in source`)

// ---------------------------------------------------------------------------
// 4. Load en.json and find missing keys
// ---------------------------------------------------------------------------
const enJson = JSON.parse(readFileSync(EN_JSON_PATH, 'utf8'))
const existingKeys = new Set(Object.keys(enJson))

const missingKeys = [...foundKeys].filter((k) => !existingKeys.has(k))
const hasNewKeys = missingKeys.length > 0

if (!hasNewKeys) {
  log(GREEN, '✓ No new translation strings found — en.json is up to date')
} else {
  log(YELLOW, `📝 Adding ${missingKeys.length} new string(s) to en.json:`)
  for (const key of missingKeys) {
    log(YELLOW, `   + ${key}`)
    enJson[key] = key
  }

  // Write back with stable, sorted key order
  // Preserve language-code entries (key != value) at the top, then UI strings
  const langEntries = Object.entries(enJson).filter(([k, v]) => k !== v)
  const uiEntries = Object.entries(enJson)
    .filter(([k, v]) => k === v)
    .sort(([a], [b]) => a.localeCompare(b))

  const sorted = Object.fromEntries([...langEntries, ...uiEntries])
  writeFileSync(EN_JSON_PATH, JSON.stringify(sorted, null, 2) + '\n')
  log(GREEN, '✓ en.json updated')
}

// ---------------------------------------------------------------------------
// 5. Done — translations are synced by the Crowdin GitHub integration
// ---------------------------------------------------------------------------
if (hasNewKeys) {
  log(GREEN, `✅ Added ${missingKeys.length} new string(s) to locales/en.json.`)
  log(YELLOW, '   Commit & push to main — the Crowdin GitHub integration will')
  log(YELLOW, '   upload the new source strings and open a translations PR.')
} else {
  log(GREEN, '✅ en.json is already up to date — nothing to do.')
}
