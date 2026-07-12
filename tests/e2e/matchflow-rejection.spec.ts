import { test, expect } from '@playwright/test'
import { deleteMockData } from '../helpers/cleanup'
import { createTestUserViaAdmin, deleteUserByEmail, adminClient } from '../helpers/db'
import { loginWithCookies } from '../helpers/auth'

const PASSWORD = 'Test1234!'
const E2E_PREFIX = `e2e-matchflow-reject-${Date.now()}`

test.describe('Match-flow rejection path (real browser, end to end)', () => {
  test.beforeAll(async () => {
    await deleteMockData()
  })

  test.afterEach(async () => {
    await deleteUserByEmail(`${E2E_PREFIX}-woman@test.com`).catch(() => {})
    await deleteUserByEmail(`${E2E_PREFIX}-man@test.com`).catch(() => {})
  })

  test('man is rejected on day 1 -- terminal state, no resubmission, no coin refund', async ({ browser }) => {
    test.slow()
    test.setTimeout(60000)

    const womanEmail = `${E2E_PREFIX}-woman@test.com`
    const manEmail = `${E2E_PREFIX}-man@test.com`

    const woman = await createTestUserViaAdmin(womanEmail, { persona: 'woman', name: 'E2E Reject Woman' })
    const man = await createTestUserViaAdmin(manEmail, { persona: 'man', name: 'E2E Reject Man' })
    await adminClient.from('profiles').update({ approval_status: 'approved' }).in('id', [woman.id, man.id])
    await adminClient.from('wallets').update({ balance: 1000 }).eq('user_id', man.id)

    const womanPage = await (await browser.newContext()).newPage()
    const manPage = await (await browser.newContext()).newPage()

    await loginWithCookies(womanPage, womanEmail, PASSWORD)
    await womanPage.goto('/standard/builder')
    await womanPage.waitForSelector('textarea', { timeout: 15000 })
    const textareas = womanPage.locator('textarea')
    await textareas.nth(0).fill('Tell me about your morning routine')
    await textareas.nth(1).fill('What does a green flag mean to you?')
    await textareas.nth(2).fill('Describe your ideal weekend')
    await womanPage.click('button:has-text("Save & Go Live")')
    await womanPage.waitForURL(/\/my-connections/, { timeout: 15000 })

    await loginWithCookies(manPage, manEmail, PASSWORD)
    await manPage.goto('/discover')
    await manPage.waitForSelector('[data-testid="profile-card"]', { timeout: 15000 })
    await manPage.click('button:has-text("Meet Her Standard")')
    await manPage.click('button:has-text("Confirm")')
    await manPage.waitForURL(/\/task\//, { timeout: 15000 })
    const matchId = manPage.url().split('/task/')[1]

    await manPage.click('button:has-text("Submit Response")')
    await manPage.fill('textarea', 'This is my real day 1 answer, well past the fifty character minimum required to submit here.')
    await manPage.click('button:has-text("Submit")')
    await expect(manPage.getByText('Submitted', { exact: false })).toBeVisible({ timeout: 10000 })

    const balanceBeforeReject = (await adminClient.from('wallets').select('balance').eq('user_id', man.id).single()).data!.balance

    await womanPage.goto(`/task/${matchId}`)
    await womanPage.waitForSelector('button:has-text("Reject")', { timeout: 15000 })
    await womanPage.click('button:has-text("Reject")')
    await womanPage.waitForTimeout(1500)

    const balanceAfterReject = (await adminClient.from('wallets').select('balance').eq('user_id', man.id).single()).data!.balance
    expect(balanceAfterReject).toBe(balanceBeforeReject) // no refund on rejection

    const { data: matchAfter } = await adminClient.from('matches').select('status').eq('id', matchId).single()
    expect(matchAfter?.status).toBe('rejected')

    // Man should see the terminal "ended" screen, not another submission form.
    await manPage.goto(`/task/${matchId}`)
    await expect(manPage.getByText('Submit Response')).toHaveCount(0)

    // Direct API bypass attempt: he tries to submit again anyway.
    const resubmitResp = await manPage.request.post(`/api/matches/${matchId}/submit-task`, {
      data: { task_number: 1, text: 'trying again after rejection', media_type: 'text' },
    })
    expect(resubmitResp.status()).toBe(400)
  })
})
