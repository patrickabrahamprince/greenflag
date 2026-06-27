require('dotenv').config();
require('dotenv').config({ path: '.env.local', override: true });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data, error } = await supabase.auth.signInWithPassword({ email: 'demo-man@greenflag.app', password: 'test1234' });
  if (error) console.log('Login error:', error.message);
  else console.log('Login success:', data.user?.email);
}
main();
