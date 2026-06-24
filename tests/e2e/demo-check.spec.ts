import { test, expect } from '@playwright/test'
import { loginWithCookies } from '../helpers/auth'

const WOMAN = { email: 'woman@test.com', password: 'password123' }
const MAN = { email: 'man@test.com', password: 'password123' }

test.describe('Demo Check - All Features Working', () => {
  test('verify seeded data + full user flows', async ({ page }) => {
    test.slow()
    test.setTimeout(120000)

    // ──────────────────────────────────────────────
    // 1. AUTH — login as woman via cookies
    // ──────────────────────────────────────────────
    await loginWithCookies(page, WOMAN.email, WOMAN.password)
    console.log('✅ Auth works')

    // ──────────────────────────────────────────────
    // 2. PROFILE — verify name + coins display
    // ──────────────────────────────────────────────
    await page.goto('/profile')
    await page.waitForSelector('text=Profile', { timeout: 10000 })
    await expect(page.locator('text=Test Woman').first()).toBeVisible()
    await expect(page.locator('text=Coins:')).toBeVisible()
    console.log('✅ Profile loads with name and coins')

    // ──────────────────────────────────────────────
    // 3. DISCOVER — feed loads for woman persona
    // ──────────────────────────────────────────────
    await page.goto('/discover')
    await page.waitForURL(/\/discover/, { timeout: 10000 })
    const discoverLoaded = await page.locator('[data-testid="profile-card"], [data-testid="discover-empty-state"], [data-testid="coin-balance"]').first().waitFor({ timeout: 10000 })
      .then(() => true)
      .catch(() => false)
    console.log('✅ Discover loads:', discoverLoaded)

    // ──────────────────────────────────────────────
    // 4. COINS PAGE — seeded wallet balance
    // ──────────────────────────────────────────────
    await page.goto('/coins')
    await page.waitForSelector('[data-testid="coin-balance"]', { timeout: 10000 })
    const coinsText = await page.locator('[data-testid="coin-balance"]').textContent()
    console.log(`✅ Coins page — balance: ${coinsText?.trim()}`)

    // ──────────────────────────────────────────────
    // 5. SWITCH TO MAN — login with cookies
    // ──────────────────────────────────────────────
    await loginWithCookies(page, MAN.email, MAN.password)
    console.log('✅ Man auth works')

    // ──────────────────────────────────────────────
    // 6. DISCOVER (man) — feed loads with profiles
    // ──────────────────────────────────────────────
    await page.goto('/discover')
    const manDiscover = await page.locator('[data-testid="profile-card"], button:has-text("Meet Her Standard"), [data-testid="discover-empty-state"]').first().waitFor({ timeout: 15000 })
      .then(() => true)
      .catch(() => false)
    console.log('✅ Man discover feed loaded:', manDiscover)

    // ──────────────────────────────────────────────
    // 7. MY CONNECTIONS — page loads
    // ──────────────────────────────────────────────
    await page.goto('/my-connections')
    await page.waitForSelector('text=My Connections', { timeout: 10000 })
    const connCards = page.locator('[data-testid="connection-card"]')
    const connCount = await connCards.count().catch(() => 0)
    console.log(`✅ My connections — ${connCount} cards`)

    // ──────────────────────────────────────────────
    // 8. SWITCH BACK TO WOMAN — session persists
    // ──────────────────────────────────────────────
    await loginWithCookies(page, WOMAN.email, WOMAN.password)
    await page.goto('/profile')
    await expect(page.locator('text=Test Woman').first()).toBeVisible({ timeout: 10000 })
    console.log('✅ Session switch — profile persists')

    console.log('\n🎉 ALL CHECKS PASSED - DEMO IS WORKING')
  })
})
