require('dotenv').config();
require('dotenv').config({ path: '.env.local', override: true });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  // Reset password for demo-man
  const { data: users } = await supabase.auth.admin.listUsers();
  const demoMan = users?.users.find(u => u.email === 'demo-man@greenflag.app');
  if (demoMan) {
    const { error } = await supabase.auth.admin.updateUserById(demoMan.id, {
      password: 'test1234'
    });
    if (error) console.log('Reset error:', error.message);
    else console.log('✅ Password reset for demo-man@greenflag.app');
  } else {
    console.log('demo-man not found');
  }

  // Also reset test-man
  const testMan = users?.users.find(u => u.email === 'test-man@local.dev');
  if (testMan) {
    const { error } = await supabase.auth.admin.updateUserById(testMan.id, {
      password: 'test1234'
    });
    if (error) console.log('Reset error:', error.message);
    else console.log('✅ Password reset for test-man@local.dev');
  }

  // Also reset Patrick's account
  const patrick = users?.users.find(u => u.email === 'patrickabraham.abraham@gmail.com');
  if (patrick) {
    const { error } = await supabase.auth.admin.updateUserById(patrick.id, {
      password: 'test1234'
    });
    if (error) console.log('Reset error:', error.message);
    else console.log('✅ Password reset for patrickabraham.abraham@gmail.com');
  }
}
main();
