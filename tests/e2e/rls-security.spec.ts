import { test, expect } from '@playwright/test'
import { adminClient, createTestUserViaAdmin, deleteUserByEmail } from '../helpers/db'
import { loginWithCookies } from '../helpers/auth'

const PASSWORD = 'Test1234!'
const PREFIX = `e2e-rls-${Date.now()}`

test.describe('RLS Security', () => {
  let userA: { id: string; email: string }
  let userB: { id: string; email: string }
  let userC: { id: string; email: string }
  let connectionId: string

  test.beforeAll(async () => {
    userA = await createTestUserViaAdmin(`${PREFIX}-a@test.com`, { persona: 'man', name: 'RLS A' })
    userB = await createTestUserViaAdmin(`${PREFIX}-b@test.com`, { persona: 'woman', name: 'RLS B' })
    userC = await createTestUserViaAdmin(`${PREFIX}-c@test.com`, { persona: 'man', name: 'RLS C' })

    const { data: conn, error: connErr } = await adminClient.from('connections').insert({
      guest_id: userA.id,
      host_id: userB.id,
      status: 'chat_unlocked',
      current_day: 1,
      standard_id: null,
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
    }).select('id').single()
    if (connErr) throw new Error(`Connection insert failed: ${connErr.message}`)
    connectionId = conn!.id

    await adminClient.from('messages').insert([
      { connection_id: connectionId, sender_id: userA.id, content: 'Secret A-B message' },
    ])
  })

  test.afterAll(async () => {
    await adminClient.from('messages').delete().eq('connection_id', connectionId)
    await adminClient.from('connections').delete().eq('id', connectionId)
    await deleteUserByEmail(userA.email)
    await deleteUserByEmail(userB.email)
    await deleteUserByEmail(userC.email)
  })

  test('User C cannot POST to /api/messages for A-B thread', async ({ page }) => {
    await loginWithCookies(page, userC.email, PASSWORD)

    const res = await page.request.post('/api/messages', {
      data: { connection_id: connectionId, content: 'C snooping' },
    })
    expect(res.status()).toBe(403)
  })
})
