import { test, expect } from '@playwright/test'
import { deleteMockData } from '../helpers/cleanup'
import { adminClient, countAuthUsers } from '../helpers/db'

const MAN_EMAIL = 'test.man@greenflag.test'
const WOMAN_EMAIL = 'test.woman@greenflag.test'
const ADMIN_EMAIL = 'test.admin@greenflag.test'
const PASSWORD = 'Test1234!'

test.describe('Daily Discover', () => {
  test.beforeAll(async () => {
    await deleteMockData()
  })

  test.describe('database integrity', () => {
    test('all man_id and woman_id in daily_discover_views reference existing profiles', async () => {
      const { data: views } = await adminClient
        .from('daily_discover_views')
        .select('man_id, woman_id')

      if (!views || views.length === 0) return

      const allReferencedIds = new Set<string>()
      for (const v of views) {
        if (v.man_id) allReferencedIds.add(v.man_id)
        if (v.woman_id) allReferencedIds.add(v.woman_id)
      }

      const { data: profiles } = await adminClient
        .from('profiles')
        .select('id')
        .in('id', [...allReferencedIds])

      const existingIds = new Set(profiles?.map(p => p.id) ?? [])
      for (const id of allReferencedIds) {
        expect(existingIds.has(id)).toBe(true)
      }
    })
  })

  test.describe('discover page for man', () => {
    test('man can reach discover page after login', async ({ page }) => {
      await page.goto('/login')
      await page.fill('[data-testid="email"]', MAN_EMAIL)
      await page.fill('[data-testid="password"]', PASSWORD)
      await page.click('[data-testid="login-btn"]')
      await page.waitForURL(/\/discover/, { timeout: 15000 })
      await expect(page).toHaveURL(/\/discover/)
    })
  })

  test.describe('discover page for woman', () => {
    test('woman can reach discover page after login', async ({ page }) => {
      await page.goto('/login')
      await page.fill('[data-testid="email"]', WOMAN_EMAIL)
      await page.fill('[data-testid="password"]', PASSWORD)
      await page.click('[data-testid="login-btn"]')
      await page.waitForURL(/\/discover/, { timeout: 15000 })
      await expect(page).toHaveURL(/\/discover/)
    })
  })

  test.describe('admin dashboard shows correct counts', () => {
    test('total users on dashboard is a reasonable number', async ({ page }) => {
      await page.goto('/login')
      await page.fill('[data-testid="email"]', ADMIN_EMAIL)
      await page.fill('[data-testid="password"]', PASSWORD)
      await page.click('[data-testid="login-btn"]')
      await page.waitForURL(/\/admin/, { timeout: 15000 })

      const totalUsersCard = page.locator('[data-testid="total-users"]')
      await expect(totalUsersCard).toBeVisible({ timeout: 10000 })

      const text = await totalUsersCard.textContent()
      const match = text?.match(/(\d+)/)
      expect(match).not.toBeNull()
      if (match) {
        const count = parseInt(match[1], 10)
        expect(count).toBeGreaterThanOrEqual(4)
        expect(count).toBeLessThan(70)
      }
    })

    test('dashboard does not show old mock data values (70 or 10)', async ({ page }) => {
      await page.goto('/login')
      await page.fill('[data-testid="email"]', ADMIN_EMAIL)
      await page.fill('[data-testid="password"]', PASSWORD)
      await page.click('[data-testid="login-btn"]')
      await page.waitForURL(/\/admin/, { timeout: 15000 })

      await expect(page.locator('[data-testid="total-users"]')).toBeVisible({ timeout: 10000 })
      await expect(page.locator('[data-testid="total-users"]')).not.toContainText('70')
      await expect(page.locator('[data-testid="total-users"]')).not.toContainText('10')
    })
  })
})
