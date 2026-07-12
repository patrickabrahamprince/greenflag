import { test, expect } from '@playwright/test'
import { deleteMockData } from '../helpers/cleanup'
import { createTestUserViaAdmin, deleteUserByEmail, adminClient } from '../helpers/db'
import { loginWithCookies } from '../helpers/auth'

const PASSWORD = 'Test1234!'
const E2E_PREFIX = `e2e-matchflow-${Date.now()}`

test.describe('Match-flow happy path (real browser, end to end)', () => {
  test.beforeAll(async () => {
    await deleteMockData()
  })

  test.afterEach(async () => {
    await deleteUserByEmail(`${E2E_PREFIX}-woman@test.com`).catch(() => {})
    await deleteUserByEmail(`${E2E_PREFIX}-man@test.com`).catch(() => {})
    await deleteUserByEmail(`${E2E_PREFIX}-eavesdropper@test.com`).catch(() => {})
  })

  test('woman sets her Standard, man completes all 3 days, chat unlocks, a third account cannot see the conversation', async ({ browser }) => {
    test.slow()
    test.setTimeout(120000)

    const womanEmail = `${E2E_PREFIX}-woman@test.com`
    const manEmail = `${E2E_PREFIX}-man@test.com`
    const eavesdropperEmail = `${E2E_PREFIX}-eavesdropper@test.com`

    const woman = await createTestUserViaAdmin(womanEmail, { persona: 'woman', name: 'E2E Woman' })
    const man = await createTestUserViaAdmin(manEmail, { persona: 'man', name: 'E2E Man' })
    const eavesdropper = await createTestUserViaAdmin(eavesdropperEmail, { persona: 'man', name: 'E2E Eavesdropper' })

    await adminClient.from('profiles').update({ approval_status: 'approved' }).in('id', [woman.id, man.id, eavesdropper.id])
    await adminClient.from('wallets').update({ balance: 1000 }).eq('user_id', man.id)

    const womanPage = await (await browser.newContext()).newPage()
    const manPage = await (await browser.newContext()).newPage()
    const eavesdropperPage = await (await browser.newContext()).newPage()

    // --- Woman: build and save her Standard ---
    await loginWithCookies(womanPage, womanEmail, PASSWORD)
    await womanPage.goto('/standard/builder')
    await womanPage.waitForSelector('textarea', { timeout: 15000 })
    const textareas = womanPage.locator('textarea')
    await expect(textareas).toHaveCount(3, { timeout: 10000 })
    await textareas.nth(0).fill('Tell me about your morning routine')
    await textareas.nth(1).fill('What does a green flag mean to you?')
    await textareas.nth(2).fill('Describe your ideal weekend')
    await womanPage.click('button:has-text("Save & Go Live")')
    await womanPage.waitForURL(/\/my-connections/, { timeout: 15000 })

    const { data: standardRow } = await adminClient.from('standards').select('id, is_active').eq('woman_id', woman.id).maybeSingle()
    expect(standardRow?.is_active).toBe(true)

    // --- Man: enter her queue from Discover (confirm coin deduction) ---
    const balanceBefore = (await adminClient.from('wallets').select('balance').eq('user_id', man.id).single()).data!.balance

    await loginWithCookies(manPage, manEmail, PASSWORD)
    await manPage.goto('/discover')
    await manPage.waitForSelector('[data-testid="profile-card"]', { timeout: 15000 })
    await manPage.click('button:has-text("Meet Her Standard")')
    await manPage.click('button:has-text("Confirm")')
    await manPage.waitForURL(/\/task\//, { timeout: 15000 })

    const balanceAfter = (await adminClient.from('wallets').select('balance').eq('user_id', man.id).single()).data!.balance
    expect(balanceBefore - balanceAfter).toBe(100)

    const matchId = manPage.url().split('/task/')[1]
    expect(matchId).toBeTruthy()

    // --- Days 1-3: man submits, confirm pending_review (not auto-approved), woman approves ---
    for (let day = 1; day <= 3; day++) {
      await manPage.goto(`/task/${matchId}`)
      await manPage.click('button:has-text("Submit Response")')
      await manPage.fill('textarea', `This is my real day ${day} answer, well past the fifty character minimum required to submit.`)
      await manPage.click('button:has-text("Submit")')
      await expect(manPage.getByText('Submitted', { exact: false })).toBeVisible({ timeout: 10000 })

      const { data: matchMidway } = await adminClient.from('matches').select('status').eq('id', matchId).single()
      expect(matchMidway?.status).toBe('pending_review')

      const { data: subs } = await adminClient
        .from('submissions').select('approved').eq('match_id', matchId).eq('day_number', day)
      expect(subs?.every((s) => s.approved !== true)).toBe(true)

      await womanPage.goto(`/task/${matchId}`)
      await womanPage.waitForSelector('button:has-text("Approve")', { timeout: 15000 })
      await womanPage.click('button:has-text("Approve")')
      await womanPage.waitForTimeout(1500)
    }

    const { data: finalMatch } = await adminClient.from('matches').select('status, chat_unlocked').eq('id', matchId).single()
    expect(finalMatch?.chat_unlocked).toBe(true)
    expect(finalMatch?.status).toBe('completed')

    // --- Both can message; a third account cannot see this conversation (RLS) ---
    await manPage.goto('/messages')
    await expect(manPage.getByText('E2E Woman', { exact: false })).toBeVisible({ timeout: 10000 })
    await womanPage.goto('/messages')
    await expect(womanPage.getByText('E2E Man', { exact: false })).toBeVisible({ timeout: 10000 })

    await loginWithCookies(eavesdropperPage, eavesdropperEmail, PASSWORD)
    const rlsResp = await eavesdropperPage.request.get(`/api/matches/${matchId}`)
    expect(rlsResp.status()).toBe(403)
  })
})
