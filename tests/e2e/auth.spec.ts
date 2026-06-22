import { test, expect } from '@playwright/test'
import { deleteMockData } from '../helpers/cleanup'
import { createTestUserViaAdmin, deleteUserByEmail, getProfile, countAuthUsers } from '../helpers/db'
import { loginWithCookies, TEST_ACCOUNTS } from '../helpers/auth'

const TEST_PASSWORD = 'Test1234!'
const SIGNUP_EMAIL = 'e2e-signup-test@greenflag.test'

test.describe('Authentication', () => {
  test.beforeAll(async () => {
    await deleteMockData()
  })

  test.describe('signup flow for new user', () => {
    test.afterEach(async () => {
      await deleteUserByEmail(SIGNUP_EMAIL).catch(() => {})
    })

    test('create new user via admin API and verify profile is created', async () => {
      const { id } = await createTestUserViaAdmin(SIGNUP_EMAIL, {
        persona: 'man',
        name: 'E2E Signup Test',
      })

      const profile = await getProfile(id)
      expect(profile).not.toBeNull()
      expect(profile.id).toBe(id)
      expect(profile.name).toBe('E2E Signup Test')
      expect(profile.persona).toBe('man')
      expect(profile.onboarding_completed).toBe(true)
    })

    test('browser login works with newly created user via API cookies', async ({ page }) => {
      await createTestUserViaAdmin(SIGNUP_EMAIL, {
        persona: 'woman',
        name: 'E2E Login Test',
      })

      // Inject Supabase auth cookies directly into the browser context
      // This bypasses the need to fill in the login form and handles
      // the SSR cookie format that middleware expects.
      await loginWithCookies(page, SIGNUP_EMAIL, TEST_PASSWORD)

      await page.goto('/discover')
      await page.waitForURL(/\/discover/, { timeout: 15000 })
      await expect(page).toHaveURL(/\/discover/)
    })

    test('daily discover page renders for newly created woman user', async ({ page }) => {
      await createTestUserViaAdmin(SIGNUP_EMAIL, {
        persona: 'woman',
        name: 'E2E Discover Test',
      })

      await loginWithCookies(page, SIGNUP_EMAIL, TEST_PASSWORD)

      await page.goto('/discover')
      await page.waitForURL(/\/discover/, { timeout: 15000 })

      const discoverSection = page.locator('[data-testid="discover-empty-state"], [data-testid="discover-profiles"]')
      await expect(discoverSection).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('login for existing real users', () => {
    test('man can log in via UI and reach discover page', async ({ page }) => {
      await page.goto('/login')
      await page.fill('[data-testid="email"]', TEST_ACCOUNTS.man.email)
      await page.fill('[data-testid="password"]', TEST_PASSWORD)
      await page.click('[data-testid="login-btn"]')
      await page.waitForURL(/\/discover/, { timeout: 15000 })
      await expect(page).toHaveURL(/\/discover/)
    })

    test('woman can log in via UI and reach discover page', async ({ page }) => {
      await page.goto('/login')
      await page.fill('[data-testid="email"]', TEST_ACCOUNTS.woman.email)
      await page.fill('[data-testid="password"]', TEST_PASSWORD)
      await page.click('[data-testid="login-btn"]')
      await page.waitForURL(/\/discover/, { timeout: 15000 })
      await expect(page).toHaveURL(/\/discover/)
    })

    test('admin can log in via UI and reach admin dashboard', async ({ page }) => {
      await page.goto('/login')
      await page.fill('[data-testid="email"]', TEST_ACCOUNTS.admin.email)
      await page.fill('[data-testid="password"]', TEST_PASSWORD)
      await page.click('[data-testid="login-btn"]')
      await page.waitForURL(/\/admin/, { timeout: 15000 })
      await expect(page).toHaveURL(/\/admin/)
    })

    test('invalid credentials do not redirect to discover or admin', async ({ page }) => {
      await page.goto('/login')
      await page.fill('[data-testid="email"]', TEST_ACCOUNTS.man.email)
      await page.fill('[data-testid="password"]', 'wrong-password-123!')
      await page.click('[data-testid="login-btn"]')
      await page.waitForTimeout(3000)
      expect(page.url()).not.toContain('/discover')
      expect(page.url()).not.toContain('/admin')
      expect(page.url()).toContain('/login')
    })
  })

  test.describe('user count integrity', () => {
    test('creating and deleting a user via admin API keeps count stable', async () => {
      const before = await countAuthUsers()

      await createTestUserViaAdmin('count-test@greenflag.test', {
        persona: 'man',
        name: 'Count Test',
      })
      expect(await countAuthUsers()).toBe(before + 1)

      await deleteUserByEmail('count-test@greenflag.test')
      expect(await countAuthUsers()).toBe(before)
    })
  })
})
