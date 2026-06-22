import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function isMockEmail(email: string | null): boolean {
  if (!email) return true
  if (email === 'musigoevents@gmail.com') return true
  if (email === '919738339793@app.greenflag') return true
  if (email === 'test8@gmail.com') return true
  if (email.startsWith('test-guest-') && email.endsWith('@greenflag.app')) return true
  if (email.startsWith('test-host-') && email.endsWith('@greenflag.app')) return true
  return false
}

export async function getMockUsers(): Promise<{ id: string; email: string | null }[]> {
  const { data, error } = await supabase.auth.admin.listUsers()
  if (error) throw new Error(`Failed to list users: ${error.message}`)
  return data.users.filter(u => isMockEmail(u.email)).map(u => ({ id: u.id, email: u.email }))
}

export async function deleteMockData() {
  const mockUsers = await getMockUsers()
  const mockIds = mockUsers.map(u => u.id)

  console.log(`[cleanup] Found ${mockUsers.length} mock auth users`)

  // Clean FK-referencing tables for mock user IDs
  for (const id of mockIds) {
    await safeDelete('daily_discover_views', id, ['man_id', 'woman_id'])
    await safeDelete('reports', id, ['reporter_id', 'reported_id'])
    await safeDelete('audit_logs', id, ['admin_id'])
    await safeDelete('admin_actions', id, ['admin_id'])
    await safeDelete('freeze_transactions', id, ['man_id'])
    await safeDelete('mod_queue', id, ['reviewed_by'])
  }

  // Delete mock auth users (cascades to profiles, wallets, transactions)
  for (const user of mockUsers) {
    const { error } = await supabase.auth.admin.deleteUser(user.id)
    if (error) console.warn(`[cleanup] Failed to delete ${user.email ?? user.id}: ${error.message}`)
  }

  // Delete orphan profiles (profiles with no corresponding auth.users)
  // These can exist from partial previous cleanups where auth.users
  // were deleted but profiles remained (unlikely with CASCADE, but possible)
  const { data: remainingAuth } = await supabase.auth.admin.listUsers()
  const validAuthIds = new Set(remainingAuth?.users.map(u => u.id) ?? [])
  const { data: allProfiles } = await supabase.from('profiles').select('id')
  const orphanProfileIds = (allProfiles ?? [])
    .filter(p => !validAuthIds.has(p.id))
    .map(p => p.id)

  if (orphanProfileIds.length > 0) {
    console.log(`[cleanup] Deleting ${orphanProfileIds.length} orphan profiles`)
    for (const id of orphanProfileIds) {
      await safeDelete('daily_discover_views', id, ['man_id', 'woman_id'])
      await safeDelete('reports', id, ['reporter_id', 'reported_id'])
      await safeDelete('audit_logs', id, ['admin_id'])
      await safeDelete('admin_actions', id, ['admin_id'])
      await safeDelete('freeze_transactions', id, ['man_id'])
    }
    const { error } = await supabase.from('profiles').delete().in('id', orphanProfileIds)
    if (error) console.warn('[cleanup] Orphan profile delete error:', error.message)
  }

  const totalDeleted = mockIds.length + orphanProfileIds.length
  console.log(`[cleanup] Done. Deleted ${totalDeleted} total records (${mockIds.length} auth, ${orphanProfileIds.length} orphan profiles).`)
  return { mockIds, orphanProfileIds }
}

async function safeDelete(table: string, id: string, columns: string[]) {
  for (const col of columns) {
    const { error } = await supabase.from(table as never).delete().eq(col as never, id)
    if (error && !error.message.includes('relation') && !error.message.includes('does not exist')) {
      console.warn(`[cleanup] ${table} warning: ${error.message}`)
    }
  }
}
