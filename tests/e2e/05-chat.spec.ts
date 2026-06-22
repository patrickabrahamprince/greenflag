import { test, expect, chromium } from '@playwright/test'
import { loginAs } from '../helpers/auth'
import { createTestConnection, fastForwardToDay } from '../helpers/db'

test.describe('Chat — gated and real-time', () => {
  let connectionId: string

  test.beforeEach(async () => {
    connectionId = await createTestConnection(
      process.env.TEST_MAN_ID!,
      process.env.TEST_WOMAN_ID!
    )
  })

  test('chat locked before Day 5', async ({ page }) => {
    await loginAs(page, process.env.TEST_MAN_ID!)
    await page.goto(`/messages/${connectionId}`)
    await expect(page.locator('text=Chat unlocks at Day 5')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('input[type="text"]')).not.toBeVisible()
  })

  test('chat unlocked after Day 5', async ({ page }) => {
    await fastForwardToDay(connectionId, 5, true, false)
    await loginAs(page, process.env.TEST_MAN_ID!)
    await page.goto(`/messages/${connectionId}`)
    await expect(page.locator('input[placeholder*="Message"], textarea')).toBeVisible({ timeout: 5000 })
  })

  test('real-time messaging between man and woman', async () => {
    await fastForwardToDay(connectionId, 5, true, false)

    const browser = await chromium.launch()
    const manContext = await browser.newContext()
    const womanContext = await browser.newContext()
    const manPage = await manContext.newPage()
    const womanPage = await womanContext.newPage()

    await loginAs(manPage, process.env.TEST_MAN_ID!)
    await loginAs(womanPage, process.env.TEST_WOMAN_ID!)

    await manPage.goto(`/messages/${connectionId}`)
    await womanPage.goto(`/messages/${connectionId}`)

    await manPage.fill('input[placeholder*="Message"], textarea', 'Hello from man')
    await manPage.keyboard.press('Enter')

    await expect(womanPage.locator('text=Hello from man')).toBeVisible({ timeout: 8000 })

    await womanPage.fill('input[placeholder*="Message"], textarea', 'Hello from woman')
    await womanPage.keyboard.press('Enter')

    await expect(manPage.locator('text=Hello from woman')).toBeVisible({ timeout: 8000 })

    await expect(manPage.locator('text=Read')).not.toBeVisible()
    await expect(manPage.locator('text=Seen')).not.toBeVisible()

    await browser.close()
  })

  test('no read receipts shown', async ({ page }) => {
    await fastForwardToDay(connectionId, 5, true, false)
    await loginAs(page, process.env.TEST_MAN_ID!)
    await page.goto(`/messages/${connectionId}`)
    await page.fill('input[placeholder*="Message"], textarea', 'Test message')
    await page.keyboard.press('Enter')
    await expect(page.locator('text=Read')).not.toBeVisible()
    await expect(page.locator('text=Seen')).not.toBeVisible()
  })
})
