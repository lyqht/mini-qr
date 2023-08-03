export const getNumericCSSValue = (cssProperty: string): number => {
  return Number(cssProperty.replace('px', ''))
}
