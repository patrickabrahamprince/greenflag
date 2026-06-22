import { test, expect } from '@playwright/test'
import { loginAs } from '../helpers/auth'

test.describe('Admin — No mock/seed data', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, process.env.TEST_ADMIN_ID!)
  })

  test('admin dashboard should not show mock data count of 70', async ({ page }) => {
    await page.goto('/admin')
    const totalUsersCard = page.locator('[data-testid="total-users"]')
    await expect(totalUsersCard).toBeVisible({ timeout: 5000 })

    // Check the total-users card does NOT contain '70' (the old mock count)
    await expect(totalUsersCard).not.toContainText('70')

    // Sanity check: total users should be a reasonable number for a test env
    const totalUsersText = await totalUsersCard.locator('p.text-3xl').textContent()
    const totalUsers = parseInt(totalUsersText || '0', 10)
    expect(totalUsers).toBeGreaterThanOrEqual(3)
    expect(totalUsers).toBeLessThan(20)
  })

  test('connected today should not show old mock value of 10', async ({ page }) => {
    await page.goto('/admin')
    const connectedTodayCard = page.locator('[data-testid="connected-today"]')
    await expect(connectedTodayCard).toBeVisible({ timeout: 5000 })
    await expect(connectedTodayCard).not.toContainText('10')
  })

  test('admin stats labels are correct (hosts=women, guests=men)', async ({ page }) => {
    await page.goto('/admin')
    const totalUsersCard = page.locator('[data-testid="total-users"]')
    await expect(totalUsersCard).toBeVisible({ timeout: 5000 })

    // The subtitle shows "X men / Y women" - get the full text
    const subtitle = totalUsersCard.locator('p.text-\\[10px\\]')
    const subtitleText = await subtitle.textContent() || ''

    // Parse the subtitle: e.g. "2 men / 1 women"
    const match = subtitleText.match(/(\d+)\s+men\s*\/\s*(\d+)\s+women/)
    expect(match).not.toBeNull()
    if (match) {
      const menCount = parseInt(match[1], 10)
      const womenCount = parseInt(match[2], 10)
      expect(menCount).toBeGreaterThanOrEqual(1)
      expect(womenCount).toBeGreaterThanOrEqual(1)
    }
  })

  test('users page loads without errors', async ({ page }) => {
    await page.goto('/admin/users')
    await expect(page.locator('[data-testid="users-tab"]')).toBeVisible({ timeout: 5000 })
    // The page should show a user table or list
    await expect(page.locator('text=Email').or(page.locator('text=Name').or(page.locator('table')))).toBeVisible({ timeout: 5000 })
  })
})
