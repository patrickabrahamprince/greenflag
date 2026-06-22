import { test, expect } from '@playwright/test'
import { loadTestUsers, loginAs } from '../helpers/auth'
const isE2ETest = process.env.NEXT_PUBLIC_E2E_TESTING === 'true'

test.describe('Auth — Redirect to /discover for all genders', () => {
  test('man should land on /discover after login', async ({ page }) => {
    const users = loadTestUsers()
    await page.goto('/login')
    await page.fill('[data-testid="email"]', users.TEST_MAN1_EMAIL)
    await page.fill('[data-testid="password"]', process.env.TEST_USER_PASSWORD || 'Test1234!')
    await page.click('[data-testid="login-btn"]')
    await expect(page).toHaveURL(/\/discover/, { timeout: 10000 })
    await expect(page).not.toHaveURL(/\/connections|\/home/)
  })

  test('woman should land on /discover after login', async ({ page }) => {
    const users = loadTestUsers()
    await page.goto('/login')
    if (isE2ETest) {
      await page.fill('[data-testid="email"]', users.TEST_WOMAN_EMAIL)
      await page.fill('[data-testid="password"]', process.env.TEST_USER_PASSWORD || 'Test1234!')
      await page.click('[data-testid="login-btn"]')
    } else {
      await page.fill('input[type="tel"]', '+919876500002')
      await page.click('button:has-text("Send OTP")')
      await page.fill('input[maxlength="6"]', '123456')
      await page.click('button:has-text("Verify")')
    }
    await expect(page).toHaveURL(/\/discover/, { timeout: 10000 })
    await expect(page).not.toHaveURL(/\/connections|\/home/)
  })

  test('discover page shows empty state when no profiles available', async ({ page }) => {
    await loginAs(page, process.env.TEST_MAN_ID!)
    await page.goto('/discover')
    await expect(page.locator('[data-testid="discover-empty-state"]')).toBeVisible({ timeout: 10000 })
  })

  test('discover page should NOT show old connections waiting text', async ({ page }) => {
    const users = loadTestUsers()
    await page.goto('/login')
    await page.fill('[data-testid="email"]', users.TEST_WOMAN_EMAIL)
    await page.fill('[data-testid="password"]', process.env.TEST_USER_PASSWORD || 'Test1234!')
    await page.click('[data-testid="login-btn"]')
    await expect(page).toHaveURL(/\/discover/, { timeout: 10000 })
    await expect(page.locator('text=Men who start your standard will appear here')).not.toBeVisible()
  })

  test('unauthenticated access to /discover redirects to login', async ({ page }) => {
    await page.goto('/discover')
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })
})
