# Releasing mini-qr

Releases are cut manually. Translations are the only automated part.

## Cutting a release

1. **Pick the version.** Pre-1.0 (`0.x`), follow the usual convention: a new feature bumps the
   minor (`0.30.x` → `0.31.0`), fixes and chores bump the patch.

2. **Bump `package.json`** to the new version.

3. **Add the entry to `public/CHANGELOG.md`**, newest on top, matching the existing format:

   ```md
   ## v0.31.0 (2026-08-05)
   - ✨ Short description of the feature ([#123](https://github.com/lyqht/mini-qr/pull/123))
   - 🐛 Short description of the fix ([#124](https://github.com/lyqht/mini-qr/pull/124))
   ```

   This file is served in-app (footer + mobile menu), so it is the user-facing changelog.

4. **Merge the bump to `main`.**

5. **Tag and publish a GitHub Release** for `vX.Y.Z` (Releases → Draft a new release → create the
   tag on `main`). Publishing the release triggers `docker.yml`'s `release: published` job, which
   builds and pushes the versioned image to ghcr.io. Vercel redeploys from `main` and picks up the
   new `public/CHANGELOG.md`.

## Translations

These run on their own and are not tied to cutting a release.

- **DeepL gap-fill** (`.github/workflows/deepl-translate.yml`) — when `locales/en.json` changes on
  `main`, it translates missing / empty / untranslated keys in each DeepL-supported
  `locales/*.json` and opens a **"chore(i18n): DeepL translations" PR**. It only fills gaps — it
  never overwrites a value that already differs from English. The ~16 languages DeepL doesn't
  support are skipped and left for Crowdin contributors. Needs the **`DEEPL_API_KEY`** repo secret
  (a [DeepL API Free](https://www.deepl.com/pro-api) key, ending in `:fx`).

- **Crowdin sync** (`.github/workflows/crowdin-sync.yml`) — uploads sources and the repo's
  translations to Crowdin and downloads community edits back as a PR.

  > ⚠️ This workflow currently **fails on every run**. It passes `config: crowdin.yml`, but no
  > `crowdin.yml` has ever been committed to this repo, so the Crowdin CLI exits with
  > _"Configuration file doesn't exist"_. It also needs a **`CROWDIN_PERSONAL_TOKEN`** repo secret,
  > which is currently empty. Fix both — or delete the workflow — before relying on it.

Run `pnpm sync-i18n` locally to discover new `t()` strings and add them to `en.json` before
pushing; run `pnpm translate:deepl` locally with `DEEPL_API_KEY` set to fill translations by hand.

## One-time setup

- **Allow GitHub Actions to create pull requests** — Settings → Actions → General → Workflow
  permissions → enable _"Allow GitHub Actions to create and approve pull requests"_. The DeepL
  workflow opens its PR using the default `GITHUB_TOKEN`, which needs this toggle.
- **`DEEPL_API_KEY` repo secret** — see above.
- **`CROWDIN_PERSONAL_TOKEN` repo secret** — see above (only if the Crowdin workflow is revived).
