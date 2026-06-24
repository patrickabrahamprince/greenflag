import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

async function audit() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )

  const { data: { users: authUsers } } = await supabase.auth.admin.listUsers()
  const authMap = new Map(authUsers.map(u => [u.id, u.email]))

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, persona, name, is_admin, onboarding_completed')
    .or('persona.eq.man,persona.eq.woman')
    .order('persona', { ascending: true })

  if (error) throw error

  const ids = profiles.map(p => p.id)
  const { data: wallets } = await supabase
    .from('wallets')
    .select('user_id, balance')
    .in('user_id', ids)

  const walletMap = new Map((wallets ?? []).map(w => [w.user_id, w.balance]))

  console.log('email | persona | is_admin | name | onboarding_completed | balance')
  for (const p of profiles) {
    console.log(
      [authMap.get(p.id) ?? 'NO_EMAIL', p.persona, p.is_admin, p.name, p.onboarding_completed, walletMap.get(p.id) ?? null].join(' | '),
    )
  }
}

audit().catch(console.error)
