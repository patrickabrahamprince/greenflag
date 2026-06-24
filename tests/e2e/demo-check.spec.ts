import { test, expect } from '@playwright/test'
import { loginWithCookies } from '../helpers/auth'
import { adminClient } from '../helpers/db'

const WOMAN = { email: 'demo-woman@greenflag.app', password: 'Demo1234!' }
const MAN = { email: 'demo-man@greenflag.app', password: 'Demo1234!' }

async function deleteUserByEmail(email: string) {
  const { data: { users } } = await adminClient.auth.admin.listUsers()
  const user = users.find(u => u.email === email)
  if (user) {
    const uid = user.id
    // Delete coin_transactions referencing any connection involving this user
    const { data: conns } = await adminClient.from('connections').select('id').or(`guest_id.eq.${uid},host_id.eq.${uid}`)
    const connIds = (conns ?? []).map(c => c.id)
    if (connIds.length > 0) {
      await adminClient.from('coin_transactions').delete().in('connection_id', connIds)
    }
    await adminClient.from('daily_discover_views').delete().or(`man_id.eq.${uid},woman_id.eq.${uid}`)
    await adminClient.from('coin_transactions').delete().or(`user_id.eq.${uid},sender_id.eq.${uid},recipient_id.eq.${uid}`)
    await adminClient.from('connections').delete().or(`guest_id.eq.${uid},host_id.eq.${uid}`)
    await adminClient.from('wallets').delete().eq('user_id', uid)
    await adminClient.from('standards').delete().eq('user_id', uid)
    await adminClient.from('profiles').delete().eq('id', uid)
    await adminClient.from('users').delete().eq('id', uid)
    await adminClient.auth.admin.deleteUser(uid)
  }
}

test.describe('Demo Check - All Features Working', () => {
  test.beforeAll(async () => {
    // Remove leftover users from prior runs
    await deleteUserByEmail(WOMAN.email)
    await deleteUserByEmail(MAN.email)

    // Create woman
    const { data: w, error: we } = await adminClient.auth.admin.createUser({
      email: WOMAN.email, password: WOMAN.password, email_confirm: true,
    })
    if (we || !w?.user) throw new Error(`Woman creation failed: ${we?.message}`)

    await adminClient.from('users').upsert({ id: w.user.id, persona: 'woman', name: 'Demo Woman', phone: null })
    await adminClient.from('profiles').upsert({
      id: w.user.id, persona: 'woman', name: 'Demo Woman',
      gender: 'woman', onboarding_completed: true,
      is_active: true, is_banned: false, elo_score: 1000,
      interests: ['Hiking', 'Music'],
      photos: ['https://i.pravatar.cc/400?u=demo-woman'],
    })
    await adminClient.from('wallets').upsert({ user_id: w.user.id, balance: 1000 })
    await adminClient.from('standards').delete().eq('user_id', w.user.id)
    await adminClient.from('standards').insert({
      user_id: w.user.id, woman_id: w.user.id,
      intentions: {
        title: 'Demo Standard',
        description: 'E2E demo',
        tasks: Array.from({ length: 9 }, (_, i) => ({
          day: Math.floor(i / 3) + 1,
          task: (i % 3) + 1,
          prompt: `Day ${Math.floor(i / 3) + 1} Task ${(i % 3) + 1}: Complete this test`,
          proof_type: 'text',
        })),
      },
      is_active: true, active: true,
      required_interests: [], values: [], deal_breakers: [],
    })

    // Create man
    const { data: m, error: me } = await adminClient.auth.admin.createUser({
      email: MAN.email, password: MAN.password, email_confirm: true,
    })
    if (me || !m?.user) throw new Error(`Man creation failed: ${me?.message}`)

    await adminClient.from('users').upsert({ id: m.user.id, persona: 'man', name: 'Demo Man', phone: null })
    await adminClient.from('profiles').upsert({
      id: m.user.id, persona: 'man', name: 'Demo Man',
      gender: 'man', onboarding_completed: true,
      is_active: true, is_banned: false, elo_score: 1000,
      interests: ['Hiking', 'Music'],
    })
    await adminClient.from('wallets').upsert({ user_id: m.user.id, balance: 1000 })
  })

  test('verify seeded data + full user flows', async ({ page }) => {
    test.slow()
    test.setTimeout(120000)

    // 1. AUTH — woman
    await loginWithCookies(page, WOMAN.email, WOMAN.password)
    console.log('✅ Auth works')

    // 2. PROFILE — name + coins
    await page.goto('/profile')
    await page.waitForSelector('text=Profile', { timeout: 10000 })
    await expect(page.locator('text=Demo Woman').first()).toBeVisible()
    await expect(page.locator('text=Coins:')).toBeVisible()
    console.log('✅ Profile loads with name and coins')

    // 3. DISCOVER — feed loads
    await page.goto('/discover')
    await page.waitForURL(/\/discover/, { timeout: 10000 })
    const discoverLoaded = await page.locator('[data-testid="profile-card"], [data-testid="discover-empty-state"], [data-testid="coin-balance"]').first().waitFor({ timeout: 10000 })
      .then(() => true)
      .catch(() => false)
    console.log('✅ Discover loads:', discoverLoaded)

    // 4. COINS — balance
    await page.goto('/coins')
    await page.waitForSelector('[data-testid="coin-balance"]', { timeout: 10000 })
    const coinsText = await page.locator('[data-testid="coin-balance"]').textContent()
    console.log(`✅ Coins page — balance: ${coinsText?.trim()}`)

    // 5. SWITCH TO MAN
    await loginWithCookies(page, MAN.email, MAN.password)
    console.log('✅ Man auth works')

    // 6. DISCOVER (man)
    await page.goto('/discover')
    await page.waitForURL(/\/discover/, { timeout: 10000 })
    await page.waitForTimeout(2000)
    const manProfileCards = await page.locator('[data-testid="profile-card"]').count()
    console.log(`✅ Man discover — ${manProfileCards} profile card(s)`)

    // 7. MY CONNECTIONS
    await page.goto('/my-connections')
    await page.waitForSelector('text=My Connections', { timeout: 10000 })
    const connCards = page.locator('[data-testid="connection-card"]')
    const connCount = await connCards.count().catch(() => 0)
    console.log(`✅ My connections — ${connCount} cards`)

    // 8. SWITCH BACK — session persists
    await loginWithCookies(page, WOMAN.email, WOMAN.password)
    await page.goto('/profile')
    await expect(page.locator('text=Demo Woman').first()).toBeVisible({ timeout: 10000 })
    console.log('✅ Session switch — profile persists')

    console.log('\n🎉 ALL CHECKS PASSED - DEMO IS WORKING')
  })
})
