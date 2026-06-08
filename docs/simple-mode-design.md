# Simple Mode — Design

**Date:** 2026-06-08
**Component:** `src/components/QRCodeCreate.vue` (+ `src/utils/useQRCodeStorage.ts`, `locales/en.json`)

## Motivation

Users who repeatedly export QR codes with the same styling — changing only the
data field — are already happy with their settings and unlikely to reconfigure
them. For these users the full configuration UI is noise. Simple Mode collapses
the view down to just the data field (plus export controls and the live
preview), and lets the user selectively surface only the specific fields they
still want to tweak.

## Decisions (resolved during brainstorming)

- **Activation:** Manual toggle only. No auto-detection of repeated exports.
  A clearly visible `Simple | Full` control switches between modes.
- **Field selection:** A "Customize fields" panel in Simple Mode opens a
  grouped checklist of available fields to show/hide.
- **Granularity:** Individual fields (each control is independently
  selectable), not whole groups.
- **Simple Mode default:** Data input + live preview + export controls only.
  Everything else is hidden until the user pins it.
- **Persistence:** Mode and pinned-field selection survive a page refresh via
  `localStorage`, gated by the existing `isLocalStorageEnabled()` check. When
  local storage is disabled (`VITE_DISABLE_LOCAL_STORAGE=true`), the app falls
  back to Full mode on load — consistent with how the existing QR config
  restore already behaves.

## Architecture

### State (new)

Two persisted values, stored in `localStorage` under their own keys:

- `qrViewMode: 'simple' | 'full'` — default `'full'` (existing users see no
  change until they opt in).
- `qrSimpleFields: string[]` — field keys the user chose to surface in Simple
  Mode. Default `[]`.

Both are reactive `ref`s in `QRCodeCreate.vue`, initialized from storage on
setup and written back via `watch` (only when `isLocalStorageEnabled()`).

### Storage helpers (`src/utils/useQRCodeStorage.ts`)

Add, alongside the existing config helpers, with the same gating and
try/catch-on-parse robustness:

```ts
export const QR_VIEW_MODE_STORAGE_KEY = 'qrViewMode'
export const QR_SIMPLE_FIELDS_STORAGE_KEY = 'qrSimpleFields'

export type QRViewMode = 'simple' | 'full'

export function saveViewMode(mode: QRViewMode): void
export function loadViewMode(): QRViewMode | null      // validates 'simple' | 'full'
export function saveSimpleFields(keys: string[]): void
export function loadSimpleFields(): string[]           // returns [] on missing/invalid
```

`loadSimpleFields` filters its result against the known field-key registry so a
stale/renamed key in storage can never surface a non-existent control.

### Field registry (new, in `QRCodeCreate.vue` or a small sibling module)

A single source-of-truth array describing every individually-selectable
control. The **data field is special-cased as always-visible** and is NOT in
the registry.

```ts
interface SimpleField { key: string; labelKey: string; group: FieldGroup }
```

The checklist is grouped into the two sections that mirror the configuration
accordion — **QR code settings** and **Frame settings** — so the panel matches
the layout users already know.

| Group            | Fields (key → control)                                                                                                                                                                                                              |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| QR code settings | `preset`, `logoImage`, `logoBackground`, `backgroundColor`, `dotsColor`, `cornersSquareColor`, `cornersDotColor`, `width`, `height`, `borderRadius`, `margin`, `imageMargin`, `imageSize`, `dotsType`, `cornersSquareType`, `cornersDotType`, `errorCorrectionLevel` |
| Frame settings   | `framePreset`, `frameText`, `framePosition`, `frameWidth`, `frameTextColor`, `frameBackground`, `frameBorderColor`, `frameBorderWidth`, `frameBorderRadius`, `framePadding`, `frameFontFamily`                                       |

