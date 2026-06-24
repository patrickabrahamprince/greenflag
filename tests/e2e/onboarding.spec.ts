import { test, expect } from '@playwright/test'
import { deleteMockData } from '../helpers/cleanup'
import { createTestUserViaAdmin, deleteUserByEmail, getProfile, adminClient } from '../helpers/db'
import { loginWithCookies, TEST_ACCOUNTS } from '../helpers/auth'

const PASSWORD = 'Test1234!'
const E2E_PREFIX = `e2e-onboard-${Date.now()}`

test.describe('Onboarding', () => {
  test.beforeAll(async () => {
    await deleteMockData()
    const { error: bucketErr } = await adminClient.storage.createBucket('avatars', { public: true })
    if (bucketErr && !bucketErr.message?.includes('already exists')) {
      console.warn('Could not create avatars bucket:', bucketErr.message)
    }
  })

  test.afterEach(async () => {
    await deleteUserByEmail(`${E2E_PREFIX}-woman@test.com`).catch(() => {})
    await deleteUserByEmail(`${E2E_PREFIX}-admin-view@test.com`).catch(() => {})
  })

  test('woman completes full onboarding', async ({ page }) => {
    test.slow()
    test.setTimeout(90000)

    const email = `${E2E_PREFIX}-woman@test.com`

    const { id } = await createTestUserViaAdmin(email, {
      persona: 'woman',
      name: 'Sarah E2E',
    })
    await adminClient.from('profiles').update({ onboarding_completed: false }).eq('id', id)

    let profile = await getProfile(id)
    expect(profile.onboarding_completed).toBe(false)
    expect(profile.persona).toBe('woman')

    await loginWithCookies(page, email, PASSWORD)

    await page.goto('/discover')
    await page.waitForURL(/\/onboard/, { timeout: 15000 })
    await expect(page).toHaveURL(/\/onboard/)

    await page.click('[data-testid="persona-woman"]')
    await page.waitForURL(/\/onboard\//, { timeout: 10000 })

    // Navigate client-side: go directly to profile and restore Zustand store
    await page.goto('/onboard/profile')
    await page.waitForSelector('[data-testid="profile-name"]', { timeout: 10000 })
    await expect(page).toHaveURL(/\/onboard\/profile/)
    await page.evaluate(() => (window as any).__e2e?.onboardingStore?.setState({ persona: 'woman' }))

    await page.fill('[data-testid="profile-name"]', 'Sarah E2E')
    await page.fill('[data-testid="profile-age"]', '28')
    await page.fill('[data-testid="profile-city"]', 'Bangalore')
    await page.fill('[data-testid="profile-bio"]', 'E2E test bio')

    const fixture = 'tests/fixtures/test-photo.jpg'
    await page.setInputFiles('[data-testid="photo-upload"]', [fixture, fixture, fixture])

    // Intercept Supabase Storage upload — RLS prevents real uploads
    await page.route('**/storage/v1/object/avatars/**', async (route) => {
      const url = route.request().url()
      const path = url.split('/object/avatars/')[1]
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ Key: path }),
      })
    })

    await page.click('[data-testid="submit-profile"]')
    await page.waitForURL(/\/onboard\/interests/, { timeout: 30000 })
    await expect(page).toHaveURL(/\/onboard\/interests/)

    const haveInterests = ['Travel', 'Cooking', 'Yoga', 'Books', 'Music']
    for (const interest of haveInterests) {
      await page.click(`[data-testid="interest-have-${interest}"]`)
    }

    const lookingInterests = ['Fitness', 'Art', 'Tech', 'Cinema', 'Nature']
    for (const interest of lookingInterests) {
      await page.click(`[data-testid="interest-looking-${interest}"]`)
    }

    await page.click('[data-testid="submit-onboarding"]')
    await page.waitForURL(/\/discover/, { timeout: 30000 })
    await expect(page).toHaveURL(/\/discover/)

    profile = await getProfile(id)
    expect(profile.onboarding_completed).toBe(true)
  })

  test('admin views newly onboarded user', async ({ page }) => {
    test.slow()
    test.setTimeout(60000)

    const email = `${E2E_PREFIX}-admin-view@test.com`
    const { id } = await createTestUserViaAdmin(email, {
      persona: 'woman',
      name: 'Sarah E2E',
    })
    await adminClient.from('profiles').update({
      interests_have: ['Travel', 'Cooking', 'Yoga', 'Books', 'Music'],
      interests_looking_for: ['Fitness', 'Art', 'Tech', 'Cinema', 'Nature'],
      bio: 'E2E test bio',
    }).eq('id', id)

    await page.goto('/login')
    await page.fill('[data-testid="email"]', TEST_ACCOUNTS.admin.email)
    await page.fill('[data-testid="password"]', PASSWORD)
    await page.click('[data-testid="login-btn"]')
    await page.waitForURL(/\/admin/, { timeout: 15000 })
    await expect(page).toHaveURL(/\/admin/)

    await page.goto('/admin/users')
    await page.waitForSelector('[data-testid="users-table"]', { timeout: 10000 })
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible({ timeout: 10000 })

    const profile = await getProfile(id)
    expect(profile).not.toBeNull()
    expect(profile.bio).toBe('E2E test bio')
    expect(profile.interests_have).toContain('Travel')

    await page.getByText('Sarah E2E').first().click()
    await page.waitForURL(/\/admin\/users\//, { timeout: 10000 })
    await expect(page).toHaveURL(/\/admin\/users\//)
  })
})
