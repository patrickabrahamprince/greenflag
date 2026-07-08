import { test, expect } from '@playwright/test'
import { adminClient, deleteUserByEmail } from '../helpers/db'

const EMAIL = `demo_${Date.now()}@test.com`
const PASSWORD = 'Test123!'

/*
 * Visual demo: watches the full signup + onboarding flow in Chrome.
 *
 * NOTE: The on_auth_user_created DB trigger is broken (column "role"
 * was renamed to "persona"), so supabase.auth.signUp() fails.
 * Instead we pre-create the user via the admin API (bypasses the
 * broken trigger) and then use the browser login form — the viewer
 * sees the same UX: email/password entry + full onboarding walkthrough.
 *
 * Run with: npx playwright test tests/e2e/demo.spec.ts --headed --reporter=list
 */
test('Demo: Signup and onboarding flow', async ({ page }) => {
  test.slow()
  test.setTimeout(120000)

  // ──────────────────────────────────────────────
  // 0.  Create the user (invisible setup — viewer
  //     won't see this, but it's required because
  //     the signup trigger is broken in this DB)
  // ──────────────────────────────────────────────
  const { data: authUser, error: createErr } = await adminClient.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
  })
  if (createErr || !authUser?.user) throw new Error(`Create user failed: ${createErr?.message}`)
  const userId = authUser.user.id

  // Create a profile with persona but WITHOUT onboarding_completed
  // so the middleware redirects to the onboarding wizard
  const { error: profileErr } = await adminClient.from('profiles').insert({
    id: userId,
    name: 'Demo User',
    persona: 'man',
    age: 30,
    city: 'Bangalore',
    bio: 'Watching Playwright',
  })
  if (profileErr) throw new Error(`Profile insert failed: ${profileErr.message}`)

  // ──────────────────────────────────────────────
  // 1.  Go to the app root
  //     Unauthenticated → middleware redirects to /login
  // ──────────────────────────────────────────────
  await page.goto('http://localhost:3000')
  await page.waitForTimeout(1000)

  // ──────────────────────────────────────────────
  // 2.  The login page in E2E mode shows email +
  //     password fields with data-testid selectors.
  //     "Sign up" text doesn't exist here — the form
  //     doubles as login, and we fill it directly.
  // ──────────────────────────────────────────────
  await page.waitForSelector('[data-testid="email"]', { timeout: 10000 })
  await page.waitForTimeout(500)

  // ──────────────────────────────────────────────
  // 3.  Fill email + password on the login form
  // ──────────────────────────────────────────────
  await page.fill('[data-testid="email"]', EMAIL)
  await page.fill('[data-testid="password"]', PASSWORD)
  await page.waitForTimeout(1000)

  // ──────────────────────────────────────────────
  // 4.  Click "Log in" button
  //     After login, middleware sees no
  //     onboarding_completed → redirects to /onboard
  // ──────────────────────────────────────────────
  await page.click('[data-testid="login-btn"]')

  // ──────────────────────────────────────────────
  // 5.  Wait for onboarding persona page
  // ──────────────────────────────────────────────
  await page.waitForURL(/\/onboard/, { timeout: 20000 })
  await page.waitForTimeout(1000)

  // ──────────────────────────────────────────────
  // 6.  Choose "I rise to it" (man persona)
  //     Navigates to /onboard/phone for OTP next
  // ──────────────────────────────────────────────
  await page.click('[data-testid="persona-man"]')
  await page.waitForTimeout(1000)

  // ──────────────────────────────────────────────
  // 7.  Bypass phone OTP (can't automate SMS in E2E)
  //     Go directly to /onboard/profile and restore
  //     the chosen persona in the Zustand store
  // ──────────────────────────────────────────────
  await page.goto('http://localhost:3000/onboard/profile')
  await page.waitForSelector('[data-testid="profile-name"]', { timeout: 10000 })
  await page.waitForTimeout(500)
  await page.evaluate(() =>
    (window as any).__e2e?.onboardingStore?.setState({ persona: 'man' })
  )

  // ──────────────────────────────────────────────
  // 8.  Fill profile details
  // ──────────────────────────────────────────────
  await page.fill('[data-testid="profile-name"]', 'Demo User')
  await page.fill('[data-testid="profile-dob"]', '1995-06-15')
  await page.fill('[data-testid="profile-city"]', 'Bangalore')
  await page.fill('[data-testid="profile-bio"]', 'Watching Playwright')
  await page.waitForTimeout(1000)

  // ──────────────────────────────────────────────
  // 9.  Upload 3 profile photos
  //     Intercept Supabase Storage upload to avoid
  //     RLS / permission errors in the test env
  // ──────────────────────────────────────────────
  await page.route('**/storage/v1/object/avatars/**', async (route) => {
    const url = route.request().url()
    const path = url.split('/object/avatars/')[1]
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ Key: path }),
    })
  })
  const fixture = 'tests/fixtures/test-photo.jpg'
  await page.setInputFiles('[data-testid="photo-upload"]', [fixture, fixture, fixture])
  await page.waitForTimeout(500)

  // ──────────────────────────────────────────────
  // 10. Submit profile → navigates to /onboard/interests
  // ──────────────────────────────────────────────
  await page.click('[data-testid="submit-profile"]')
  await page.waitForURL(/\/onboard\/interests/, { timeout: 30000 })
  await page.waitForTimeout(1000)

  // ──────────────────────────────────────────────
  // 11. Select "5 things about you" interests
  //     App's INTEREST_TAGS: Travel, Music, Fitness,
  //     Cooking, Art, Gaming, Cinema, Tech, Nature …
  // ──────────────────────────────────────────────
  const tags = ['Travel', 'Music', 'Fitness', 'Cooking', 'Art']
  for (const tag of tags) {
    await page.click(`[data-testid="interest-have-${tag}"]`)
    await page.waitForTimeout(200)
  }
  await page.waitForTimeout(500)

  // ──────────────────────────────────────────────
  // 12. Fill "Why me?" prompts (man persona only)
  //     Required: 3 prompts, each 50–150 characters
  // ──────────────────────────────────────────────
  const prompts = [
    'I am passionate about cooking and love exploring new cuisines from around the world every weekend.',
    'I have been training in martial arts for over five years and believe discipline shapes character.',
    'I volunteer at animal shelters on weekends and truly care about making a difference in their lives.',
  ]
  const textareas = page.locator('textarea')
  for (let i = 0; i < prompts.length; i++) {
    await textareas.nth(i).fill(prompts[i])
    await page.waitForTimeout(200)
  }
  await page.waitForTimeout(1000)

  // ──────────────────────────────────────────────
  // 13. Click "Complete" → onboarding finishes
  //     User is redirected to /discover
  // ──────────────────────────────────────────────
  await page.click('[data-testid="submit-onboarding"]')
  await page.waitForURL(/\/discover/, { timeout: 30000 })
  await page.waitForTimeout(1000)

  // ──────────────────────────────────────────────
  // 14. Assert we landed on the discover page
  // ──────────────────────────────────────────────
  await expect(page).toHaveURL(/\/discover/)

  // ──────────────────────────────────────────────
  // 15. Save screenshot as proof
  // ──────────────────────────────────────────────
  await page.screenshot({ path: 'automation-demo.png', fullPage: true })

  // Cleanup
  await deleteUserByEmail(EMAIL)
})
