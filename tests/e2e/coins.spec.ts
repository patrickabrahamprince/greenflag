import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { adminClient, createTestUserViaAdmin, deleteUserByEmail } from '../helpers/db'
import { loginWithCookies } from '../helpers/auth'

const PASSWORD = 'Test1234!'
const PREFIX = `e2e-coin-${Date.now()}`
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

async function getWalletBalance(userId: string): Promise<number> {
  const { data } = await adminClient.from('wallets').select('balance').eq('user_id', userId).single()
  return data?.balance ?? 0
}

async function countTransactions(userId: string): Promise<number> {
  const { count } = await adminClient.from('transactions').select('*', { count: 'exact', head: true }).eq('user_id', userId)
  return count ?? 0
}

test.describe('Coins', () => {
  let user: { id: string; email: string }

  test.beforeAll(async () => {
    user = await createTestUserViaAdmin(`${PREFIX}-user@test.com`, {
      persona: 'man', name: 'Coin User',
    })
    // Ensure wallet exists (trigger may not fire for admin-created users)
    const { data: existing } = await adminClient
      .from('wallets')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
    if (!existing) {
      await adminClient.from('wallets').insert({ user_id: user.id, balance: 0 })
    }
  })

  test.afterAll(async () => {
    await adminClient.from('transactions').delete().eq('user_id', user.id)
    await adminClient.from('wallets').delete().eq('user_id', user.id)
    await deleteUserByEmail(user.email)
  })

  test('add_coins RPC credits wallet', async () => {
    const before = await getWalletBalance(user.id)

    const { error } = await adminClient.rpc('add_coins', {
      p_user_id: user.id,
      p_amount: 500,
      p_description: 'Test coin purchase',
    })
    expect(error).toBeNull()

    const after = await getWalletBalance(user.id)
    expect(after).toBe(before + 500)
  })

  test('POST /api/coins/deduct decrements balance', async ({ page }) => {
    await loginWithCookies(page, user.email, PASSWORD)

    await adminClient.rpc('add_coins', {
      p_user_id: user.id,
      p_amount: 200,
      p_description: 'Seed for deduct test',
    })
    const before = await getWalletBalance(user.id)

    const res = await page.request.post('/api/coins/deduct', {
      data: { amount: 100, description: 'Test spend' },
    })
    expect(res.status()).toBe(200)

    const after = await getWalletBalance(user.id)
    expect(after).toBe(before - 100)
  })

  test('insufficient funds returns 402 from connection start', async ({ page }) => {
    const poorUser = await createTestUserViaAdmin(`${PREFIX}-poor@test.com`, {
      persona: 'man', name: 'Poor User',
    })
    const { data: pw } = await adminClient.from('wallets').select('id').eq('user_id', poorUser.id).maybeSingle()
    if (!pw) {
      await adminClient.from('wallets').insert({ user_id: poorUser.id, balance: 0 })
    }

    await loginWithCookies(page, poorUser.email, PASSWORD)

    const { data: women } = await adminClient.from('profiles').select('id').eq('persona', 'woman').limit(1)
    if (!women?.length) return

    const res = await page.request.post('/api/connections/start', {
      data: { woman_id: women[0].id },
    })
    expect(res.status()).toBe(402)
    const body = await res.json()
    expect(body.error).toBe('insufficient_funds')

    await deleteUserByEmail(poorUser.email)
  })
})
