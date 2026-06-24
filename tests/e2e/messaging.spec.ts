import { test, expect } from '@playwright/test'
import { adminClient, createTestUserViaAdmin, deleteUserByEmail } from '../helpers/db'
import { loginWithCookies } from '../helpers/auth'

const PASSWORD = 'Test1234!'
const PREFIX = `e2e-msg-${Date.now()}`

test.describe('Messaging', () => {
  let userA: { id: string; email: string }
  let userB: { id: string; email: string }
  let connectionId: string

  test.beforeAll(async () => {
    userA = await createTestUserViaAdmin(`${PREFIX}-a@test.com`, { persona: 'man', name: 'User A' })
    userB = await createTestUserViaAdmin(`${PREFIX}-b@test.com`, { persona: 'woman', name: 'User B' })

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
  })

  test.afterAll(async () => {
    await adminClient.from('messages').delete().eq('connection_id', connectionId)
    await adminClient.from('connections').delete().eq('id', connectionId)
    await deleteUserByEmail(userA.email)
    await deleteUserByEmail(userB.email)
  })

  test('User A sends message, row appears in DB with correct connection_id', async ({ page }) => {
    await loginWithCookies(page, userA.email, PASSWORD)

    const res = await page.request.post('/api/messages', {
      data: { connection_id: connectionId, content: 'Hello from A!' },
    })
    expect(res.status()).toBe(200)
    const msg = await res.json()
    expect(msg.connection_id).toBe(connectionId)
    expect(msg.sender_id).toBe(userA.id)
    expect(msg.content).toBe('Hello from A!')

    const { data: messages } = await adminClient
      .from('messages')
      .select('*')
      .eq('connection_id', connectionId)
    expect(messages?.some(m => m.content === 'Hello from A!')).toBe(true)
  })
})
