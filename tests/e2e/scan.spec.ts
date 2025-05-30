import { test, expect } from '@playwright/test'

test('scans a QR code from file', async ({ page }) => {
  await page.goto('/')

  const desktopScanButton = page.locator(
    'div.md\\:flex >> button[aria-label*="Switch to Scan Mode"]'
  )
  const genericScanButton = page.getByLabel(/Switch to Scan Mode/i).first()

  if ((await desktopScanButton.count()) > 0 && (await desktopScanButton.isVisible())) {
    await desktopScanButton.click()
  } else if ((await genericScanButton.count()) > 0 && (await genericScanButton.isVisible())) {
    await genericScanButton.click()
  } else {
    console.error("Could not find a visible 'Switch to Scan Mode' button.")
    await page.screenshot({
      path: 'test-results/scan-test-scan-button-not-found.png',
      fullPage: true
    })
    throw new Error('Scan mode button not found or not visible.')
  }

  const fileInput = page.locator('input[type="file"]')

  try {
    await expect(fileInput).toHaveCount(1, { timeout: 10000 }) // Check it exists
  } catch (error) {
    console.error(
      'QR code file input (\'input[type="file"]\') not found or more than one instance exists after switching to Scan mode.'
    )
    await page.screenshot({
      path: 'test-results/scan-test-qr-file-input-not-found.png',
      fullPage: true
    })
    throw error
  }

  await fileInput.setInputFiles('tests/e2e/fixtures/test-qrcode.png')

  await expect(page.getByText('Test QR Data')).toBeVisible({ timeout: 10000 })
})
