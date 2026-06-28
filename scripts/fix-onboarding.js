require('dotenv').config();
require('dotenv').config({ path: '.env.local', override: true });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: users } = await supabase.auth.admin.listUsers();
  const demoMan = users?.users.find(u => u.email === 'demo-man@greenflag.app');
  if (!demoMan) { console.log('User not found'); return; }

  // Check current profile state
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', demoMan.id).single();
  console.log('Current profile:', JSON.stringify(profile, null, 2));

  // Update with all required fields
  const { data, error } = await supabase.from('profiles').upsert({
    id: demoMan.id,
    persona: 'man',
    name: 'Demo Man',
    age: 28,
    city: 'Bangalore',
    bio: 'Love hiking, coffee, and good conversations.',
    onboarding_completed: true,
    is_active: true,
  }).select('id, name, onboarding_completed').single();

  if (error) console.error('Error:', JSON.stringify(error, null, 2));
  else console.log('✅ Done:', JSON.stringify(data, null, 2));
}
main();
