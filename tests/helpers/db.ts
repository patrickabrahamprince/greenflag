import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function countAuthUsers(): Promise<number> {
  const { data, error } = await supabase.auth.admin.listUsers()
  if (error) throw new Error(`countAuthUsers failed: ${error.message}`)
  return data.users.length
}

export async function countProfiles(): Promise<number> {
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
  if (error) throw new Error(`countProfiles failed: ${error.message}`)
  return count ?? 0
}

export async function getUserByEmail(email: string) {
  const { data, error } = await supabase.auth.admin.listUsers()
  if (error) throw new Error(`getUserByEmail failed: ${error.message}`)
  return data.users.find(u => u.email === email) ?? null
}

export type CreatedUser = { id: string; email: string }

export async function createTestUserViaAdmin(
  email: string,
  options?: { isAdmin?: boolean; persona?: string; name?: string }
): Promise<CreatedUser> {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: 'Test1234!',
    email_confirm: true,
  })
  if (error || !data.user) throw new Error(`createUser failed for ${email}: ${error?.message}`)

  const { error: profileErr } = await supabase.from('profiles').insert({
    id: data.user.id,
    name: options?.name ?? email.split('@')[0],
    persona: options?.persona ?? 'man',
    age: 25,
    city: 'Bangalore',
    bio: 'Test bio',
    onboarding_completed: true,
    is_admin: options?.isAdmin ?? false,
  })
  if (profileErr) {
    await supabase.auth.admin.deleteUser(data.user.id).catch(() => {})
    throw new Error(`profile insert failed for ${email}: ${profileErr.message}`)
  }

  return { id: data.user.id, email }
}

export async function deleteUserByEmail(email: string) {
  const user = await getUserByEmail(email)
  if (!user) return
  const { error } = await supabase.auth.admin.deleteUser(user.id)
  if (error) console.warn(`deleteUserByEmail warning for ${email}: ${error.message}`)
}

export async function getProfile(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()
  if (error && error.code !== 'PGRST116') throw new Error(`getProfile failed: ${error.message}`)
  return data
}

export async function getDailyDiscoverViews(ids?: string[]) {
  let query = supabase.from('daily_discover_views').select('*')
  if (ids) query = query.or(`man_id.in.(${ids.join(',')}),woman_id.in.(${ids.join(',')})`)
  const { data, error } = await query
  if (error) throw new Error(`getDailyDiscoverViews failed: ${error.message}`)
  return data ?? []
}

export async function getReports(ids?: string[]) {
  let query = supabase.from('reports').select('*')
  if (ids) query = query.or(`reporter_id.in.(${ids.join(',')}),reported_id.in.(${ids.join(',')})`)
  const { data, error } = await query
  if (error) throw new Error(`getReports failed: ${error.message}`)
  return data ?? []
}

export async function getAuditLogs(ids?: string[]) {
  let query = supabase.from('audit_logs').select('*')
  if (ids) query = query.in('admin_id', ids)
  const { data, error } = await query
  if (error) throw new Error(`getAuditLogs failed: ${error.message}`)
  return data ?? []
}

export async function getMessages(ids?: string[]) {
  let query = supabase.from('messages').select('*')
  if (ids) query = query.in('sender_id', ids)
  const { data, error } = await query
  if (error) throw new Error(`getMessages failed: ${error.message}`)
  return data ?? []
}

export async function getProfileIdsForIds(ids: string[]): Promise<string[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .in('id', ids)
  if (error) throw new Error(`getProfileIdsForIds failed: ${error.message}`)
  return data?.map(p => p.id) ?? []
}

export { supabase as adminClient }
