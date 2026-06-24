import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function adminClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
}

function isMockEmail(email: string | null): boolean {
  if (!email) return true
  if (email === 'musigoevents@gmail.com') return true
  if (email === '919738339793@app.greenflag') return true
  if (email === 'test8@gmail.com') return true
  if (email.startsWith('test-guest-') && email.endsWith('@greenflag.app')) return true
  if (email.startsWith('test-host-') && email.endsWith('@greenflag.app')) return true
  if (email.endsWith('@test.com')) return true
  if (email.endsWith('@example.com')) return true
  return false
}

export async function getMockUsers(): Promise<{ id: string; email: string | null }[]> {
  const supabase = adminClient()
  const { data, error } = await supabase.auth.admin.listUsers()
  if (error) throw new Error(`Failed to list users: ${error.message}`)
  return data.users.filter(u => isMockEmail(u.email)).map(u => ({ id: u.id, email: u.email }))
}

export async function deleteMockData() {
  const supabase = adminClient()

  // 1. Collect all mock user IDs
  const { data: users } = await supabase.auth.admin.listUsers()
  const mockUsers = users.users.filter(u => isMockEmail(u.email))
  const ids = mockUsers.map(u => u.id)
  console.log(`[cleanup] Found ${ids.length} mock auth users`)

  // 2. Delete child rows first (dependency order), bulk where possible
  const idList = ids.join(',')

  await safeDeleteMulti('daily_discover_views', ids, ['man_id', 'woman_id'])
  await safeDeleteMulti('reports', ids, ['reporter_id', 'reported_id'])
  await safeDeleteMulti('audit_logs', ids, ['admin_id'])
  await safeDeleteMulti('admin_actions', ids, ['admin_id'])
  await safeDeleteMulti('freeze_transactions', ids, ['man_id'])
  await safeDeleteMulti('mod_queue', ids, ['reviewed_by'])
  await supabase.from('messages').delete().in('sender_id', ids)
  await supabase.from('coin_transactions').delete().in('user_id', ids)
  // Also delete coin_transactions that reference connections we're about to drop
  const { data: conns } = await supabase
    .from('connections')
    .select('id')
    .or(`guest_id.in.(${ids.join(',')}),host_id.in.(${ids.join(',')})`)
  if (conns && conns.length > 0) {
    const connIds = conns.map(c => c.id)
    await supabase.from('coin_transactions').delete().in('connection_id', connIds)
  }
  await supabase.from('connections').delete().or(
    `guest_id.in.(${ids.join(',')}),host_id.in.(${ids.join(',')})`
  )
  await supabase.from('wallets').delete().in('user_id', ids)
  await supabase.from('profiles').delete().in('id', ids)

  // 3. Delete auth users last
  for (const id of ids) {
    const { error } = await supabase.auth.admin.deleteUser(id)
    if (error) console.warn(`[cleanup] Failed to delete user ${id}: ${error.message}`)
  }

  // 4. Clean up orphan profiles (profiles with no auth user)
  const { data: remainingAuth } = await supabase.auth.admin.listUsers()
  const validAuthIds = new Set(remainingAuth?.users.map(u => u.id) ?? [])
  const { data: allProfiles } = await supabase.from('profiles').select('id')
  const orphanIds = (allProfiles ?? [])
    .filter(p => !validAuthIds.has(p.id))
    .map(p => p.id)

  if (orphanIds.length > 0) {
    console.log(`[cleanup] Deleting ${orphanIds.length} orphan profiles`)
    await safeDeleteMulti('daily_discover_views', orphanIds, ['man_id', 'woman_id'])
    await safeDeleteMulti('reports', orphanIds, ['reporter_id', 'reported_id'])
    await safeDeleteMulti('audit_logs', orphanIds, ['admin_id'])
    await safeDeleteMulti('admin_actions', orphanIds, ['admin_id'])
    await safeDeleteMulti('freeze_transactions', orphanIds, ['man_id'])
    await supabase.from('profiles').delete().in('id', orphanIds)
  }

  console.log(`[cleanup] Done. Deleted ${ids.length + orphanIds.length} records total.`)
  return { mockIds: ids, orphanProfileIds: orphanIds }
}

async function safeDeleteMulti(table: string, ids: string[], columns: string[]) {
  const supabase = adminClient()
  for (const col of columns) {
    const { error } = await supabase.from(table as never).delete().in(col as never, ids)
    if (error && !error.message.includes('relation') && !error.message.includes('does not exist')) {
      console.warn(`[cleanup] ${table} warning: ${error.message}`)
    }
  }
}
