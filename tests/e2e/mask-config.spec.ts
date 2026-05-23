import { test, expect, type Page } from '@playwright/test'
import path from 'path'
import fs from 'fs'
import os from 'os'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// Reviewable artifacts live under docs/screenshots/ and get committed.
const SCREENSHOT_DIR = path.resolve(__dirname, '../../docs/screenshots')
// Transient PNGs (the scan-back round-trip downloads) go to a temp dir so
// they don't pollute the committed screenshots folder.
const DOWNLOAD_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'mini-qr-mask-config-'))
const QR_DATA = 'https://github.com/lyqht/mini-qr'

const SHAPES = ['circle', 'rounded-square', 'triangle', 'heart', 'star'] as const

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
})

async function setData(page: Page, text: string) {
  const field = page.locator('#data')
  await field.fill(text)
  // The data field is debounced 500ms before the QR re-renders.
  await page.waitForTimeout(700)
}

async function openColorSettings(page: Page) {
  // The colour-settings accordion is open by default in the QR Settings section;
  // make sure the shape-mask select is in view.
  await page.locator('#shape-mask').scrollIntoViewIfNeeded()
}

async function downloadPng(page: Page, label: string): Promise<string> {
  const downloadPromise = page.waitForEvent('download')
  await page.locator('#download-qr-image-button-png').click()
  const download = await downloadPromise
  const dst = path.join(DOWNLOAD_DIR, `${label}-${download.suggestedFilename()}`)
  await download.saveAs(dst)
  return dst
}

async function scanBack(page: Page, pngPath: string, expected: string) {
  // Switch to scan mode.
  const desktopScanButton = page.locator(
    'div.md\\:flex >> button[aria-label*="Switch to Scan Mode"]'
  )
  const genericScanButton = page.getByLabel(/Switch to Scan Mode/i).first()
  if ((await desktopScanButton.count()) > 0 && (await desktopScanButton.isVisible())) {
    await desktopScanButton.click()
  } else {
    await genericScanButton.click()
  }

  const fileInput = page.locator('input[type="file"]')
  await expect(fileInput).toHaveCount(1, { timeout: 10000 })
  await fileInput.setInputFiles(pngPath)
  await expect(page.getByText(expected, { exact: false })).toBeVisible({ timeout: 15000 })

  // Return to Create mode for the next iteration.
  const desktopCreateButton = page.locator(
    'div.md\\:flex >> button[aria-label*="Switch to Create Mode"]'
  )
  const genericCreateButton = page.getByLabel(/Switch to Create Mode/i).first()
  if ((await desktopCreateButton.count()) > 0 && (await desktopCreateButton.isVisible())) {
    await desktopCreateButton.click()
  } else {
    await genericCreateButton.click()
  }
}

test.describe('Mask configuration', () => {
  test('captures gradient + shape-mask screenshots in light and dark mode', async ({ page }) => {
    await page.goto('/')
    await setData(page, QR_DATA)

    // Enable a vivid dots gradient + a heart shape mask for a single hero image.
    await page.locator('#dots-gradient-enabled').check()
    await openColorSettings(page)
    await page.locator('#shape-mask').selectOption('heart')
    await page.waitForTimeout(800) // re-render

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'mask-config-light.png'),
      fullPage: false
    })

    // Seed localStorage so the next load comes up in dark mode, then re-apply
    // the same gradient + shape mask configuration.
    await page.evaluate(() => localStorage.setItem('dark-mode-preference', 'dark'))
    await page.reload()
    await setData(page, QR_DATA)
    await page.locator('#dots-gradient-enabled').check()
    await openColorSettings(page)
    await page.locator('#shape-mask').selectOption('heart')
    await page.waitForTimeout(800)
    // Sanity-check that the dark class actually landed.
    await expect(page.locator('html')).toHaveClass(/dark/)
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'mask-config-dark.png'),
      fullPage: false
    })
  })

  for (const shape of SHAPES) {
    test(`shape "${shape}" round-trips through scan-back`, async ({ page }) => {
      test.setTimeout(60_000)
      await page.goto('/')
      await setData(page, QR_DATA)
      await openColorSettings(page)
      await page.locator('#shape-mask').selectOption(shape)
      await page.waitForTimeout(800)

      const pngPath = await downloadPng(page, shape)
      expect(fs.existsSync(pngPath)).toBe(true)
      expect(fs.statSync(pngPath).size).toBeGreaterThan(1000)

      await scanBack(page, pngPath, QR_DATA)
    })
  }
})
