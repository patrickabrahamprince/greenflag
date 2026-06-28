require('dotenv').config();
require('dotenv').config({ path: '.env.local', override: true });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: users } = await supabase.auth.admin.listUsers();
  const demoMan = users?.users.find(u => u.email === 'demo-man@greenflag.app');

  // Add coins via admin function
  const { data, error } = await supabase.rpc('add_coins', {
    p_user_id: demoMan.id,
    p_amount: 1000,
    p_description: 'Demo coins'
  });
  
  if (error) console.error('Error:', JSON.stringify(error, null, 2));
  else console.log('✅ Added coins:', JSON.stringify(data));

  // Insert wallet if not exists
  const { data: insertResult, error: insertErr } = await supabase.from('wallets')
    .upsert({ user_id: demoMan.id, balance: 1000 })
    .select('balance');
  
  console.log('Inserted wallet:', JSON.stringify(insertResult, null, 2));
  if (insertErr) console.error('Insert error:', JSON.stringify(insertErr, null, 2));
}
main();
