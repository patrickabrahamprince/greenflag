#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
require('dotenv').config({ path: '.env.local', override: true });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  // Check Kavya's auth status
  const kavyaId = 'f6a91565-681b-499f-b6cc-f3734b8d942f';
  
  // Check if there's an auth user for Kavya
  const { data: authUser, error: authErr } = await supabase.auth.admin.getUserById(kavyaId);
  console.log('Kavya auth user:', JSON.stringify(authUser, null, 2));
  if (authErr) console.error('Auth error:', JSON.stringify(authUser, null, 2));

  // Check all auth users
  const { data: users, error: usersErr } = await supabase.auth.admin.listUsers();
  if (usersErr) { console.error('List error:', JSON.stringify(usersErr, null, 2)); return; }
  
  console.log('\nAll auth users:');
  users?.users.forEach(u => {
    console.log(`  ${u.id} — ${u.email} — ${u.user_metadata?.name || 'no name'}`);
  });

  // Find women without auth users
  const { data: women } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('persona', 'woman');

  const authIds = new Set(users?.users.map(u => u.id) || []);
  
  console.log('\nWomen without auth users:');
  women?.forEach(w => {
    if (!authIds.has(w.id)) {
      console.log(`  ${w.id} — ${w.name} (NO AUTH USER)`);
    }
  });
}

main().catch(console.error);
