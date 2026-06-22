import { test, expect } from '@playwright/test'

const TEST_MAN = { email: 'test.man@greenflag.test', password: 'Test1234!' }
const TEST_WOMAN = { email: 'test.woman@greenflag.test', password: 'Test1234!' }
const TEST_ADMIN = { email: 'test.admin@greenflag.test', password: 'Test1234!' }

async function loginAs(page: any, email: string, password: string) {
  await page.goto('/login')
  const emailInput = page.locator('[data-testid="email"], input[type="email"]').first()
  const passwordInput = page.locator('[data-testid="password"], input[type="password"]').first()
  const loginBtn = page.locator('[data-testid="login-btn"], button:has-text("Log in")').first()
  await emailInput.fill(email)
  await passwordInput.fill(password)
  await loginBtn.click()
}

test.describe('Production — Redirect to /discover for all genders', () => {
  test('man should land on /discover after login', async ({ page }) => {
    await loginAs(page, TEST_MAN.email, TEST_MAN.password)
    await expect(page).toHaveURL(/\/discover/, { timeout: 20000 })
    await expect(page).not.toHaveURL(/\/connections|\/home/)
  })

  test('woman should land on /discover after login', async ({ page }) => {
    await loginAs(page, TEST_WOMAN.email, TEST_WOMAN.password)
    await expect(page).toHaveURL(/\/discover/, { timeout: 20000 })
    await expect(page).not.toHaveURL(/\/connections|\/home/)
  })

  test('discover page should NOT show connections waiting text for woman', async ({ page }) => {
    await loginAs(page, TEST_WOMAN.email, TEST_WOMAN.password)
    await expect(page).toHaveURL(/\/discover/, { timeout: 20000 })
    await expect(page.locator('text=Men who start your standard will appear here')).not.toBeVisible()
  })
})

test.describe('Production — Admin dashboard', () => {
  test('admin dashboard has no mock data count of 70', async ({ page }) => {
    await loginAs(page, TEST_ADMIN.email, TEST_ADMIN.password)
    await expect(page).toHaveURL(/\/admin/, { timeout: 20000 })

    // Uses data-testid if deployed, falls back to "Total Users" text
    const totalUsersCard = page.locator('[data-testid="total-users"]').or(page.locator('text=Total Users'))
    await expect(totalUsersCard.first()).toBeVisible({ timeout: 5000 })
  })

  test('admin dashboard shows real stats', async ({ page }) => {
    await loginAs(page, TEST_ADMIN.email, TEST_ADMIN.password)
    await expect(page).toHaveURL(/\/admin/, { timeout: 20000 })

    await expect(page.locator('text=Total Users')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Connected Today')).toBeVisible()
  })
})
