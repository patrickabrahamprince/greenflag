// Run: npx tsx scripts/seed-test-users.ts
// Then login at /login with test-man@local.dev / testpass123
// Visit /test-feed - should only see Test Woman
// Logout, login with test-woman@local.dev / testpass123
// Visit /test-feed - should only see Test Man

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!URL || !KEY?.startsWith('eyJ')) {
  throw new Error('Missing or invalid NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(URL, KEY, { auth: { persistSession: false } })

const USERS = [
  {
    email: 'test-man@local.dev',
    password: 'testpass123',
    profile: {
      name: 'Test Man',
      persona: 'man',
      gender: 'man',
      onboarding_completed: true,
      elo_score: 1000,
    },
  },
  {
    email: 'test-woman@local.dev',
    password: 'testpass123',
    profile: {
      name: 'Test Woman',
      persona: 'woman',
      gender: 'woman',
      onboarding_completed: true,
      elo_score: 1000,
      photos: ['https://i.pravatar.cc/300?img=4'],
      interests: ['Fitness', 'Cooking', 'Travel'],
    },
  },
] as const

async function seed() {
  console.log('--- Seeding test users ---\n')

  for (const u of USERS) {
    const { data: { users } } = await supabase.auth.admin.listUsers()
    let user = users.find(x => x.email === u.email)

    if (user) {
      console.log(`[auth] ${u.email} (${user.id}) already exists`)
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
      })
      if (error) throw new Error(`${u.email} create failed: ${error.message}`)
      user = data!.user
      console.log(`[auth] ${u.email} created (${user.id})`)
    }

    const { error: pErr } = await supabase.from('profiles').upsert({
      id: user.id,
      ...u.profile,
    }, { onConflict: 'id' })
    if (pErr) throw new Error(`${u.email} profile upsert failed: ${pErr.message}`)
    console.log(`[profile] ${u.profile.name} upserted`)
  }

  console.log('\n--- Done ---')
  for (const u of USERS) {
    console.log(`${u.email} / ${u.password}`)
  }
}

seed().catch(err => {
  console.error('FATAL:', err)
  process.exit(1)
})