> The **Frame settings** group mirrors the real frame UI: it is gated by an
> `enableToggleLabelKey` ("Add frame"). In the customize panel the frame
> sub-field checkboxes only appear once "Add frame" is enabled, and that toggle
> is bound to the real `showFrame` state (`v-model:frameEnabled`) — so enabling
> it in the panel enables the frame on the QR code, exactly like the in-column
> control. Each frame sub-field then gates its own control in the column, the
> same way the QR fields do.
>
> Because Simple Mode force-expands the accordion sections, `AccordionContent`
> gains a `rootClass` escape hatch and is given `!overflow-visible` in Simple
> Mode so a force-expanded section can never clip its (dynamically growing)
> content — e.g. the frame controls revealed after enabling "Add frame".

### Visibility gate

```ts
function isFieldVisible(key: string): boolean {
  return viewMode.value === 'full' || simpleFields.value.includes(key)
}
```

Every existing control block in the template is wrapped with
`v-show="isFieldVisible('<key>')"`. This is **additive** — no markup is moved or
duplicated, so Full Mode renders exactly as it does today.

The data input block has no gate (always shown).

### Accordion behavior

Both modes keep the section headers (`Frame settings`, `QR code settings`) so
the two groups stay visually distinct.

- **Full mode:** unchanged — both sections shown, QR settings open by default.
- **Simple mode:** the **QR code settings** section is always shown (it holds
  the always-visible data field); the **Frame settings** section is shown only
  when at least one frame field is pinned or the frame is enabled. Sections
  start expanded. Because they are force-expanded, `AccordionContent` is given
  `!overflow-visible` so a section can never clip its (dynamically growing)
  content.

### Toggle placement

A segmented `Simple | Full` control pinned at the **top of the `#settings`
column**. On desktop this sits above the accordion in the settings column; on
mobile the settings column stacks below the preview/export area, so the same
control remains reachable. Uses the existing button styling for visual
consistency.

### Customize panel

In Simple Mode only, a **"Customize fields"** button sits next to the toggle.
It opens:

- **Desktop:** `Dialog` (from `components/ui/dialog`).
- **Mobile:** `Drawer` (from `components/ui/drawer`).

(The `isLarge` media query already in the component selects which.)

Contents: the registry rendered as a grouped checklist. Each checkbox reflects
membership in `qrSimpleFields`; toggling it adds/removes the key and the control
appears/disappears live in the column behind the panel. A **"Reset to data
only"** action clears `qrSimpleFields`.

## Data flow

1. On setup: `viewMode` ← `loadViewMode() ?? 'full'`; `simpleFields` ←
   `loadSimpleFields()`.
2. Toggle click → sets `viewMode`; `watch` persists it.
3. Customize checkbox → mutates `simpleFields`; `watch` persists it.
4. Template controls read `isFieldVisible(key)` / `groupHasVisibleFields(group)`
   reactively. Preview and export controls are outside the gate and always
   render.

## Error handling

- Invalid/corrupt storage values → treated as defaults (`'full'`, `[]`), via
  try/catch + validation in the loaders (mirrors `loadQRConfig`).
- Unknown field keys in stored `qrSimpleFields` are filtered out against the
  registry on load.
- Local storage disabled → loaders are not called / return defaults; nothing is
  written.

## Testing

**Unit (`useQRCodeStorage.test.ts`):**
- `saveViewMode`/`loadViewMode` round-trip; invalid value → `null`.
- `saveSimpleFields`/`loadSimpleFields` round-trip; unknown keys filtered;
  malformed JSON → `[]`.

**Unit (visibility logic):**
- `isFieldVisible` returns `true` for all keys in full mode.
- In simple mode returns `true` only for pinned keys; data field always shown.

**E2E (Playwright):**
- Default load shows Full mode with all settings.
- Switch to Simple → only data input visible in settings column; preview +
  export still present.
- Open Customize, pin `dotsColor` → control appears; reload page → still in
  Simple mode with `dotsColor` pinned (persistence).
- "Reset to data only" clears pinned fields.

## Risk control

Full Mode is the default and its markup/behavior is untouched apart from
additive `v-show` wrappers and hidden-by-default trigger chrome (only hidden in
simple mode). Existing users and the existing e2e suite remain unaffected.

## Out of scope

- Auto-detecting 3+ same-settings exports (explicitly deferred — manual toggle
  only).
- Reordering pinned fields.
- Per-field pinning from within Full Mode (selection happens via the Customize
  panel).
