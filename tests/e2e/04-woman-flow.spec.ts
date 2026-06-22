import { test, expect } from '@playwright/test'
import { loginAs } from '../helpers/auth'
import { createTestConnection } from '../helpers/db'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

test.describe('Woman — Standard Builder', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, process.env.TEST_WOMAN_ID!)
  })

  test('standard builder shows 8 day slots', async ({ page }) => {
    await page.goto('/standard/builder')
    await expect(page.locator('[data-testid="day-slot"]')).toHaveCount(8, { timeout: 5000 })
  })

  test('tapping day slot opens bottom sheet', async ({ page }) => {
    await page.goto('/standard/builder')
    await page.locator('[data-testid="day-slot"]').first().click()
    await expect(page.locator('[data-testid="intention-editor"]')).toBeVisible()
  })

  test('Set Active button enabled with complete slots', async ({ page }) => {
    await page.goto('/standard/builder')
    const setActiveBtn = page.locator('button:has-text("Set Active")')
    await expect(setActiveBtn).toBeEnabled({ timeout: 5000 })
  })

  test('Set Active redirects to /connections', async ({ page }) => {
    await page.goto('/standard/builder')
    await page.click('button:has-text("Set Active")')
    await expect(page).toHaveURL('/connections', { timeout: 10000 })
  })
})

test.describe('Woman — Review flow', () => {
  let connectionId: string

  test.beforeEach(async ({ page }) => {
    connectionId = await createTestConnection(
      process.env.TEST_MAN_ID!,
      process.env.TEST_WOMAN_ID!
    )
    await loginAs(page, process.env.TEST_WOMAN_ID!)
  })

  test('connections feed shows pending connection', async ({ page }) => {
    await page.goto('/connections')
    await expect(page.locator('[data-testid="connection-card"]').first()).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Test Man')).toBeVisible()
  })

  test('review page shows submission and approve/reject buttons', async ({ page }) => {
    await supabase.from('submissions').update({
      status: 'pending_review',
      media_type: 'text',
      text_content: 'My Day 1 submission text here for testing purposes.'
    }).eq('connection_id', connectionId)

    await page.goto(`/review/${connectionId}`)
    await expect(page.locator('text=My Day 1 submission')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('button:has-text("Approve")')).toBeVisible()
    await expect(page.locator('button:has-text("Reject")')).toBeVisible()
  })

  test('approving advances connection to Day 2', async ({ page }) => {
    await supabase.from('submissions').update({
      status: 'pending_review',
      media_type: 'text',
      text_content: 'Submission text for approve test.'
    }).eq('connection_id', connectionId)

    await page.goto(`/review/${connectionId}`)
    await page.click('button:has-text("Approve")')
    await expect(page).toHaveURL('/connections', { timeout: 5000 })

    const { data } = await supabase
      .from('connections').select('current_day').eq('id', connectionId).single()
    expect(data!.current_day).toBe(2)
  })

  test('rejecting ends connection', async ({ page }) => {
    await supabase.from('submissions').update({
      status: 'pending_review',
      media_type: 'text',
      text_content: 'Submission text for reject test.'
    }).eq('connection_id', connectionId)

    await page.goto(`/review/${connectionId}`)
    await page.click('button:has-text("Reject")')
    await expect(page).toHaveURL('/connections', { timeout: 5000 })

    const { data } = await supabase
      .from('connections').select('status').eq('id', connectionId).single()
    expect(data!.status).toBe('ended')
  })
})
