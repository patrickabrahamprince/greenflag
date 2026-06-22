import { test, expect } from '@playwright/test'
import { loginAs } from '../helpers/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

test.describe('Coins — economy', () => {
  test.beforeEach(async ({ page }) => {
    await supabase.from('coin_transactions').insert({
      user_id: process.env.TEST_MAN_ID,
      type: 'purchase',
      amount: 1000
    })
    await loginAs(page, process.env.TEST_MAN_ID!)
  })

  test('coins page shows balance and packages', async ({ page }) => {
    await page.goto('/coins')
    await expect(page.locator('[data-testid="coin-balance"]')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=399')).toBeVisible()
    await expect(page.locator('text=799')).toBeVisible()
    await expect(page.locator('text=1499')).toBeVisible()
  })

  test('coins page shows transaction history', async ({ page }) => {
    await page.goto('/coins')
    await expect(page.locator('[data-testid="transaction-row"]').first()).toBeVisible({ timeout: 5000 })
  })

  test('tapping buy opens Razorpay modal', async ({ page }) => {
    await page.goto('/coins')
    await page.click('button:has-text("399")')
    await expect(page.locator('iframe[src*="razorpay"], [class*="razorpay"]')).toBeVisible({ timeout: 8000 })
  })
})
