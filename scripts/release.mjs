#!/usr/bin/env node
// Prepares a release: works out the next version from the latest v* tag,
// writes the entry for public/CHANGELOG.md from the commits since that tag and
// bumps package.json. Used by .github/workflows/release.yml.
//
//   node scripts/release.mjs <patch|minor|major|X.Y.Z> [--dry-run]
//
// --dry-run prints the entry without touching any file.

import { execFileSync } from 'node:child_process'
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const CHANGELOG_PATH = 'public/CHANGELOG.md'
const PACKAGE_JSON_PATH = 'package.json'
const SEMVER = /^v?(\d+)\.(\d+)\.(\d+)$/

// Order matches the existing changelog: features first, then fixes.
const EMOJI_ORDER = ['✨', '🐛', '⚡', '♻️', '🔧']
const TYPE_EMOJI = { feat: '✨', fix: '🐛', perf: '⚡', refactor: '♻️' }

// Commits that never belong in the user-facing changelog.
const SKIPPED_SUBJECTS = [
  /^chore\(release\)/i, // the release commit itself
  /^chore\(i18n\)/i, // DeepL / Crowdin translation PRs
  /^chore\(deps(-dev)?\): bump /i, // Dependabot
  /^test(\(.*\))?!?:/i,
  /^docs: add @\S+ as a contributor/i // all-contributors bot
]

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim()
}

export function latestTag() {
  const tags = git('tag', '--list', 'v*', '--sort=-v:refname').split('\n')
  const tag = tags.find((t) => SEMVER.test(t))
  if (!tag) throw new Error('No vX.Y.Z tag found')
  return tag
}

export function nextVersion(current, bump) {
  const explicit = bump.match(SEMVER)
  if (explicit) return `${explicit[1]}.${explicit[2]}.${explicit[3]}`

  const [, major, minor, patch] = current.match(SEMVER).map(Number)
  if (bump === 'major') return `${major + 1}.0.0`
  if (bump === 'minor') return `${major}.${minor + 1}.0`
  if (bump === 'patch') return `${major}.${minor}.${patch + 1}`
  throw new Error(`Unknown bump "${bump}", expected patch, minor, major or X.Y.Z`)
}

function onlyTouchesGithubDir(hash) {
  const files = git('show', '--pretty=format:', '--name-only', hash)
    .split('\n')
    .filter(Boolean)
  return files.length > 0 && files.every((f) => f.startsWith('.github/'))
}

// Turns a squash-merge subject into a changelog line, or null to skip it.
export function toChangelogLine(subject, repoUrl) {
  const prMatch = subject.match(/ \(#(\d+)\)$/)
  if (!prMatch) return null // direct pushes to main, e.g. "update version"
  if (SKIPPED_SUBJECTS.some((re) => re.test(subject))) return null

  const pr = prMatch[1]
  let title = subject.slice(0, prMatch.index)
  let emoji = '🔧'

  const conventional = title.match(/^(\w+)(\([^)]*\))?!?:\s*(.+)$/)
  if (conventional) {
    emoji = TYPE_EMOJI[conventional[1].toLowerCase()] ?? '🔧'
    title = conventional[3]
  } else if (/^(add|adds|added|introduce|support|implement)\b/i.test(title)) {
    emoji = '✨'
  } else if (/^(fix|fixes|fixed)\b/i.test(title)) {
    emoji = '🐛'
  }

  title = title.charAt(0).toUpperCase() + title.slice(1)
  return { emoji, text: `- ${emoji} ${title} ([#${pr}](${repoUrl}/pull/${pr}))` }
}

export function buildEntry({ from, to = 'HEAD', version, date, repoUrl }) {
  const log = git('log', '--no-merges', '--format=%H%x1f%s', `${from}..${to}`)
  const lines = log
    .split('\n')
    .filter(Boolean)
    .map((row) => row.split('\x1f'))
    .filter(([hash]) => !onlyTouchesGithubDir(hash))
    .map(([, subject]) => toChangelogLine(subject, repoUrl))
    .filter(Boolean)
    .sort((a, b) => EMOJI_ORDER.indexOf(a.emoji) - EMOJI_ORDER.indexOf(b.emoji))
    .map((line) => line.text)

  if (lines.length === 0) lines.push('- 🔧 Maintenance and internal improvements')
  return `## v${version} (${date})\n${lines.join('\n')}\n`
}

function today() {
  // en-CA formats as YYYY-MM-DD in the runner's TZ (the workflow sets it).
  return new Date().toLocaleDateString('en-CA')
}

function setOutput(name, value) {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`)
}

function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const bump = args.find((a) => !a.startsWith('--')) ?? 'minor'
  const repoUrl = `https://github.com/${process.env.GITHUB_REPOSITORY ?? 'lyqht/mini-qr'}`

  const previousTag = latestTag()
  const version = nextVersion(previousTag, bump)
  const tag = `v${version}`

  if (git('tag', '--list', tag)) throw new Error(`Tag ${tag} already exists`)

  const entry = buildEntry({ from: previousTag, version, date: today(), repoUrl })

  if (!dryRun) {
    const pkg = readFileSync(PACKAGE_JSON_PATH, 'utf8')
    writeFileSync(PACKAGE_JSON_PATH, pkg.replace(/"version": "[^"]+"/, `"version": "${version}"`))
    const changelog = readFileSync(CHANGELOG_PATH, 'utf8')
    writeFileSync(CHANGELOG_PATH, `${entry}\n${changelog}`)
  }

  setOutput('version', version)
  setOutput('tag', tag)
  setOutput('previous_tag', previousTag)

  const summary = `### ${dryRun ? 'Dry run: ' : ''}${previousTag} → ${tag}\n\n${entry}`
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary)
  console.log(summary)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main()
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}
