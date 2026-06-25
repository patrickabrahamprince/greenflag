import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!URL || !KEY?.startsWith('eyJ')) {
  throw new Error('Missing or invalid NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(URL, KEY, { auth: { persistSession: false } })

async function getOrCreateAuthUser(email: string, password: string) {
  const { data: { users } } = await supabase.auth.admin.listUsers()
  const existing = users.find(u => u.email === email)
  if (existing) {
    console.log(`[auth] ${email} already exists (${existing.id}), skipping`)
    return existing
  }
  const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true })
  if (error) throw new Error(`${email} create failed: ${error.message}`)
  if (!data?.user) throw new Error(`${email} create returned no user object`)
  console.log(`[auth] ${email} created (${data.user.id})`)
  return data.user
}

async function seed() {
  console.log('--- Seeding demo users ---\n')

  // 1. Auth users
  const man = await getOrCreateAuthUser('demo-man@quest.local', 'DemoPass123!')
  const woman = await getOrCreateAuthUser('demo-woman@quest.local', 'DemoPass123!')

  // 2. demo-man profile
  const { error: pm } = await supabase.from('profiles').upsert({
    id: man.id,
    name: 'Demo Man',
    persona: 'man',
    coins: 1000,
    photos: ['https://i.pravatar.cc/300?img=1'],
    interests: ['Hiking', 'Music'],
    elo_score: 1000,
    is_active: true,
    onboarding_completed: false,
    is_banned: false,
  }, { onConflict: 'id' })
  if (pm) throw new Error(`demo-man profile upsert failed: ${pm.message}`)
  console.log('[profile] Demo Man upserted')

  // 3. demo-woman profile
  const { error: pw } = await supabase.from('profiles').upsert({
    id: woman.id,
    name: 'Demo Woman',
    persona: 'woman',
    coins: 1000,
    photos: ['https://i.pravatar.cc/300?img=2'],
    interests: ['Hiking', 'Music'],
    elo_score: 1000,
    is_active: true,
    onboarding_completed: false,
    is_banned: false,
  }, { onConflict: 'id' })
  if (pw) throw new Error(`demo-woman profile upsert failed: ${pw.message}`)
  console.log('[profile] Demo Woman upserted')

  // 4. Clear daily_discover_views so new starts don't hit the daily limit
  for (const id of [man.id, woman.id]) {
    await supabase.from('daily_discover_views').delete().eq('man_id', id)
  }
  console.log('[cleanup] daily_discover_views cleared')

  console.log('\n--- Done ---')
  console.log('demo-man@quest.local / DemoPass123!')
  console.log('demo-woman@quest.local / DemoPass123!')
}

seed().catch(err => {
  console.error('FATAL:', err)
  process.exit(1)
})
