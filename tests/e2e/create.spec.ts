import { test, expect, type Page } from '@playwright/test'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

// Helper for ES module scope
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

test.describe('QR Code Creation and Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  async function openFrameSettings(page: Page) {
    await page.getByRole('button', { name: /frame settings/i }).click()
  }

  test.describe('Save and Load QR Configs (File Operations)', () => {
    const testDataNoFrame = 'Config Test No Frame'
    const testDataWithFrame = 'Config Test With Frame'
    const frameTextContent = 'My Frame For Config'
    const tempDir = path.join(__dirname, 'temp-downloads')
    const noFrameConfigFilename = 'qr-config-no-frame.json'
    const withFrameConfigFilename = 'qr-config-with-frame.json'

    test.beforeAll(async () => {
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
      }
    })

    test.afterAll(async () => {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true })
      }
    })

    test('should save and load QR config without a frame via file', async ({ page }) => {
      await page.locator('#data').fill(testDataNoFrame)
      await page.locator('#dots-color').fill('#112233') // Change a setting
      await openFrameSettings(page)
      const showFrameCheckbox = page.locator('#show-frame')
      await expect(showFrameCheckbox).toBeVisible()
      await expect(showFrameCheckbox).toBeEnabled()
      await showFrameCheckbox.uncheck()
      await page.waitForTimeout(600) // Ensure debouncedData updates before saving config

      const downloadPromise = page.waitForEvent('download')
      await page.locator('#save-qr-code-config-button').click()
      const download = await downloadPromise
      const downloadedFilePath = path.join(tempDir, noFrameConfigFilename)
      await download.saveAs(downloadedFilePath)

      expect(fs.existsSync(downloadedFilePath)).toBeTruthy()

      // Modify data to ensure loading works
      await page.locator('#data').fill('Something else before load')
      await page.locator('#dots-color').fill('#000000')
      await page.waitForTimeout(600) // Ensure debouncedData updates for the new value

      const fileChooserPromise = page.waitForEvent('filechooser')
      await page.locator('#load-qr-code-config-button').click()
      const fileChooser = await fileChooserPromise
      await fileChooser.setFiles(downloadedFilePath)
      await page.waitForTimeout(1000) // Allow time for file processing and reactivity

      await expect(page.locator('#data')).toHaveValue(testDataNoFrame)
      await expect(page.locator('#dots-color')).toHaveValue('#112233')
      // Re-open frame settings to check the checkbox state after load
      await openFrameSettings(page)
      await expect(page.locator('#show-frame')).not.toBeChecked()
    })

    test('rejects a config file whose logo image URL has an unsafe scheme', async ({ page }) => {
      const pageErrors: string[] = []
      page.on('pageerror', (err) => pageErrors.push(err.message))
      const unsafeUrlRequests: string[] = []
      page.on('console', (msg) => {
        if (msg.type() === 'error' && msg.text().includes('ERR_UNKNOWN_URL_SCHEME')) {
          unsafeUrlRequests.push(msg.text())
        }
      })

      const originalData = 'data-before-malicious-load'
      await page.locator('#data').fill(originalData)
      await page.waitForTimeout(600)

      // Fully valid config (same shape as a saved file, applies cleanly if
      // accepted) except for the javascript: logo URL — the whole file must
      // be rejected, leaving current state untouched.
      // Own temp dir: the shared tempDir is removed by afterAll, which can
      // race this test when describe blocks run in parallel workers.
      const ownTempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mini-qr-config-'))
      const maliciousConfigPath = path.join(ownTempDir, 'malicious-image-config.json')
      fs.writeFileSync(
        maliciousConfigPath,
        JSON.stringify({
          props: {
            data: 'https://evil.example',
            image: 'javascript:alert(1)',
            width: 200,
            height: 200,
            margin: 0,
            imageOptions: { margin: 0, imageSize: 0.4 },
            dotsOptions: { color: '#abcdef', type: 'square' },
            cornersSquareOptions: { color: '#abcdef', type: 'square' },
            cornersDotOptions: { color: '#abcdef', type: 'square' }
          },
          style: { borderRadius: '8px', background: '#ffffff' },
          frame: null
        })
      )

      const fileChooserPromise = page.waitForEvent('filechooser')
      await page.locator('#load-qr-code-config-button').click()
      const fileChooser = await fileChooserPromise
      await fileChooser.setFiles(maliciousConfigPath)
      await page.waitForTimeout(1000) // Allow time for file processing and reactivity

      await expect(page.locator('#data')).toHaveValue(originalData)
      await expect(page.locator('#image-url')).not.toHaveValue('javascript:alert(1)')
      // The unsafe URL must never reach an image sink (no load attempt), and
      // the rejection must be a clean no-op, not a crash mid-apply.
      expect(unsafeUrlRequests).toEqual([])
      expect(pageErrors).toEqual([])

      fs.rmSync(ownTempDir, { recursive: true, force: true })
    })

    test('should save and load QR config with a frame via file', async ({ page }) => {
      await page.locator('#data').fill(testDataWithFrame)
      await openFrameSettings(page)
      const showFrameCheckbox = page.locator('#show-frame')
      await expect(showFrameCheckbox).toBeVisible()
      await expect(showFrameCheckbox).toBeEnabled()
      await showFrameCheckbox.check()
      await page.locator('#frame-text').fill(frameTextContent)
      await page.locator('#frame-text-color').fill('#aabbcc') // Change a frame setting
      await page.waitForTimeout(600) // Ensure debouncedData updates before saving config

      const downloadPromise = page.waitForEvent('download')
      await page.locator('#save-qr-code-config-button').click()
      const download = await downloadPromise
      const downloadedFilePath = path.join(tempDir, withFrameConfigFilename)
      await download.saveAs(downloadedFilePath)

      expect(fs.existsSync(downloadedFilePath)).toBeTruthy()

      // Modify data
      await page.locator('#data').fill('Something different for with frame test') // Make this distinct
      await page.waitForTimeout(600) // Ensure debouncedData updates for the new value
      await openFrameSettings(page) // Ensure frame settings are open before unchecking
      await expect(showFrameCheckbox).toBeVisible()
      await expect(showFrameCheckbox).toBeEnabled()
      await showFrameCheckbox.uncheck()

      const fileChooserPromise = page.waitForEvent('filechooser')
      await page.locator('#load-qr-code-config-button').click()
      const fileChooser = await fileChooserPromise
      await fileChooser.setFiles(downloadedFilePath) // Load the uniquely named file
      await page.waitForTimeout(1000) // Allow time for file processing and reactivity

      await expect(page.locator('#data')).toHaveValue(testDataWithFrame)
      await openFrameSettings(page) // Re-open frame settings to check values
      await expect(page.locator('#show-frame')).toBeChecked()
      await expect(page.locator('#frame-text')).toHaveValue(frameTextContent)
      await expect(page.locator('#frame-text-color')).toHaveValue('#aabbcc')
    })
  })

  test.describe('Export QR Code (Single)', () => {
    test('should export as PNG without a frame', async ({ page }) => {
      const qrData = 'png-export-no-frame'
      await page.locator('#data').fill(qrData)
      await openFrameSettings(page)
      const showFrameCheckbox = page.locator('#show-frame')
      await expect(showFrameCheckbox).toBeVisible()
      await expect(showFrameCheckbox).toBeEnabled()
      await showFrameCheckbox.uncheck()
      await page.waitForTimeout(1000) // Allow QR to re-render and debouncedData to update

      await expect(page.locator('#element-to-export')).toBeVisible()

      const downloadPromise = page.waitForEvent('download')
      await page.locator('#download-qr-image-button-png').click()
      const download = await downloadPromise

      expect(download.suggestedFilename()).toMatch(/qr-code\.png$/i)
      await expect(page.locator('#element-to-export')).toHaveScreenshot('qr-no-frame.png')
    })

    test('should export as PNG with a frame', async ({ page }) => {
      const qrData = 'png-export-with-frame'
      const frameText = 'PNG Frame Test'
      await page.locator('#data').fill(qrData)
      await openFrameSettings(page)
      const showFrameCheckbox = page.locator('#show-frame')
      await expect(showFrameCheckbox).toBeVisible()
      await expect(showFrameCheckbox).toBeEnabled()
      await showFrameCheckbox.check()
      await page.locator('#frame-text').fill(frameText)
      await page.waitForTimeout(1000) // Allow QR to re-render and debouncedData to update

      await expect(page.locator('#element-to-export')).toBeVisible()

      const downloadPromise = page.waitForEvent('download')
      await page.locator('#download-qr-image-button-png').click()
      const download = await downloadPromise

      expect(download.suggestedFilename()).toMatch(/qr-code\.png$/i)
      await expect(page.locator('#element-to-export')).toHaveScreenshot('qr-with-frame.png')
    })

    test('should export as JPG without a frame', async ({ page }) => {
      const qrData = 'jpg-export-no-frame'
      await page.locator('#data').fill(qrData)
      await openFrameSettings(page)
      const showFrameCheckbox = page.locator('#show-frame')
      await expect(showFrameCheckbox).toBeVisible()
      await expect(showFrameCheckbox).toBeEnabled()
      await showFrameCheckbox.uncheck()
      await page.waitForTimeout(1000) // Allow QR to re-render and debouncedData to update

      await expect(page.locator('#element-to-export')).toBeVisible()

      const downloadPromise = page.waitForEvent('download')
      await page.locator('#download-qr-image-button-jpg').click()
      const download = await downloadPromise

      expect(download.suggestedFilename()).toMatch(/qr-code\.jpg$/i)
      await expect(page.locator('#element-to-export')).toHaveScreenshot('qr-no-frame-as-jpg.png')
    })

    test('should export as JPG with a frame', async ({ page }) => {
      const qrData = 'jpg-export-with-frame'
      const frameText = 'JPG Frame Test'
      await page.locator('#data').fill(qrData)
      await openFrameSettings(page)
      const showFrameCheckbox = page.locator('#show-frame')
      await expect(showFrameCheckbox).toBeVisible()
      await expect(showFrameCheckbox).toBeEnabled()
      await showFrameCheckbox.check()
      await page.locator('#frame-text').fill(frameText)
      await page.waitForTimeout(1000) // Allow QR to re-render and debouncedData to update

      await expect(page.locator('#element-to-export')).toBeVisible()

      const downloadPromise = page.waitForEvent('download')
      await page.locator('#download-qr-image-button-jpg').click()
      const download = await downloadPromise

      expect(download.suggestedFilename()).toMatch(/qr-code\.jpg$/i)
      await expect(page.locator('#element-to-export')).toHaveScreenshot('qr-with-frame-as-jpg.png')
    })
  })

  test.describe('JPG background color preservation', () => {
    const tempDir = path.join(__dirname, 'temp-jpg-bg')

    test.beforeAll(async () => {
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
      }
    })

    test.afterAll(async () => {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true })
      }
    })

    test('saved JPG should preserve the background color set on the default preset', async ({
      page
    }) => {
      // The default preset (lyqht) loads automatically with background #697d80.
      // Set a vivid red background that is clearly distinct from white so the
      // bug (bgcolor always 'white') is easy to detect.
      const bgColor = '#ff0000'
      await page.locator('#background-color').fill(bgColor)
      // Add margin so the top-left corner area is guaranteed background colour.
      await page.locator('#margin').fill('20')
      await page.waitForTimeout(800)

      await openFrameSettings(page)
      const showFrameCheckbox = page.locator('#show-frame')
      await expect(showFrameCheckbox).toBeVisible()
      await showFrameCheckbox.uncheck()
      await page.waitForTimeout(500)

      const downloadPromise = page.waitForEvent('download')
      await page.locator('#download-qr-image-button-jpg').click()
      const download = await downloadPromise

      expect(download.suggestedFilename()).toMatch(/\.jpg$/i)

      const downloadedFilePath = path.join(tempDir, 'bg-color-test.jpg')
      await download.saveAs(downloadedFilePath)
      expect(fs.existsSync(downloadedFilePath)).toBeTruthy()

      // Read the top-left corner pixel (within the margin / background area).
      // With margin=20 modules, even a small QR code has several pixels of pure
      // background at the very top-left corner.
      const { data } = await sharp(downloadedFilePath)
        .extract({ left: 5, top: 5, width: 1, height: 1 })
        .raw()
        .toBuffer({ resolveWithObject: true })

      // JPEG is lossy, allow ±20 per channel
      const r = data[0]
      const g = data[1]
      const b = data[2]
      expect(r).toBeGreaterThan(200) // red channel should be high (~255)
      expect(g).toBeLessThan(80) // green channel should be low (~0)
      expect(b).toBeLessThan(80) // blue channel should be low (~0)
    })
  })

  test.describe('Internal QR lib parity', () => {
    async function switchToScanMode(page: Page) {
      const desktopScanButton = page.locator(
        'div.md\\:flex >> button[aria-label*="Switch to Scan Mode"]'
      )
      const genericScanButton = page.getByLabel(/Switch to Scan Mode/i).first()
      if ((await desktopScanButton.count()) > 0 && (await desktopScanButton.isVisible())) {
        await desktopScanButton.click()
      } else if ((await genericScanButton.count()) > 0 && (await genericScanButton.isVisible())) {
        await genericScanButton.click()
      } else {
        throw new Error('Scan mode button not found')
      }
    }

    async function exportPngWithData(page: Page, data: string, tempDir: string, fileName: string) {
      await page.locator('#data').fill(data)
      await openFrameSettings(page)
      const showFrameCheckbox = page.locator('#show-frame')
      await expect(showFrameCheckbox).toBeVisible()
      await showFrameCheckbox.uncheck()
      await page.waitForTimeout(800)

      const downloadPromise = page.waitForEvent('download')
      await page.locator('#download-qr-image-button-png').click()
      const download = await downloadPromise
      const filePath = path.join(tempDir, fileName)
      await download.saveAs(filePath)
      expect(fs.existsSync(filePath)).toBeTruthy()
      return filePath
    }

    const tempDir = path.join(__dirname, 'temp-parity')

    test.beforeAll(() => {
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
    })
    test.afterAll(() => {
      if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true })
    })

    test('UTF-8 data round-trips through PNG export and scan (closes #119 accent bug)', async ({
      page
    }) => {
      const utf8 = 'Xin chào — 你好 — مرحبا — 👋'
      const filePath = await exportPngWithData(page, utf8, tempDir, 'utf8.png')

      await switchToScanMode(page)
      const fileInput = page.locator('input[type="file"]')
      await expect(fileInput).toHaveCount(1, { timeout: 10000 })
      await fileInput.setInputFiles(filePath)
      await expect(page.getByText(utf8)).toBeVisible({ timeout: 10000 })
    })

    test('ASCII data round-trips through PNG export and scan (regression guard)', async ({
      page
    }) => {
      const data = 'mini-qr lib parity ASCII'
      const filePath = await exportPngWithData(page, data, tempDir, 'ascii.png')

      await switchToScanMode(page)
      const fileInput = page.locator('input[type="file"]')
      await expect(fileInput).toHaveCount(1, { timeout: 10000 })
      await fileInput.setInputFiles(filePath)
      await expect(page.getByText(data)).toBeVisible({ timeout: 10000 })
    })

    test('SVG export emits vector <rect>/<path> and no raster <image> of the matrix', async ({
      page
    }) => {
      await page.locator('#data').fill('vector svg parity')
      await openFrameSettings(page)
      await page.locator('#show-frame').uncheck()
      await page.waitForTimeout(800)

      const downloadPromise = page.waitForEvent('download')
      await page.locator('#download-qr-image-button-svg').click()
      const download = await downloadPromise
      const filePath = path.join(tempDir, 'vector.svg')
      await download.saveAs(filePath)
      expect(fs.existsSync(filePath)).toBeTruthy()

      const svgText = fs.readFileSync(filePath, 'utf8')

      // Total length of all <path d="..."> data attributes. A real vector QR
      // has thousands of characters of path data (aggregated dot paths). The
      // OLD qr-code-styling output emitted basically no path data and instead
      // embedded a raster <image> of the matrix — that anti-pattern would
      // leave the path-data budget near zero.
      const pathDataLengths = Array.from(svgText.matchAll(/<path[^>]+\bd="([^"]*)"/g)).map(
        (m) => m[1].length
      )
      const totalPathData = pathDataLengths.reduce((a, b) => a + b, 0)
      expect(
        totalPathData,
        `expected substantial vector path data; got ${totalPathData} chars of <path d> total`
      ).toBeGreaterThan(500)
    })

    test('logo with cross-origin source does not taint the canvas on PNG export', async ({
      page
    }) => {
      // The default preset (lyqht) uses a local placeholder; switch to a preset
      // that references a public CDN logo (Vue.js preset uses iconify).
      await page.locator('#data').fill('crossorigin parity')
      await page.locator('#image-url').fill('https://api.iconify.design/logos:vue.svg')
      await openFrameSettings(page)
      await page.locator('#show-frame').uncheck()
      await page.waitForTimeout(1200) // give the image time to load

      const errors: string[] = []
      page.on('pageerror', (err) => errors.push(err.message))

      const downloadPromise = page.waitForEvent('download')
      await page.locator('#download-qr-image-button-png').click()
      const download = await downloadPromise
      expect(download.suggestedFilename()).toMatch(/qr-code\.png$/i)
      const taintErrors = errors.filter((m) => /tainted|SecurityError/i.test(m))
      expect(taintErrors, taintErrors.join('\n')).toHaveLength(0)
    })
  })

  test.describe('Batch Export QR Codes', () => {
    const simpleCsvPath = 'batch_export_templates/6_strings_batch.csv'

    test('should display frameFontFamily from CSV in the batch preview panel', async ({ page }) => {
      await page.getByRole('button', { name: /batch export/i }).click()

      const tempCsvDir = path.join(__dirname, 'temp-csv-font')
      if (!fs.existsSync(tempCsvDir)) {
        fs.mkdirSync(tempCsvDir, { recursive: true })
      }
      const tempCsvFilePath = path.join(tempCsvDir, 'batch-font.csv')
      const csvContent = `url,frameText,fileName,frameFontFamily
https://example.com,Visit us,site,Poppins
https://github.com,GitHub,github,Roboto
https://linkedin.com,LinkedIn,linkedin,`
      fs.writeFileSync(tempCsvFilePath, csvContent)

      const fileChooserPromise = page.waitForEvent('filechooser')
      await page.locator('button[aria-label*="Choose a CSV file"]').click()
      const fileChooser = await fileChooserPromise
      await fileChooser.setFiles(tempCsvFilePath)

      const rowCounter = page.locator('text=/\\d+ \\/ \\d+/')
      await expect(rowCounter).toBeVisible({ timeout: 10000 })

      // Navigation buttons flank the row counter (< ... counter ... >)
      const navContainer = page.locator('.mt-2.flex.items-center.justify-between')
      const nextBtn = navContainer.locator('button').last()

      // First row (index 0) has Poppins
      await expect(page.getByText('Poppins')).toBeVisible()

      // Navigate to second row and verify Roboto
      await nextBtn.click()
      await expect(rowCounter).toHaveText('2 / 3')
      await expect(page.getByText('Roboto')).toBeVisible()

      // Navigate to third row — no font family, font family section should not be shown
      await nextBtn.click()
      await expect(rowCounter).toHaveText('3 / 3')
      await expect(page.getByText('Poppins')).not.toBeVisible()
      await expect(page.getByText('Roboto')).not.toBeVisible()

      fs.rmSync(tempCsvDir, { recursive: true, force: true })
    })

    test('should batch export QR codes as a zip file of PNGs from CSV input', async ({ page }) => {
      // Switch to batch export mode
      await page.getByRole('button', { name: /batch export/i }).click()

      // Fetch the CSV content (assuming it's served from the public directory)
      const csvResponse = await page.request.get('/' + simpleCsvPath)
      expect(csvResponse.ok()).toBeTruthy()
      const csvContent = await csvResponse.text()

      // Prepare for file chooser
      const fileChooserPromise = page.waitForEvent('filechooser')
      await page.locator('button[aria-label*="Choose a CSV file"]').click()
      const fileChooser = await fileChooserPromise

      const tempCsvDir = path.join(__dirname, 'temp-csv')
      if (!fs.existsSync(tempCsvDir)) {
        fs.mkdirSync(tempCsvDir, { recursive: true })
      }
      const tempCsvFilePath = path.join(tempCsvDir, 'batch.csv')
      fs.writeFileSync(tempCsvFilePath, csvContent)

      await fileChooser.setFiles(tempCsvFilePath)

      await expect(page.locator('text=/\\d+ \\/ \\d+/')).toBeVisible({ timeout: 10000 })

      const downloadPromise = page.waitForEvent('download')
      await page.locator('#download-qr-image-button-png').click()
      const download = await downloadPromise

      expect(download.suggestedFilename()).toMatch(/qr-codes\.zip$/i)

      if (fs.existsSync(tempCsvFilePath)) {
        fs.unlinkSync(tempCsvFilePath)
      }
      if (fs.existsSync(tempCsvDir) && fs.readdirSync(tempCsvDir).length === 0) {
        fs.rmdirSync(tempCsvDir)
      }
    })
  })
})
