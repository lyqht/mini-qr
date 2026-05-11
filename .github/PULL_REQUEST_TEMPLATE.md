<!--
Thanks for opening a pull request! Please fill in the sections below.
For first-time contributors, take a moment to skim CONTRIBUTING.md —
issue assignment, codebase overview, and translations are covered there.
-->

## Summary

<!-- 1–3 sentences. Why is this change happening? Closes #N where N is an issue number. -->

## Type of change

<!-- Tick all that apply. -->

- [ ] Bug fix (closes a reported issue)
- [ ] New feature (user-visible behaviour change)
- [ ] Refactor / internal change (no user-visible behaviour change)
- [ ] Documentation
- [ ] Translation
- [ ] New preset (see [Adding new presets](../CONTRIBUTING.md#adding-new-presets))
- [ ] Other:

## How was this tested?

<!--
Mention every check you ran locally. For UI changes, describe the manual
steps; for logic changes, link to the new vitest / playwright test that
covers it.
-->

- [ ] `pnpm vitest` passes
- [ ] `pnpm test:e2e` passes (or only the unrelated, pre-existing failures listed below)
- [ ] `pnpm type-check` produces no new errors
- [ ] `pnpm build` succeeds
- [ ] (UI changes) Verified in the dev server in light + dark mode

Pre-existing failures still present after this change:

<!-- List the test IDs / names that already failed on `main`. Otherwise write "none". -->

## Screenshots / recordings

<!-- For UI changes. Drag-and-drop here. Before / after is ideal. -->

## QR rendering changes (only if you touched `src/lib/qr-code/` or `convertToImage.ts`)

<!--
The internal QR library is sensitive — small changes to dot / corner /
finder rendering can break scannability. If your PR touches the lib:
-->

- [ ] Added or updated a Storybook story under `src/lib/qr-code/stories/` for the affected shape / mode
- [ ] Added or updated a vitest unit test (matrix / svg / dots / frame / canvas / legacy-adapter)
- [ ] If output bytes change, manually scanned the exported PNG with a phone QR scanner
- [ ] If output bytes change for UTF-8 / accented input, the parity test in `tests/e2e/create.spec.ts` still passes

## Anything else reviewers should know

<!-- Trade-offs, scope cuts, follow-up issues you've opened, etc. -->
