import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

// Recreate __dirname and __filename for ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

test.beforeEach(async ({ page }) => {
  // Go to the page before each test
  await page.goto('/')

  // Clear localStorage to prevent state from previous tests
  await page.evaluate(() => localStorage.clear())

  // Reload the page to apply the cleared storage (optional but safer)
  await page.reload()

  // Make sure we are in Create mode (though it's the default after reload)
  const createModeButton = page.getByLabel('Switch to Create Mode').first()
  await expect(createModeButton).toHaveClass(/bg-white/) // Or check another attribute indicating selection

  // Clear the data input field to ensure a clean state
  const textInput = page.locator('textarea[id="data"]')
  await textInput.fill('')
  await expect(textInput).toHaveValue('') // Verify it's empty
})

test('creates a QR code', async ({ page }) => {
  // Find the text area and fill it.
  const textInput = page.locator('textarea[id="data"]')
  await textInput.fill('Hello Playwright!')

  // Check if the QR code image is visible using its role and name.
  const qrCodeImage = page.getByRole('img', { name: 'QR code' })
  await expect(qrCodeImage).toBeVisible()
})

test('copy and export buttons are disabled when data is empty', async ({ page }) => {
  // Check initial state (data should be empty)
  const textInput = page.locator('textarea[id="data"]')
  await expect(textInput).toHaveValue('')

  // Check buttons are disabled
  await expect(page.locator('#copy-qr-image-button')).toBeDisabled()
  await expect(page.locator('#download-qr-image-button-png')).toBeDisabled()
  await expect(page.locator('#download-qr-image-button-jpg')).toBeDisabled()
  await expect(page.locator('#download-qr-image-button-svg')).toBeDisabled()

  // Enter some data
  await textInput.fill('Test Data')

  // Check buttons are now enabled
  await expect(page.locator('#copy-qr-image-button')).toBeEnabled()
  await expect(page.locator('#download-qr-image-button-png')).toBeEnabled()
  await expect(page.locator('#download-qr-image-button-jpg')).toBeEnabled()
  await expect(page.locator('#download-qr-image-button-svg')).toBeEnabled()
})

test('save and load QR code config works', async ({ page }) => {
  const testData = 'Config Test Data'
  const textInput = page.locator('textarea[id="data"]')
  const dotsColorInput = page.locator('#dots-color') // Corrected ID
  const initialColor = await dotsColorInput.inputValue()
  const newColor = '#ff0000'

  // Set initial data and change color
  await textInput.fill(testData)
  await dotsColorInput.fill(newColor)
  await expect(dotsColorInput).toHaveValue(newColor)

  // Start waiting for the download before clicking the button
  const downloadPromise = page.waitForEvent('download')
  await page.locator('#save-qr-code-config-button').click()
  const download = await downloadPromise

  // Ensure the test-results directory exists
  const resultsDir = path.resolve(__dirname, '../../test-results')
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true })
  }
  // Save the downloaded file path
  const configPath = path.join(resultsDir, download.suggestedFilename())
  await download.saveAs(configPath)

  // Clear the input and reset color (or reload the page)
  await textInput.fill('')
  await dotsColorInput.fill(initialColor) // Reset color to simulate loading
  await expect(textInput).toHaveValue('')
  await expect(dotsColorInput).toHaveValue(initialColor)

  // Locate the load button and set the input file
  const loadConfigButton = page.locator('#load-qr-code-config-button')
  // Playwright needs a file chooser listener BEFORE the click that triggers it
  const fileChooserPromise = page.waitForEvent('filechooser')
  await loadConfigButton.click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(configPath)

  // Verify data and color are restored
  await expect(textInput).toHaveValue(testData)
  await expect(dotsColorInput).toHaveValue(newColor)
})

test('save and load QR code config works with frame', async ({ page }) => {
  const testData = 'Frame Config Test'
  const frameTextData = 'Scan Me!'
  const textInput = page.locator('textarea[id="data"]')
  const frameAccordionTrigger = page.getByRole('button', { name: /Frame settings/ })
  const showFrameCheckbox = page.locator('input[id="show-frame"]')
  const frameTextInput = page.locator('textarea[id="frame-text"]')
  const framePositionTopRadio = page.locator('input[id="frameTextPosition-top"]')

  // Expand the Frame settings accordion
  await frameAccordionTrigger.click()

  // Set initial data, enable frame, set text, and change position
  await textInput.fill(testData)
  await showFrameCheckbox.check()
  await frameTextInput.fill(frameTextData)
  await framePositionTopRadio.check() // Change from default bottom to top

  // Verify initial set state
  await expect(showFrameCheckbox).toBeChecked()
  await expect(frameTextInput).toHaveValue(frameTextData)
  await expect(framePositionTopRadio).toBeChecked()

  // Save config
  const downloadPromise = page.waitForEvent('download')
  await page.locator('#save-qr-code-config-button').click()
  const download = await downloadPromise
  const configPath = './test-results/' + download.suggestedFilename()
  await download.saveAs(configPath)

  // Clear inputs and reset frame settings
  await textInput.fill('')
  await showFrameCheckbox.uncheck()
  // frameTextInput and framePositionTopRadio might be hidden now, no need to explicitly clear/reset

  // Verify cleared state (frame checkbox is unchecked)
  await expect(textInput).toHaveValue('')
  await expect(showFrameCheckbox).not.toBeChecked()

  // Load config
  const loadConfigButton = page.locator('#load-qr-code-config-button')
  const fileChooserPromise = page.waitForEvent('filechooser')
  await loadConfigButton.click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(configPath)

  // Ensure accordion is open again after load if needed (config load might close it)
  // Click trigger only if checkbox isn't visible after loading
  if (!(await showFrameCheckbox.isVisible())) {
    await frameAccordionTrigger.click()
  }

  // Verify data and frame settings are restored
  await expect(textInput).toHaveValue(testData)
  await expect(showFrameCheckbox).toBeChecked()
  await expect(frameTextInput).toHaveValue(frameTextData)
  await expect(framePositionTopRadio).toBeChecked() // Check if the non-default position was restored
})

