export function isPhoneNumber(value: string): boolean {
  const text = value.trim()
  if (/^tel:.+$/i.test(text)) return true
  if (!/^\+?[\d\s()-]+$/.test(text)) return false
  if (!text.startsWith('+') && !/[\s()-]/.test(text)) return false
  const digits = text.replace(/\D/g, '').length
  return digits >= 7 && digits <= 15
}
