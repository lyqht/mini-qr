# Storybook previews on Vercel

The [`storybook-preview`](../.github/workflows/storybook-preview.yml) workflow
builds Storybook (`pnpm build-storybook` → `storybook-static/`) and deploys it
to a **dedicated** Vercel project, separate from the main app:

- **Pull requests** get an isolated preview URL, posted as a sticky PR comment
  and refreshed on every push to the branch.
- **Pushes to `main`** publish the production Storybook.

The main app keeps its own zero-config Vercel project. We deliberately do **not**
add a root `vercel.json` (it would be read by the app's project too) and we
upload Storybook as Vercel "prebuilt" static output, so the Storybook project
needs no build command of its own.

## One-time setup

1. **Create the Vercel project** (once):

   ```bash
   # from the repo root, on a checkout with storybook-static/ built
   pnpm build-storybook
   npx vercel link            # create/select a NEW project, e.g. "mini-qr-storybook"
   ```

   `vercel link` writes `.vercel/project.json` containing `orgId` and
   `projectId`. (`.vercel/` is already git-ignored — don't commit it.)

   > Leave **Git integration disabled** on this project (or don't connect a
   > repo). Deploys are driven entirely by the GitHub Action; connecting Git
   > would double-deploy.

2. **Create an access token**: Vercel → Settings → Tokens → _Create_.

3. **Add three repo secrets** (GitHub → Settings → Secrets and variables →
   Actions → _New repository secret_):

   | Secret              | Value                                   |
   | ------------------- | --------------------------------------- |
   | `VERCEL_TOKEN`      | the token from step 2                   |
   | `VERCEL_ORG_ID`     | `orgId` from `.vercel/project.json`     |
   | `VERCEL_PROJECT_ID` | `projectId` from `.vercel/project.json` |

That's it — the next PR that touches `src/**`, `.storybook/**`, or the
lockfile will get a Storybook preview comment.

## Notes

- Fork PRs are skipped (secrets aren't available to forks), matching standard
  GitHub Actions behaviour.
- The workflow runs only when Storybook-relevant paths change (see the
  `paths:` filter) to avoid deploying on unrelated PRs.
- To preview locally instead: `pnpm storybook`.
