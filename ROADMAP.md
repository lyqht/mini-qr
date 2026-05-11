# MiniQR Roadmap

Forward-looking work tracked outside of the [open issues](https://github.com/lyqht/mini-qr/issues). Each item has a rough effort estimate and a pointer into the codebase so a contributor can pick it up. Items move off this list when they're shipped — check `git log` for the implementation details.

## Internal QR library: future phases

The internal renderer lives at [`src/lib/qr-code/`](src/lib/qr-code/). See [CONTRIBUTING.md → Internal QR library](CONTRIBUTING.md#internal-qr-library-architecture) for the architecture and the build-vs-vendor split.

### Publish the library to npm — [#242](https://github.com/lyqht/mini-qr/issues/242)

**Effort: ~1 day.**

So consumers can `npm install @lyqht/mini-qr-lib` and pull in the renderer without the Vue app. Needs:

- A `vite.lib.config.ts` with `build.lib` mode targeting `src/lib/qr-code/index.ts`, dual ESM + CJS output
- `package.json#exports` + `types` pointing at the bundled `.d.ts`
- A dedicated `README` aimed at npm consumers (separate from the app README), with the `createQRCode` API surface and one minimal usage example
- A `prepublishOnly` script that runs vitest, type-check, and `vite build`
- CI release workflow (optional — can ship manually first)

The library is already DOM-agnostic except for `createQRCode` (which calls `DOMParser`) and `render/canvas.ts` (which uses `Image` + `<canvas>`). Pure SVG-string output (`buildSvgExportString`, `renderQrFragment`) is already SSR-safe.

### Custom QR shapes — circle / triangle / heart / arbitrary path — [#257](https://github.com/lyqht/mini-qr/issues/257)

**Effort: 3–4 days for the polished version.**

QR codes are mandatorily square at the spec level (three finder patterns at the corners), so this is a *visual* shape mask, not a re-shaped matrix.

- Add a `shapeMask` field to `QRCodeConfig`: `'circle' | 'rounded-square' | 'heart' | 'triangle' | 'star' | { svgPath: string }`
- Built-in shape SVG path definitions live under `render/shapes.ts` (new file)
- Plumb the mask through `render/svg.ts` either as a `<clipPath>` wrapping the QR fragment (simplest, half-clipped edges) or — preferred — by extending the existing `hideCell(r, c)` predicate in `render/dots.ts` so cells whose centre falls outside the shape are skipped entirely (clean edges, smaller paths)
- **Scannability guard**: hiding cells eats into error-correction budget. A circle inscribed in the square hides ~21 % of cells; at EC level H (~30 % tolerance) it scans, at L it doesn't. Auto-bump EC to H when a shape mask is set, or compute the fraction of dark modules hidden and refuse / warn if it exceeds the level's capacity (reuse the `EC_FACTOR` table from `render/image.ts`)
- Storybook stories under `src/lib/qr-code/stories/shape-mask.stories.ts`, one per built-in shape plus a custom-path example
- Playwright e2e: scan-back round-trip per shape to lock in the scannability floor

**Out of scope:** generating multiple candidate matrices with different masks and picking the one that *looks* best under the shape (what the very fanciest commercial QR vendors do — at least a week of work on its own).

### Migrate `QRCodeFrame.vue` to the library's frame primitive

**Effort: 1–2 days.**

The Vue `QRCodeFrame.vue` component still renders the in-app preview via Tailwind/flexbox. The library's frame primitive ([`src/lib/qr-code/frame.ts`](src/lib/qr-code/frame.ts)) is already used for SVG / PNG / JPG exports. Replacing the Vue component's internals with the lib primitive would:

- Eliminate a per-frame visual delta between preview and export
- Reduce the surface that has to be kept in sync when frame fields change
- Make the Vue component a thin shim, the same way `StyledQRCode.vue` is

Risks: the in-app preview is currently text-laid-out by the browser (real font metrics), while the lib primitive uses a `chars × 0.6 × fontSize` width heuristic. Replacing one with the other will shift visible padding slightly; expect to re-baseline the preview Playwright snapshots.

## Want to suggest something?

Open an issue at [lyqht/mini-qr/issues](https://github.com/lyqht/mini-qr/issues) and tag it `enhancement`. If it's a roadmap-shaped item (not a small bug or single-PR feature), maintainers will move it onto this file after triage.
