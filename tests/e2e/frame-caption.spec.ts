import { test, expect, type Page } from '@playwright/test'

async function openFrameSettings(page: Page) {
  await page.getByRole('button', { name: /frame settings/i }).click()
}

async function enableSideCaption(page: Page) {
  await openFrameSettings(page)
  const showFrameCheckbox = page.locator('#show-frame')
  await expect(showFrameCheckbox).toBeVisible()
  await showFrameCheckbox.check()
  await page.locator('#frameTextPosition-right').check()
}

/** Natural width of the preview caption column — unaffected by FitScaleBox's
 *  visual transform, and the same measurement the export pipeline uses. */
function captionWidth(page: Page) {
  return page.locator('#element-to-export p').evaluate((el) => (el as HTMLElement).offsetWidth)
}

test.describe('Frame caption settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('groups caption settings accessibly in the order Text → Position', async ({ page }) => {
    await enableSideCaption(page)

    const captionGroup = page.locator('fieldset', {
      has: page.locator('legend:text-is("Caption")')
    })
    await expect(captionGroup).toBeVisible()
    await expect(captionGroup.locator('#frame-text')).toBeVisible()
    await expect(captionGroup.locator('fieldset legend')).toHaveText('Position')

    const textY = (await captionGroup.locator('#frame-text').boundingBox())!.y
    const positionY = (await captionGroup.locator('#frameTextPosition-top').boundingBox())!.y
    expect(textY).toBeLessThan(positionY)
  })

  test('shows the Frame width input only for side captions', async ({ page }) => {
    await enableSideCaption(page)
    await expect(page.locator('#frame-width')).toBeVisible()

    await page.locator('#frameTextPosition-bottom').check()
    await expect(page.locator('#frame-width')).toHaveCount(0)
  })

  test('derives the caption width as frame width − QR width', async ({ page }) => {
    await enableSideCaption(page)

    await expect(page.locator('#frame-width')).toHaveValue('400')
    expect(await captionWidth(page)).toBe(200)

    await page.locator('#frame-width').fill('500')
    await expect.poll(() => captionWidth(page)).toBe(300)
  })

  test('rejects out-of-range frame widths and keeps the last valid value', async ({ page }) => {
    await enableSideCaption(page)
    const input = page.locator('#frame-width')

    await input.fill('500')
    await expect.poll(() => captionWidth(page)).toBe(300)

    await input.fill('900')
    await expect(page.locator('#frame-width-error')).toContainText('between 250 and 800 px')
    expect(await captionWidth(page)).toBe(300)

    await input.fill('')
    await expect(page.locator('#frame-width-error')).toBeVisible()
    expect(await captionWidth(page)).toBe(300)

    await input.fill('600')
    await expect(page.locator('#frame-width-error')).toHaveCount(0)
    await expect.poll(() => captionWidth(page)).toBe(400)
  })

  test('keeps the settings column in place at the maximum frame width', async ({ page }) => {
    await enableSideCaption(page)

    // FitScaleBox applies its cap via ResizeObserver one beat after the
    // caption prop lands, so wait on the RENDERED width (≤ the 450px cap),
    // not the natural width, before measuring positions.
    const renderedFrameWidth = () =>
      page
        .locator('#element-to-export')
        .evaluate((el) => Math.round(el.getBoundingClientRect().width))

    await expect.poll(renderedFrameWidth).toBeLessThanOrEqual(450)
    const header = page.getByRole('button', { name: /frame settings/i })
    const xBefore = (await header.boundingBox())!.x

    await page.locator('#frame-width').fill('800')
    await expect.poll(() => captionWidth(page)).toBe(600)
    await expect.poll(renderedFrameWidth).toBeLessThanOrEqual(450)

    const xAfter = (await header.boundingBox())!.x
    expect(Math.abs(xAfter - xBefore)).toBeLessThan(2)
  })
})

test.describe('Frame caption on mobile', () => {
  test.use({ viewport: { width: 375, height: 800 } })

  test('wide captions neither overflow the viewport nor cover the Export hint', async ({
    page
  }) => {
    await page.goto('/')
    await enableSideCaption(page)
    await page.locator('#frame-width').fill('800')
    // On mobile the main preview lives in the (closed) drawer; measure the
    // drawer trigger's caption instead.
    await expect
      .poll(() =>
        page
          .locator('#drawer-preview-container p')
          .first()
          .evaluate((el) => (el as HTMLElement).offsetWidth)
      )
      .toBe(600)

    const overflow = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth
    }))
    expect(overflow.scrollW).toBeLessThanOrEqual(overflow.innerW)

    const trigger = page.locator('#drawer-preview-container')
    const hintBox = (await trigger.getByText('Export').boundingBox())!
    const previewBox = (await trigger.locator('.w-fit').first().boundingBox())!
    expect(previewBox.y + previewBox.height).toBeLessThanOrEqual(hintBox.y + 1)
  })
})
