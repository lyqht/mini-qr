/**
 * UTF-8 byte encoder for `qrcode-generator`'s `stringToBytesFuncs` hook.
 *
 * Why: the upstream library defaults to Latin-1, which silently corrupts
 * multibyte input (Vietnamese diacritics, CJK, Arabic, emoji). TextEncoder
 * is the browser/Node standard and handles surrogate pairs correctly.
 */
export const utf8StringToBytes = (s: string): number[] => {
  return Array.from(new TextEncoder().encode(s))
}
