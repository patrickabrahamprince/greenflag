require('dotenv').config();
require('dotenv').config({ path: '.env.local', override: true });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  // Mark demo-man as onboarded
  // Get the user ID first
  const { data: users } = await supabase.auth.admin.listUsers();
  const demoMan = users?.users.find(u => u.email === 'demo-man@greenflag.app');
  
  if (!demoMan) { console.log('User not found'); return; }

  const { data, error } = await supabase
    .from('profiles')
    .update({ onboarding_completed: true, persona: 'man', name: 'Demo Man', city: 'Bangalore' })
    .eq('id', demoMan.id)
    .select('id, name, persona, onboarding_completed');
  
  if (error) console.error('Error:', JSON.stringify(error, null, 2));
  else console.log('✅ Updated profile:', JSON.stringify(data, null, 2));
}
main();
