import { test, expect } from '@playwright/test'
import { loginAs } from '../helpers/auth'
import { createTestConnection } from '../helpers/db'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

test.describe('Admin — Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, process.env.TEST_ADMIN_ID!)
  })

  test('admin overview loads with stats', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.locator('[data-testid="stats-card"]').first()).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Total Users')).toBeVisible()
  })

  test('non-admin cannot access /admin', async ({ page }) => {
    await loginAs(page, process.env.TEST_MAN_ID!)
    await page.goto('/admin')
    await expect(page).toHaveURL(/login|403/, { timeout: 5000 })
  })

  test('users page shows test users', async ({ page }) => {
    await page.goto('/admin/users')
    await expect(page.locator('text=Test Man')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Test Woman')).toBeVisible()
  })

  test('can ban and unban a user', async ({ page }) => {
    await page.goto('/admin')
    await page.goto(`/admin/users/${process.env.TEST_MAN_ID}`)
    await page.click('button:has-text("Ban")')
    await page.fill('input[placeholder*="reason"], textarea[placeholder*="reason"]', 'Test ban reason')
    await page.click('button:has-text("Confirm")')
    await expect(page.locator('text=Banned')).toBeVisible({ timeout: 5000 })

    await page.click('button:has-text("Unban")')
    await expect(page.locator('text=Active')).toBeVisible({ timeout: 5000 })

    const { data } = await supabase.from('profiles').select('is_banned').eq('id', process.env.TEST_MAN_ID!).single()
    expect(data!.is_banned).toBe(false)
  })

  test('connections page shows test connection', async ({ page }) => {
    await createTestConnection(process.env.TEST_MAN_ID!, process.env.TEST_WOMAN_ID!)
    await page.goto('/admin/connections')
    await expect(page.locator('text=Test Man')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Test Woman')).toBeVisible()
  })

  test('analytics page renders', async ({ page }) => {
    await page.goto('/admin/analytics')
    await expect(page.locator('text=Analytics')).toBeVisible({ timeout: 8000 })
  })

  test('audit log loads', async ({ page }) => {
    await page.goto('/admin/audit')
    await expect(page.locator('text=Audit Log')).toBeVisible({ timeout: 5000 })
  })

  test('moderation queue loads', async ({ page }) => {
    await page.goto('/admin/queue')
    await expect(page).toHaveURL('/admin/queue')
  })
})
