import { test, expect, type Page } from '@playwright/test'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const BLUE_FIXTURE = path.join(__dirname, 'fixtures', 'frame-bg-blue.png')

async function openFrameSettings(page: Page) {
  await page.getByRole('button', { name: /frame settings/i }).click()
}

async function enableFrame(page: Page) {
  await openFrameSettings(page)
  const showFrameCheckbox = page.locator('#show-frame')
  await expect(showFrameCheckbox).toBeVisible()
  await showFrameCheckbox.check()
}

async function uploadFrameBackground(page: Page) {
  await page.locator('#frame-background-type-image').check()
  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.locator('#frame-background-image-upload').click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(BLUE_FIXTURE)
}

/** Computed background-image of the framed preview's root element. */
function previewBackgroundImage(page: Page) {
  return page
    .locator('#element-to-export .w-fit')
    .first()
    .evaluate((el) => window.getComputedStyle(el).backgroundImage)
}

/** Decode a downloaded PNG in the page and sample a pixel at a fractional position. */
async function samplePngPixel(
  page: Page,
  filePath: string,
  fx: number,
  fy: number
): Promise<{ r: number; g: number; b: number }> {
  const dataUrl = `data:image/png;base64,${fs.readFileSync(filePath).toString('base64')}`
  return page.evaluate(
    async ({ dataUrl, fx, fy }) => {
      const img = new Image()
      img.src = dataUrl
      await img.decode()
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const x = Math.round(img.width * fx)
      const y = Math.round(img.height * fy)
      const d = ctx.getImageData(x, y, 1, 1).data
      return { r: d[0], g: d[1], b: d[2] }
    },
    { dataUrl, fx, fy }
  )
}

test.describe('Frame background image', () => {
  const tempDir = path.join(__dirname, 'temp-downloads')

  test.beforeAll(() => {
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
  })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('offers one Background setting that switches between color and image controls', async ({
    page
  }) => {
    await enableFrame(page)

    // Color is the default: color input shown, upload control hidden.
    await expect(page.locator('#frame-background-type-color')).toBeChecked()
    await expect(page.locator('#frame-bg-color')).toBeVisible()
    await expect(page.locator('#frame-background-image-upload')).toHaveCount(0)

    // Switching to Image swaps the controls.
    await page.locator('#frame-background-type-image').check()
    await expect(page.locator('#frame-background-image-upload')).toBeVisible()
    await expect(page.locator('#frame-bg-color')).toHaveCount(0)
  })

  test('shows the uploaded image as the frame background in the preview', async ({ page }) => {
    await enableFrame(page)
    await uploadFrameBackground(page)

    await expect.poll(() => previewBackgroundImage(page)).toContain('data:image/png')
  })

  test('switching the Background back to Color clears the image', async ({ page }) => {
    await enableFrame(page)
    await uploadFrameBackground(page)
    await expect.poll(() => previewBackgroundImage(page)).toContain('data:image/png')

    await page.locator('#frame-background-type-color').check()
    await expect.poll(() => previewBackgroundImage(page)).toBe('none')
  })

  test('persists the frame background image across a page reload', async ({ page }) => {
    await enableFrame(page)
    await uploadFrameBackground(page)
    await expect.poll(() => previewBackgroundImage(page)).toContain('data:image/png')

    // Wait until the config (including the background image) lands in localStorage.
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('qrCodeConfig') ?? ''))
      .toContain('backgroundImage')

    await page.reload()

    await expect.poll(() => previewBackgroundImage(page)).toContain('data:image/png')
    // The Background setting reflects the restored image mode.
    await openFrameSettings(page)
    await expect(page.locator('#frame-background-type-image')).toBeChecked()
  })

  test('exports the persisted background image to PNG after a page reload', async ({ page }) => {
    await page.locator('#data').fill('frame-bg-png-export')
    await enableFrame(page)
    await uploadFrameBackground(page)
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('qrCodeConfig') ?? ''))
      .toContain('backgroundImage')

    await page.reload()
    await expect.poll(() => previewBackgroundImage(page)).toContain('data:image/png')
    await page.waitForTimeout(1000) // allow QR re-render / debouncedData to settle

    const downloadPromise = page.waitForEvent('download')
    await page.locator('#download-qr-image-button-png').click()
    const download = await downloadPromise
    const downloadedFilePath = path.join(tempDir, 'frame-bg-export.png')
    await download.saveAs(downloadedFilePath)

    // The default frame has 16px padding inside a ~234px-wide frame, so a
    // sample at 4% from the top-left corner lands in the padding area —
    // covered by the (solid blue) background image, away from QR and border.
    const pixel = await samplePngPixel(page, downloadedFilePath, 0.04, 0.04)
    expect(pixel.b).toBeGreaterThan(200)
    expect(pixel.r).toBeLessThan(40)
    expect(pixel.g).toBeLessThan(40)
  })

  test('embeds the background image data URI in the exported SVG after a page reload', async ({
    page
  }) => {
    await page.locator('#data').fill('frame-bg-svg-export')
    await enableFrame(page)
    await uploadFrameBackground(page)
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('qrCodeConfig') ?? ''))
      .toContain('backgroundImage')

    await page.reload()
    await expect.poll(() => previewBackgroundImage(page)).toContain('data:image/png')
    await page.waitForTimeout(1000)

    const downloadPromise = page.waitForEvent('download')
    await page.locator('#download-qr-image-button-svg').click()
    const download = await downloadPromise
    const downloadedFilePath = path.join(tempDir, 'frame-bg-export.svg')
    await download.saveAs(downloadedFilePath)

    const svg = fs.readFileSync(downloadedFilePath, 'utf-8')
    expect(svg).toContain('<image href="data:image/png')
  })
})
