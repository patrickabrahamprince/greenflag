import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

/*
 * Seeds 3 test users that are SAFE from cleanup.ts's isMockEmail filter.
 * Cleanup only deletes users matching:
 *   - endsWith('@test.com')
 *   - endsWith('@example.com')
 *   - startsWith('test-guest-') && endsWith('@greenflag.app')
 *   - startsWith('test-host-') && endsWith('@greenflag.app')
 *   - specific hardcoded emails (musigoevents@gmail.com, test8@gmail.com, etc.)
 *
 * @quest.local domain is NOT caught by any of these patterns.
 *
 * Run: npx tsx scripts/seed-demo-users.ts
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!URL || !KEY?.startsWith('eyJ')) {
  throw new Error('Missing or invalid SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(URL, KEY, { auth: { persistSession: false } })

async function getOrCreateAuthUser(email: string, password: string) {
  const { data: { users } } = await supabase.auth.admin.listUsers()
  const existing = users.find(u => u.email === email)
  if (existing) {
    console.log(`${email} already exists (${existing.id}), skipping auth creation`)
    return existing
  }
  const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true })
  if (error) throw new Error(`${email} auth create failed: ${error.message}`)
  console.log(`${email} created (${data.id})`)
  return data.user
}

async function seedDemoUsers() {
  console.log('Seeding demo users...\n')

  const man = await getOrCreateAuthUser('demo-man@quest.local', 'DemoPass123!')
  const woman = await getOrCreateAuthUser('demo-woman@quest.local', 'DemoPass123!')
  const admin = await getOrCreateAuthUser('demo-admin@quest.local', 'DemoPass123!')

  // ── demo-man ──────────────────────────────────────
  console.log('man auth id:', man.id)

  await supabase.from('users').upsert({
    id: man.id, persona: 'man', name: 'Demo Man', phone: null,
  })
  await supabase.from('profiles').upsert({
    id: man.id, persona: 'man', name: 'Demo Man',
    gender: 'man', onboarding_completed: true,
    is_active: true, is_banned: false, elo_score: 1000,
    interests: ['Hiking', 'Music'],
  })
  await supabase.from('wallets').upsert({
    user_id: man.id, balance: 1000,
  })
  console.log('  -> demo-man@quest.local / DemoPass123! | 1000 coins')

  // ── demo-woman ────────────────────────────────────
  await supabase.from('users').upsert({
    id: woman.id, persona: 'woman', name: 'Demo Woman', phone: null,
  })
  await supabase.from('profiles').upsert({
    id: woman.id, persona: 'woman', name: 'Demo Woman',
    gender: 'woman', onboarding_completed: true,
    is_active: true, is_banned: false, elo_score: 1000,
    interests: ['Hiking', 'Music'],
    photos: ['https://i.pravatar.cc/400?u=demo-woman'],
  })
  await supabase.from('wallets').upsert({
    user_id: woman.id, balance: 0,
  })
  // Active 8-day standard
  await supabase.from('standards').delete().eq('user_id', woman.id)
  await supabase.from('standards').insert({
    user_id: woman.id,
    woman_id: woman.id,
    intentions: {
      title: 'My Standard',
      description: '8-day quest',
      tasks: Array.from({ length: 8 }, (_, i) => ({
        day: i + 1,
        task: 1,
        prompt: `Day ${i + 1}: Complete this task`,
        proof_type: 'text',
      })),
    },
    is_active: true,
    active: true,
  })
  console.log('  -> demo-woman@quest.local / DemoPass123! | 0 coins | 8-day standard active')

  // ── demo-admin ────────────────────────────────────
  // persona is an enum type user_role — only 'man'/'woman' allowed.
  // Admin status comes from profiles.is_admin = true.
  await supabase.from('users').upsert({
    id: admin.id, persona: 'man', name: 'Demo Admin', phone: null,
  })
  await supabase.from('profiles').upsert({
    id: admin.id, persona: 'man', name: 'Demo Admin',
    gender: 'man', is_admin: true, onboarding_completed: true,
  })
  await supabase.from('wallets').upsert({
    user_id: admin.id, balance: 9999,
  })
  console.log('  -> demo-admin@quest.local / DemoPass123! | 9999 coins | is_admin=true')

  console.log('\n✅ Demo users seeded. They will NOT be deleted by cleanup().')
  console.log('   Credentials: {email} / DemoPass123!')
}

seedDemoUsers().catch((err) => {
  console.error('❌', err)
  process.exit(1)
})
