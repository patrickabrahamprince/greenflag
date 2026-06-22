// scripts/setup_test_users.js
// Only runs in development — guarded against accidental production use

if (process.env.NODE_ENV !== 'development' && !process.env.ALLOW_TEST_SEED) {
  console.log('Seed script skipped: NODE_ENV is not development and ALLOW_TEST_SEED is not set.');
  process.exit(0);
}

import { createClient } from '@/lib/supabase/client';

async function main() {
  const supabase = createClient();

  // Delete existing test users
  await supabase.from('auth.users').delete().in('email', ['man@test.com', 'woman@test.com', 'admin@test.com']).throwOnError();

  // Insert users and profiles
  const users = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'man@test.com',
      password: 'Test1234!'
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      email: 'woman@test.com',
      password: 'Test1234!'
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      email: 'admin@test.com',
      password: 'Test1234!'
    }
  ];

  // Helper to insert auth user via RPC (Supabase auth schema)
  for (const u of users) {
    await supabase.rpc('auth.sign_up', {
      email: u.email,
      password: u.password,
      uid: u.id
    }).throwOnError();
  }

  // Insert profiles
  await supabase.from('profiles').upsert([
    {
      id: '11111111-1111-1111-1111-111111111111',
      gender: 'male',
      name: 'Test Man',
      age: 28,
      city_auto: 'Bangalore',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      gender: 'female',
      name: 'Test Woman',
      age: 26,
      city_auto: 'Bangalore',
      is_active: true,
      photos: ['https://picsum.photos/seed/woman/800/1200'],
      created_at: new Date().toISOString()
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      gender: 'male',
      name: 'Admin',
      is_admin: true,
      is_active: true,
      created_at: new Date().toISOString()
    }
  ]).throwOnError();

  // Wallets
  await supabase.from('wallets').upsert([
    { user_id: '11111111-1111-1111-1111-111111111111', balance: 100, created_at: new Date().toISOString() },
    { user_id: '22222222-2222-2222-2222-222222222222', balance: 50, created_at: new Date().toISOString() },
    { user_id: '33333333-3333-3333-3333-333333333333', balance: 999, created_at: new Date().toISOString() }
  ]).throwOnError();

  // Verification queries
  const { data: usersData } = await supabase.from('auth.users').select('email, id').in('email', ['man@test.com', 'woman@test.com', 'admin@test.com']).throwOnError();
  const { data: profilesData } = await supabase.from('profiles').select('id, name, gender, is_admin').in('id', [
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333'
  ]).throwOnError();
  const { data: walletsData } = await supabase.from('wallets').select('user_id, balance').in('user_id', [
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333'
  ]).throwOnError();

  console.table(usersData);
  console.table(profilesData);
  console.table(walletsData);
}

main().catch(console.error);
