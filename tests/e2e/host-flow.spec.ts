import { test, expect } from '@playwright/test'
import { adminClient, createTestUserViaAdmin, deleteUserByEmail } from '../helpers/db'
import { loginWithCookies } from '../helpers/auth'

const PASSWORD = 'Test1234!'
const PREFIX = `e2e-host-${Date.now()}`

test.describe('Host Flow', () => {
  let host: { id: string; email: string }
  let guest: { id: string; email: string }
  let connectionId: string

  test.beforeAll(async () => {
    host = await createTestUserViaAdmin(`${PREFIX}-host@test.com`, {
      persona: 'woman', name: 'Host E2E',
    })
    guest = await createTestUserViaAdmin(`${PREFIX}-guest@test.com`, {
      persona: 'man', name: 'Guest E2E',
    })

    const { data: conn, error: connErr } = await adminClient.from('connections').insert({
      guest_id: guest.id,
      host_id: host.id,
      status: 'tasks_submitted',
      current_day: 1,
      standard_id: null,
      tasks_completed: 8,
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
    }).select('id').single()
    if (connErr) throw new Error(`Connection insert failed: ${connErr.message}`)
    connectionId = conn!.id

    await adminClient.from('submissions').insert({
      connection_id: connectionId,
      task_number: 1,
      content_type: 'text',
      text_content: 'E2E test submission',
      submitted_at: new Date().toISOString(),
    })
  })

  test.afterAll(async () => {
    await adminClient.from('submissions').delete().eq('connection_id', connectionId)
    await adminClient.from('connections').delete().eq('id', connectionId)
    await deleteUserByEmail(host.email)
    await deleteUserByEmail(guest.email)
  })

  test('host approves application, status becomes chat_unlocked', async ({ page }) => {
    await loginWithCookies(page, host.email, PASSWORD)

    const res = await page.request.post(`/api/connections/${connectionId}/review`, {
      data: { approve: true },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)

    const { data: conn } = await adminClient
      .from('connections')
      .select('status')
      .eq('id', connectionId)
      .single()
    expect(conn?.status).toBe('chat_unlocked')
  })

  test('guest sees connection on /my-connections after approval', async ({ page }) => {
    await loginWithCookies(page, guest.email, PASSWORD)

    await page.goto('/my-connections')
    await page.waitForURL(/\/my-connections/, { timeout: 10000 })
    const section = page.locator('text=Host E2E').first()
    await expect(section).toBeVisible({ timeout: 5000 })
  })
})