test('QR code element with frame matches snapshot', async ({ page }) => {
  const testData = 'Frame Snapshot Test'
  const frameTextData = 'Scan Frame!'
  const textInput = page.locator('textarea[id="data"]')
  const frameAccordionTrigger = page.getByRole('button', { name: /Frame settings/ })
  const showFrameCheckbox = page.locator('input[id="show-frame"]')
  const frameTextInput = page.locator('textarea[id="frame-text"]')

  // Expand the Frame settings accordion
  await frameAccordionTrigger.click()

  // Set data, enable frame, and add frame text
  await textInput.fill(testData)
  await showFrameCheckbox.check()
  await frameTextInput.fill(frameTextData)

  // Locate the element containing the QR code and frame
  const qrCodeExportElement = page.locator('#element-to-export')

  // Ensure the element is visible before taking a snapshot
  await expect(qrCodeExportElement).toBeVisible()

  // Take a snapshot of the QR code element with the frame
  await expect(qrCodeExportElement).toHaveScreenshot('qr-code-with-frame-snapshot.png')
})

test('QR code element matches snapshot', async ({ page }) => {
  const testData = 'Snapshot Test'
  const textInput = page.locator('textarea[id="data"]')
  await textInput.fill(testData)

  // Locate the element containing the QR code to be exported
  const qrCodeExportElement = page.locator('#element-to-export')

  // Ensure the element is visible before taking a snapshot
  await expect(qrCodeExportElement).toBeVisible()

  // Take a snapshot of the QR code element
  await expect(qrCodeExportElement).toHaveScreenshot('qr-code-snapshot.png')

  // We don't need to test the actual download functionality extensively here,
  // as the snapshot confirms the visual output. Testing downloads can be flaky.
  // But we can check if the buttons exist and are clickable.
  await expect(page.locator('#download-qr-image-button-png')).toBeEnabled()
  await expect(page.locator('#download-qr-image-button-jpg')).toBeEnabled()
})

test('exported PNG can be scanned', async ({ page }) => {
  const testData = 'Export-Scan Test'
  const textInput = page.locator('textarea[id="data"]')
  await textInput.fill(testData)

  // Wait for QR code to render
  await expect(page.getByRole('img', { name: 'QR code' })).toBeVisible()

  // Start waiting for download and click PNG export button
  const downloadPromise = page.waitForEvent('download')
  await page.locator('#download-qr-image-button-png').click()
  const download = await downloadPromise
  // Save to a predictable location for inspection
  const exportedPngPath = './exported_qr_code.png'
  await download.saveAs(exportedPngPath)

  // Switch to Scan mode
  await page.getByLabel('Switch to Scan Mode').first().click()

  // Locate the hidden file input for scanning
  const scanFileInput = page.locator('input[type="file"][accept="image/*"]')

  // Upload the exported PNG
  await scanFileInput.setInputFiles(exportedPngPath)

  // Wait for the result container to appear first (keep increased timeout for now)
  const resultContainer = page.locator('.capture-result')
  await expect(resultContainer).toBeVisible({ timeout: 10000 })

  // Then verify the content within the container
  await expect(resultContainer.getByText(testData)).toBeVisible()
})

test('batch export works with CSV file', async ({ page }) => {
  const csvFilePath = 'public/6_strings_batch.csv' // Path to the test CSV
  const expectedZipFilename = 'qr-codes.zip'

  // Switch to Batch export mode
  await page.getByRole('button', { name: 'Batch export' }).click()

  // Locate the correct hidden file input for batch CSV upload
  const batchFileInput = page.locator('input[type="file"][accept=".csv,.txt"]')

  // Upload the CSV file
  await batchFileInput.setInputFiles(csvFilePath)

  // Check the "Ignore header row" checkbox
  const ignoreHeaderCheckbox = page.locator('input[id="ignore-header"]')
  await ignoreHeaderCheckbox.check()
  await expect(ignoreHeaderCheckbox).toBeChecked()

  // Wait for the UI to potentially update after file processing/checkbox click
  // Check for the preview text as an indicator
  await expect(page.getByText('5 piece(s) of data detected')).toBeVisible() // rows - 1 header
  await expect(page.getByText('First row preview:')).toBeVisible()
  await expect(page.locator('pre').getByText('https://www.esteetey.dev/')).toBeVisible()

  // Start waiting for the download before clicking the PNG export button
  const downloadPromise = page.waitForEvent('download')
  await page.locator('#download-qr-image-button-png').click()

  // Wait for the download to complete
  const download = await downloadPromise

  // Assert the downloaded file is a zip file with the expected name
  expect(download.suggestedFilename()).toBe(expectedZipFilename)
  const downloadedPath = './test-results/' + download.suggestedFilename()
  await download.saveAs(downloadedPath)

  // TODO: Optionally add steps here to unzip and verify file count/contents
  // For now, we just check the download happened and was a zip file.
})
