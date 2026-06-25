import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!URL || !KEY?.startsWith('eyJ')) {
  throw new Error('Missing or invalid NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(URL, KEY, { auth: { persistSession: false } })

const DEMOS = [
  {
    email: 'demo-man@quest.local',
    phone: '+15555551234',
    password: 'DemoPass123!',
    profile: {
      name: 'Demo Man',
      persona: 'man',
      coins: 1000,
      photos: ['https://i.pravatar.cc/300?img=1'],
      interests: ['Hiking', 'Music'],
      elo_score: 1000,
      is_active: true,
      onboarding_completed: false,
      is_banned: false,
    },
  },
  {
    email: 'demo-woman@quest.local',
    phone: '+15555555678',
    password: 'DemoPass123!',
    profile: {
      name: 'Demo Woman',
      persona: 'woman',
      coins: 1000,
      photos: ['https://i.pravatar.cc/300?img=2'],
      interests: ['Hiking', 'Music'],
      elo_score: 1000,
      is_active: true,
      onboarding_completed: false,
      is_banned: false,
    },
  },
]

async function seed() {
  console.log('--- Seeding demo users ---\n')

  for (const demo of DEMOS) {
    // 1. Get or create auth user
    const { data: { users } } = await supabase.auth.admin.listUsers()
    let user = users.find(u => u.email === demo.email)

    if (user) {
      console.log(`[auth] ${demo.email} (${user.id}) exists`)
      // Ensure phone is set on the auth user
      if (user.phone !== demo.phone) {
        const { error: updErr } = await supabase.auth.admin.updateUserById(user.id, { phone: demo.phone })
        if (updErr) throw new Error(`Failed to set phone on ${demo.email}: ${updErr.message}`)
        console.log(`[auth] Phone set to ${demo.phone}`)
      }
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: demo.email,
        phone: demo.phone,
        password: demo.password,
        email_confirm: true,
      })
      if (error) throw new Error(`${demo.email} create failed: ${error.message}`)
      if (!data?.user) throw new Error(`${demo.email} created but no user returned`)
      user = data.user
      console.log(`[auth] ${demo.email} / ${demo.phone} created (${user.id})`)
    }

    // 2. Upsert profile
    const { error: pErr } = await supabase.from('profiles').upsert({
      id: user.id,
      ...demo.profile,
    }, { onConflict: 'id' })
    if (pErr) throw new Error(`${demo.email} profile upsert failed: ${pErr.message}`)
    console.log(`[profile] ${demo.profile.name} upserted`)
  }

  // 3. Clear daily_discover_views for all demo users
  const { data: { users: allUsers } } = await supabase.auth.admin.listUsers()
  const demoIds = allUsers.filter(u => u.email?.startsWith('demo-')).map(u => u.id)
  for (const id of demoIds) {
    await supabase.from('daily_discover_views').delete().eq('man_id', id)
  }
  console.log('[cleanup] daily_discover_views cleared')

  console.log('\n--- Done ---')
  for (const d of DEMOS) {
    console.log(`${d.phone} / OTP 123456 (${d.email})`)
  }
}

seed().catch(err => {
  console.error('FATAL:', err)
  process.exit(1)
})
