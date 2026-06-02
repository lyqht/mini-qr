import { test, expect } from '@playwright/test'
import { spawn, type ChildProcess } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

/**
 * Regression tests for PR #287 — "apply env QR presets on initial page load".
 *
 * Bug: when self-hosting with `VITE_QR_CODE_PRESETS` (incl. an embedded `frame`),
 * the preset's logo/colors/frame were NOT applied on first visit — they only
 * appeared after manually importing a JSON config or switching the preset in the UI.
 *
 * The fix runs the preset->state mapping immediately on load
 * (`watch(selectedPreset, applySelectedPresetToState, { immediate: true })`) and
 * re-applies the embedded frame on mount.
 *
 * These tests boot a dedicated Vite dev server configured with an env preset and
 * `VITE_DISABLE_LOCAL_STORAGE=true`. With local storage disabled, the immediate
 * watcher is the ONLY thing that can apply preset state on first load, so both the
 * colors and the embedded frame become clean regression guards: every assertion
 * below fails on the pre-fix code and passes on the fixed code.
 */

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

// Uncommon base port to avoid clashing with the default dev server (5173).
// Offset by worker index so parallel workers each get an isolated server.
const PORT_BASE = 51873
let baseUrl = ''

// Distinct, unambiguous values so assertions can't accidentally match defaults.
// Frame text differs from the in-app default ("Scan for more info").
const ENV_PRESET = [
  {
    name: 'E2E Env Preset',
    data: 'https://e2e.example.com',
    image: '',
    width: 200,
    height: 200,
    margin: 0,
    imageOptions: { margin: 0, imageSize: 0.4 },
    dotsOptions: { color: '#123456', type: 'dots' },
    cornersSquareOptions: { color: '#abcdef', type: 'square' },
    cornersDotOptions: { color: '#fedcba', type: 'square' },
    style: { borderRadius: '12px', background: '#ffffff' },
    qrOptions: { errorCorrectionLevel: 'H' },
    frame: {
      text: 'Win a prize',
      position: 'bottom',
      style: {
        textColor: '#ff0000',
        backgroundColor: '#00ff00',
        borderColor: '#0000ff',
        borderWidth: '2px',
        borderRadius: '10px',
        padding: '20px'
      }
    }
  }
]

let server: ChildProcess

async function waitForServer(url: string, timeoutMs = 60_000): Promise<void> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url)
      if (res.ok) return
    } catch {
      // server not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
  throw new Error(`Vite dev server at ${url} did not become ready within ${timeoutMs}ms`)
}

test.describe('Env preset applied on initial page load (PR #287)', () => {
  // Playwright requires the first hook arg to be an (here empty) destructuring pattern.
  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(async ({}, testInfo) => {
    const port = PORT_BASE + testInfo.workerIndex
    baseUrl = `http://localhost:${port}`
    server = spawn(
      process.execPath,
      [
        path.join(repoRoot, 'node_modules/vite/bin/vite.js'),
        '--port',
        String(port),
        '--strictPort'
      ],
      {
        cwd: repoRoot,
        env: {
          ...process.env,
          VITE_QR_CODE_PRESETS: JSON.stringify(ENV_PRESET),
          VITE_DISABLE_LOCAL_STORAGE: 'true'
        },
        stdio: ['ignore', 'ignore', 'inherit']
      }
    )
    await waitForServer(baseUrl)
  })

  test.afterAll(async () => {
    server?.kill('SIGTERM')
  })

  test('applies env preset QR colors on first load without manual import', async ({ page }) => {
    await page.goto(`${baseUrl}/`)

    // The dots color comes from the env preset and must be present on first paint.
    await expect(page.locator('#dots-color')).toHaveValue('#123456')
  })

  test('applies embedded frame from env preset on first load', async ({ page }) => {
    await page.goto(`${baseUrl}/`)

    // The framed preview must render with the preset's frame text immediately —
    // no JSON import, no preset switch. (Pre-fix: showFrame stayed false here.)
    await expect(page.getByText('Win a prize')).toBeVisible({ timeout: 15_000 })

    // The frame settings UI must reflect the preset-derived state.
    await page.getByRole('button', { name: /frame settings/i }).click()
    await expect(page.locator('#show-frame')).toBeChecked()
    await expect(page.locator('#frame-text')).toHaveValue('Win a prize')
    await expect(page.locator('#frame-text-color')).toHaveValue('#ff0000')
  })
})
