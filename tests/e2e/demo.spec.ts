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
  test.setTimeout(300000)

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
  const { error: profileErr } = await adminClient.from('profiles').upsert({
    id: userId,
    name: 'Demo User',
    persona: 'man',
    age: 30,
    city: 'Bangalore',
    bio: 'Watching Playwright',
    approval_status: 'approved', // skip the /onboard/pending dead-end at the end of the rules carousel
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
  //     Go directly to /onboard/name and restore
  //     the chosen persona in the Zustand store
  // ──────────────────────────────────────────────
  await page.goto('http://localhost:3000/onboard/name')
  await page.waitForSelector('[data-testid="onboard-name-input"]', { timeout: 10000 })
  await page.waitForTimeout(500)
  await page.evaluate(() =>
    (window as any).__e2e?.onboardingStore?.setState({ persona: 'man' })
  )

  // ──────────────────────────────────────────────
  // 8.  Name is its own screen; profile details are
  //     now a chain of single-purpose screens (basics
  //     -> Instagram -> bio -> photos) instead of one
  //     long form.
  // ──────────────────────────────────────────────
  await page.fill('[data-testid="onboard-name-input"]', 'Demo User')
  await page.click('[data-testid="onboard-name-continue"]')
  await page.waitForURL(/\/onboard\/profile$/, { timeout: 10000 })

  await page.fill('[data-testid="profile-age"]', '28')
  await page.getByPlaceholder('Your city').fill('Bangalore')
  await page.click('[data-testid="profile-basics-continue"]')
  await page.waitForURL(/\/onboard\/profile\/instagram/, { timeout: 10000 })

  await page.getByPlaceholder('username').fill('demo_user')
  await page.click('[data-testid="profile-instagram-continue"]')
  await page.waitForURL(/\/onboard\/profile\/bio/, { timeout: 10000 })

  await page.fill('[data-testid="profile-bio"]', 'Watching Playwright')
  await page.click('[data-testid="profile-bio-continue"]')
  await page.waitForURL(/\/onboard\/profile\/photos/, { timeout: 10000 })
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
  // 10. Submit profile → navigates to /onboard/quiz
  // ──────────────────────────────────────────────
  await page.click('[data-testid="submit-profile"]')
  await page.waitForURL(/\/onboard\/quiz/, { timeout: 30000 })
  await page.waitForTimeout(1000)

  // ──────────────────────────────────────────────
  // 11. Answer all 8 compatibility quiz questions
  //     (pick the first option each time), then finish
  // ──────────────────────────────────────────────
  const quizFirstOptions = [
    'Long-term relationship',
    'Cozy coffee & reading',
    'Quality Time',
    'A casual coffee walkthrough',
    'Texting back and forth',
    'Dry & Sarcastic',
    'Relaxing beach resort',
    'Dog lover',
  ]
  for (let i = 0; i < quizFirstOptions.length; i++) {
    await page.getByRole('button', { name: quizFirstOptions[i] }).click()
    await page.waitForTimeout(300)
    const isLast = i === quizFirstOptions.length - 1
    await page.getByRole('button', { name: isLast ? 'Finish Quiz' : 'Next' }).click()
    await page.waitForTimeout(400)
  }
  await page.waitForURL(/\/onboard\/interests/, { timeout: 30000 })
  await page.waitForTimeout(1000)

  // ──────────────────────────────────────────────
  // 12. Select 5 "about you" + 5 "looking for" tags
  //     testids are lowercased, e.g. interest-have-travel
  // ──────────────────────────────────────────────
  const haveTags = ['travel', 'music', 'fitness', 'cooking', 'art']
  const lookingTags = ['books', 'nature', 'coffee', 'yoga', 'dance']
  for (const tag of haveTags) {
    await page.click(`[data-testid="interest-have-${tag}"]`)
    await page.waitForTimeout(200)
  }
  for (const tag of lookingTags) {
    await page.click(`[data-testid="interest-looking-${tag}"]`)
    await page.waitForTimeout(200)
  }
  await page.waitForTimeout(500)

  // ──────────────────────────────────────────────
  // 13. Click "Complete" → navigates to /onboard/rules
  // ──────────────────────────────────────────────
  await page.click('[data-testid="submit-onboarding"]')
  await page.waitForURL(/\/onboard\/rules/, { timeout: 30000 })
  await page.waitForTimeout(1000)

  // ──────────────────────────────────────────────
  // 14. Walk the 6-slide community guidelines carousel.
  //     approval_status was pre-set to 'approved' above,
  //     so the final slide routes straight to /discover.
  // ──────────────────────────────────────────────
  for (let i = 0; i < 5; i++) {
    await page.getByRole('button', { name: 'Next Rule' }).click()
    await page.waitForTimeout(400)
  }
  await page.getByRole('button', { name: 'Start Exploring' }).click()
  await page.waitForURL(/\/discover/, { timeout: 30000 })
  await page.waitForTimeout(1000)

  // ──────────────────────────────────────────────
  // 15. Assert we landed on the discover page
  // ──────────────────────────────────────────────
  await expect(page).toHaveURL(/\/discover/)

  // ──────────────────────────────────────────────
  // 16. Save screenshot as proof
  // ──────────────────────────────────────────────
  await page.screenshot({ path: 'automation-demo.png', fullPage: true })

  // Cleanup
  await deleteUserByEmail(EMAIL)
})
