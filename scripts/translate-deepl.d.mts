// Type declarations for the pure helpers exported by translate-deepl.mjs so
// they can be imported from TypeScript unit tests (src/utils/translateDeepl.test.ts).
// The runner (`main`) is intentionally not declared — only the testable pure surface.

/** Map of repo locale code (filename without .json) to DeepL `target_lang` code. */
export const LOCALE_TO_DEEPL: Record<string, string>

/** Locale codes treated as English variants and skipped by DeepL. */
export const ENGLISH_VARIANTS: Set<string>

/**
 * Returns the keys in `enJson` that need translation in `localeJson` — i.e. keys
 * that are absent, empty, or still identical to the English source. Keys whose
 * value already differs from English are never returned.
 */
export function findGapKeys(
  enJson: Record<string, string>,
  localeJson: Record<string, string>
): string[]

/** True iff every `{placeholder}` token in `source` also appears in `translated`. */
export function placeholdersPreserved(source: string, translated: string): boolean
