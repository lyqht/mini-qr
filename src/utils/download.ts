/**
 * Triggers a browser download of `blob` as `filename` by creating a temporary
 * anchor element. The object URL is revoked after 200ms so the click has time
 * to fire before the browser drops the source.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 200)
}
