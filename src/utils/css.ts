export function isValidCSSColor(value: string): boolean {
  return CSS.supports('color', value)
}

export function isValidCSSLength(value: string): boolean {
  return CSS.supports('width', value)
}
