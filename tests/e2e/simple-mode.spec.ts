import { test, expect, type Page } from '@playwright/test'

/**
 * Simple Mode lets users collapse the configuration UI down to just the data
 * field, then opt specific fields back in via the "Customize fields" panel.
 * The chosen mode and pinned fields persist across reloads via localStorage.
 */
test.describe('Simple Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Start each test from a clean slate so a previously persisted mode does
    // not leak between tests sharing a browser context.
    await page.evaluate(() => {
      localStorage.removeItem('qrViewMode')
      localStorage.removeItem('qrSimpleFields')
    })
    await page.reload()
  })

  const simpleToggle = (page: Page) => page.locator('#view-mode-simple')
  const fullToggle = (page: Page) => page.locator('#view-mode-full')

  test('defaults to full mode showing all settings', async ({ page }) => {
    await expect(fullToggle(page)).toHaveAttribute('aria-checked', 'true')
    await expect(simpleToggle(page)).toHaveAttribute('aria-checked', 'false')
    await expect(page.locator('#dots-color')).toBeVisible()
    await expect(page.locator('#width')).toBeVisible()
  })

  test('simple mode hides styling fields but keeps the QR section header', async ({ page }) => {
    await simpleToggle(page).click()

    await expect(simpleToggle(page)).toHaveAttribute('aria-checked', 'true')
    // Data input and export controls remain available.
    await expect(page.locator('#data')).toBeVisible()
    await expect(page.locator('#copy-qr-image-button')).toBeVisible()
    // Styling controls are hidden.
    await expect(page.locator('#dots-color')).toBeHidden()
    await expect(page.locator('#width')).toBeHidden()
    // The QR code settings section (which always holds the data field) keeps
    // its header; the frame section is hidden until a frame field is shown.
    await expect(page.getByRole('button', { name: /qr code settings/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /frame settings/i })).toBeHidden()
  })

  test('shows both section headers when each group has a visible field', async ({ page }) => {
    await simpleToggle(page).click()
    await page.locator('#customize-fields-button').click()
    await page.getByRole('checkbox', { name: 'Dots color' }).check()
    await page.getByRole('checkbox', { name: 'Add frame' }).check()
    await page.getByRole('checkbox', { name: 'Frame preset' }).check()
    await page.getByRole('button', { name: 'Done' }).click()

    await expect(page.getByRole('button', { name: /qr code settings/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /frame settings/i })).toBeVisible()
  })

  test('customize panel surfaces a chosen field and persists across reload', async ({ page }) => {
    await simpleToggle(page).click()
    await expect(page.locator('#dots-color')).toBeHidden()

    await page.locator('#customize-fields-button').click()
    const dotsColorCheckbox = page.getByRole('checkbox', { name: 'Dots color' })
    await expect(dotsColorCheckbox).toBeVisible()
    await dotsColorCheckbox.check()

    // Close the panel and confirm the field is now shown.
    await page.getByRole('button', { name: 'Done' }).click()
    await expect(page.locator('#dots-color')).toBeVisible()
    // A field that was not pinned stays hidden.
    await expect(page.locator('#width')).toBeHidden()

    // Persisted: reloading keeps simple mode with the pinned field shown.
    await page.reload()
    await expect(simpleToggle(page)).toHaveAttribute('aria-checked', 'true')
    await expect(page.locator('#dots-color')).toBeVisible()
    await expect(page.locator('#width')).toBeHidden()
  })

  test('frame group reveals its sub-fields only after Add frame is enabled', async ({ page }) => {
    await simpleToggle(page).click()
    await page.locator('#customize-fields-button').click()

    // Frame sub-fields are hidden until "Add frame" is enabled in the panel.
    await expect(page.getByRole('checkbox', { name: 'Frame preset' })).toBeHidden()
    await page.getByRole('checkbox', { name: 'Add frame' }).check()
    await expect(page.getByRole('checkbox', { name: 'Frame preset' })).toBeVisible()

    // Pin a single frame sub-field, then confirm only it shows in the column.
    await page.getByRole('checkbox', { name: 'Caption', exact: true }).check()
    await page.getByRole('button', { name: 'Done' }).click()

    // Enabling the frame in the panel also enabled it on the QR code.
    await expect(page.locator('#show-frame')).toBeChecked()
    await expect(page.locator('#frame-text')).toBeVisible()
    // A frame field that was not pinned stays hidden.
    await expect(page.locator('#frame-text-color')).toBeHidden()
  })

  test('reset to data only clears pinned fields', async ({ page }) => {
    await simpleToggle(page).click()
    await page.locator('#customize-fields-button').click()
    await page.getByRole('checkbox', { name: 'Dots color' }).check()
    await page.getByRole('button', { name: 'Done' }).click()
    await expect(page.locator('#dots-color')).toBeVisible()

    await page.locator('#customize-fields-button').click()
    await page.getByRole('button', { name: 'Reset to data only' }).click()
    await page.getByRole('button', { name: 'Done' }).click()
    await expect(page.locator('#dots-color')).toBeHidden()
  })

  test('reset to data only also removes the frame section', async ({ page }) => {
    await simpleToggle(page).click()
    await page.locator('#customize-fields-button').click()
    await page.getByRole('checkbox', { name: 'Add frame' }).check()
    await page.getByRole('checkbox', { name: 'Caption', exact: true }).check()
    await page.getByRole('button', { name: 'Done' }).click()
    // Frame section is showing now.
    await expect(page.getByRole('button', { name: /frame settings/i })).toBeVisible()
    await expect(page.locator('#show-frame')).toBeVisible()

    await page.locator('#customize-fields-button').click()
    await page.getByRole('button', { name: 'Reset to data only' }).click()
    await page.getByRole('button', { name: 'Done' }).click()
    // After reset the frame is disabled and its section is gone from Simple mode.
    await expect(page.getByRole('button', { name: /frame settings/i })).toBeHidden()
    await expect(page.locator('#show-frame')).toBeHidden()
  })

  test('switching back to full mode restores all settings', async ({ page }) => {
    await simpleToggle(page).click()
    await expect(page.locator('#width')).toBeHidden()

    await fullToggle(page).click()
    await expect(fullToggle(page)).toHaveAttribute('aria-checked', 'true')
    await expect(page.locator('#dots-color')).toBeVisible()
    await expect(page.locator('#width')).toBeVisible()
  })
})
