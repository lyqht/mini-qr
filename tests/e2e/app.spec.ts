import { test, expect } from '@playwright/test'

test('has title', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Mini QR/)
})

test('scans a QR code from file', async ({ page }) => {
  await page.goto('/')

  // Switch to Scan mode - select the first matching element (likely the desktop one)
  await page.getByLabel('Switch to Scan Mode').first().click()

  // Locate the hidden file input
  const fileInput = page.locator('input[type="file"][accept="image/*"]')

  // Set the input file using the fixture
  await fileInput.setInputFiles('tests/e2e/fixtures/test-qrcode.png')

  // Wait for the result text to appear
  await expect(page.getByText('Test QR Data')).toBeVisible()
})
