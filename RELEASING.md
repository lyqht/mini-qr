# Releasing mini-qr

Releases are automated with [release-please](https://github.com/googleapis/release-please).
Cutting a release is two PR merges — no manual tagging, changelog editing, or Crowdin CLI runs.

## How it works

1. **Develop with [Conventional Commits](https://www.conventionalcommits.org/).**
   Commit/PR titles like `feat: …`, `fix: …`, `perf: …` drive the version bump and changelog.
   When squash-merging a PR, make the **PR title** conventional.

2. **Translations (automatic).**
   When `locales/en.json` changes on `main`, two automations kick in:
   - **DeepL gap-fill** (`.github/workflows/deepl-translate.yml`) translates missing / empty /
     untranslated keys in each DeepL-supported `locales/*.json` and opens a
     **"chore(i18n): DeepL translations" PR**. It only fills gaps — it never overwrites a value
     that already differs from English. The ~16 languages DeepL doesn't support are skipped and
     left for Crowdin contributors.
   - **Crowdin GitHub integration** syncs the source to Crowdin so the community can refine the
     translations; their edits flow back as a **"New Crowdin translations" PR**.

   Review and merge whichever PRs appear. The two converge without conflict: a Crowdin PR
   overwrites a key with the human translation, and DeepL never re-touches a value that already
   differs from English. (Run `pnpm sync-i18n` locally to discover new `t()` strings and add
   them to `en.json` before pushing; run `pnpm translate:deepl` locally with `DEEPL_API_KEY`
   set if you want to fill translations by hand.)

3. **Release PR (automatic).**
   release-please keeps an open PR titled like `chore(main): release 0.31.0`. It accumulates
   the version bump (`package.json`) and the changelog (`public/CHANGELOG.md`) from the
   conventional commits since the last release.

4. **Cut the release.**
   Merge the release PR. release-please then creates the `vX.Y.Z` git tag and GitHub Release.
   That release event triggers `docker.yml`, which builds and pushes the versioned image.
   Vercel redeploys from `main`, picking up the new `public/CHANGELOG.md`.

## The public changelog

`public/CHANGELOG.md` is served in-app (footer + mobile menu). release-please owns it now and
prepends new versions on top. Entries at **v0.30.2 and earlier** are preserved in their
original `- ✨ …` per-line format; new entries use per-section emoji headers
(`### ✨ Features`, etc.). This format seam is expected.

## One-time setup

These must be configured once for the automation to work end-to-end:

- **`RELEASE_PLEASE_TOKEN` repo secret** — a Personal Access Token used by the release-please
  workflow. Required so the GitHub Release it creates triggers `docker.yml`'s
  `release: published` job. A release made with the default `GITHUB_TOKEN` would NOT trigger
  downstream workflows. Create a fine-grained PAT scoped to this repo with **Contents:
  Read/write** and **Pull requests: Read/write**, then add it under
  Settings → Secrets and variables → Actions as `RELEASE_PLEASE_TOKEN`.
- **`DEEPL_API_KEY` repo secret** — a [DeepL API Free](https://www.deepl.com/pro-api) key
  (free tier: 500k chars/month; the key ends with `:fx`). Add it under
  Settings → Secrets and variables → Actions as `DEEPL_API_KEY`. Used by `deepl-translate.yml`.
- **Allow GitHub Actions to create pull requests** — Settings → Actions → General → Workflow
  permissions → enable *"Allow GitHub Actions to create and approve pull requests"*. The DeepL
  workflow opens its PR using the default `GITHUB_TOKEN`, which needs this toggle.
- **Crowdin GitHub app** — install it on the repo and connect it to Crowdin project `776450`
  (source `locales/en.json` → `locales/%two_letters_code%.json` on `main`). Pre-translation is
  now handled by DeepL, so Crowdin's own pre-translate is optional. **Important:** configure
  Crowdin's import settings to **not overwrite existing translations**, so the DeepL baseline
  and community refinements don't clobber each other.
- **Crowdin CLI token (local, optional)** — the Crowdin CLI config (`crowdin.yml`) reads its
  token from the `CROWDIN_PERSONAL_TOKEN` environment variable; it is never stored in the repo.
  Only needed if you run the Crowdin CLI by hand — the GitHub integration does not need it.

## Versioning

Pre-1.0 (`0.x`): `feat` bumps the minor (`0.30.x` → `0.31.0`), `fix`/`perf`/`chore` bump the
patch. Configured via `bump-minor-pre-major` in `release-please-config.json`.
