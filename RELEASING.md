# Releasing mini-qr

Releases are one click. Translations are automated separately (see below).

## Cutting a release

1. Open **Actions → Release → Run workflow** (on `main`).
2. Pick the bump. Pre-1.0 (`0.x`): a new feature bumps the **minor** (`0.33.x` → `0.34.0`), fixes
   and chores bump the **patch**.
3. Optional: tick **Dry run** to preview the changelog entry in the run summary without changing
   anything, then run it again unticked.

The workflow (`.github/workflows/release.yml`) then:

- works out the next version from the latest `vX.Y.Z` tag;
- writes the `public/CHANGELOG.md` entry from the PRs merged since that tag, and bumps
  `package.json` (`scripts/release.mjs`);
- commits `chore(release): vX.Y.Z` to `main`, tags `vX.Y.Z` and publishes the GitHub Release with
  generated notes (shaped by `.github/release.yml`, which leaves out bot PRs);
- builds and pushes the Docker image tagged `vX.Y.Z` and `release` by calling `docker.yml`.

Vercel redeploys from the release commit on `main`, so the in-app version badge and changelog
update with it.

### The in-app changelog

`public/CHANGELOG.md` is served in-app (footer + mobile menu), so it is the user-facing changelog.
Each line comes from a squash-merge subject ending in `(#123)`, with the emoji picked from the
title:

| Title starts with | Emoji |
| --- | --- |
| `feat:`, or no prefix and `Add` / `Introduce` / `Support` / `Implement` | ✨ |
| `fix:`, or no prefix and `Fix` | 🐛 |
| `perf:` | ⚡ |
| `refactor:` | ♻️ |
| anything else | 🔧 |

It leaves out commits without a PR number, translation (`chore(i18n)`), Dependabot bump and
all-contributors PRs, `test:` PRs, and PRs that only touch `.github/`. Conventional PR titles are
not required; a clearer title at squash-merge just gives a better line. If a line reads badly
after a release, edit `public/CHANGELOG.md` and push.

### Releasing by hand

Publishing a GitHub Release from the UI still works: `docker.yml`'s `release: published` job
builds the image. You then need to bump `package.json` and add the `public/CHANGELOG.md` entry
yourself.

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
