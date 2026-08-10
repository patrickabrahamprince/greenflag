require('dotenv').config();
require('dotenv').config({ path: '.env.local', override: true });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const USERS = [
  {
    email: 'test-man@local.dev',
    password: 'testpass123',
    profile: { name: 'Test Man', persona: 'man', onboarding_completed: true, elo_score: 1000 },
  },
  {
    email: 'test-woman@local.dev',
    password: 'testpass123',
    profile: {
      name: 'Test Woman', persona: 'woman', onboarding_completed: true, elo_score: 1000,
      photos: ['https://i.pravatar.cc/300?img=4'], interests: ['Fitness', 'Cooking', 'Travel'],
    },
  },
];

async function seed() {
  for (const u of USERS) {
    const { data: { users } } = await supabase.auth.admin.listUsers();
    let user = users.find(x => x.email === u.email);
    if (user) {
      console.log(`[auth] ${u.email} already exists`);
    } else {
      const { data, error } = await supabase.auth.admin.createUser({ email: u.email, password: u.password, email_confirm: true });
      if (error) throw new Error(`${u.email} create failed: ${error.message}`);
      user = data.user;
      console.log(`[auth] ${u.email} created`);
    }
    const { error: pErr } = await supabase.from('profiles').upsert({ id: user.id, ...u.profile }, { onConflict: 'id' });
    if (pErr) throw new Error(`${u.email} profile upsert failed: ${pErr.message}`);
    console.log(`[profile] ${u.profile.name} upserted`);
  }
  console.log('Done:', USERS.map(u => `${u.email} / ${u.password}`).join(', '));
}

seed().catch(err => { console.error('FATAL:', err); process.exit(1); });
