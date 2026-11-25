# Storybook previews on Vercel

Storybook is deployed by Vercel's Git integration to a **dedicated** Vercel
project, `mini-qr-storybook`, separate from the main app's `mini-qr` project:

- **Pull requests** get a preview deployment, listed in the Vercel bot's PR
  comment next to the app preview.
- **Pushes to `main`** publish the production Storybook at
  [mini-qr-storybook.vercel.app](https://mini-qr-storybook.vercel.app).

No GitHub Actions workflow or repo secret is involved.

## Project settings

These live in the Vercel dashboard (Project → Settings), not in the repo. We
deliberately don't add a root `vercel.json`, because the app's project would
read it too.

| Setting            | Value                                                                       |
| ------------------ | --------------------------------------------------------------------------- |
| Framework preset   | Storybook                                                                   |
| Install command    | `pnpm install`                                                              |
| Build command      | `pnpm build-storybook`                                                      |
| Output directory   | `storybook-static`                                                          |
| Node.js version    | 24.x                                                                        |
| Ignored build step | `git diff --quiet HEAD^ HEAD -- src .storybook package.json pnpm-lock.yaml` |
| Connected Git repo | `lyqht/mini-qr`                                                             |

The ignored build step skips a deploy when a commit doesn't touch Storybook's
inputs. Vercel builds when the command exits non-zero, so a first deploy or a
missing parent commit still builds.

## Notes

- Fork PRs need a team member to authorize the deploy from the Vercel comment
  while Git fork protection is on (Vercel's default).
- Dependabot PRs deploy like any other branch; no secrets are needed.
- To preview locally instead: `pnpm storybook`.
