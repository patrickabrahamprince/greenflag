import { test, expect } from '@playwright/test'
import { loadTestUsers } from '../helpers/auth'
const isE2ETest = process.env.NEXT_PUBLIC_E2E_TESTING === 'true';
test.describe('Auth — Login page', () => {
test.skip(isE2ETest, 'OTP UI hidden in E2E');
test('shows phone input and Google button', async ({ page }) => {
  await page.goto('/login')
  await expect(page.locator('input[type="tel"]')).toBeVisible()
  await expect(page.locator('button:has-text("Continue with Google")')).toBeVisible()
  await expect(page.locator('text=or')).toBeVisible()
})

test.skip(isE2ETest, 'OTP UI hidden in E2E');
test('shows OTP input after phone submission', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="tel"]', '+919876500001')
  await page.click('button:has-text("Send OTP")')
  await expect(page.locator('input[placeholder*="OTP"], input[maxlength="6"]')).toBeVisible({ timeout: 5000 })
})

  test('redirects man to /discover after login', async ({ page }) => {
    const users = loadTestUsers()
    await page.goto('/login')
    await page.fill('input[type="email"]', users.TEST_MAN1_EMAIL)
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || 'Test1234!')
    await page.click('button:has-text("Log in")')
    await expect(page).toHaveURL('/discover', { timeout: 10000 })
  })

  test('redirects woman to /connections after login', async ({ page }) => {
    const users = loadTestUsers()
    await page.goto('/login')
    if (isE2ETest) {
      await page.fill('input[type="email"]', users.TEST_WOMAN_EMAIL)
      await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || 'Test1234!')
      await page.click('button:has-text("Log in")')
    } else {
      await page.fill('input[type="tel"]', '+919876500002')
      await page.click('button:has-text("Send OTP")')
      await page.fill('input[maxlength="6"]', '123456')
      await page.click('button:has-text("Verify")')
    }
    await expect(page).toHaveURL('/connections', { timeout: 10000 })
  })

  test('blocks unauthenticated access to /discover', async ({ page }) => {
    await page.goto('/discover')
    await expect(page).toHaveURL(/login|onboard/, { timeout: 5000 })
  })

  test('blocks non-admin access to /admin', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/login|403/, { timeout: 5000 })
  })
})
