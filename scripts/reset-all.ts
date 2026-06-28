import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !KEY) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env variables must be set.');
  process.exit(1);
}

const supabase = createClient(URL, KEY, {
  auth: { persistSession: false },
});

async function main() {
  console.log('=== RESETTING DATABASE (COINS AND PROFILES) ===\n');

  // 1. Fetch all users from auth
  const { data: userData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing users:', listError.message);
    process.exit(1);
  }

  const users = userData?.users || [];
  console.log(`Found ${users.length} auth users in the database.`);

  // 2. Delete all auth users (which cascade deletes profiles, wallets, transactions, connections, etc.)
  for (const user of users) {
    console.log(`Deleting user: ${user.email} (${user.id})...`);
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteError) {
      console.error(`Failed to delete user ${user.email}:`, deleteError.message);
    }
  }

  console.log('\nAll auth users deleted. public.profiles and public.wallets cleared via cascade.');

  // 3. Recreate the Admin user
  console.log('\nRecreating Admin user: test.admin@greenflag.test...');
  const { data: adminData, error: adminErr } = await supabase.auth.admin.createUser({
    email: 'test.admin@greenflag.test',
    password: 'Test1234!',
    email_confirm: true,
  });

  if (adminErr) {
    console.error('Failed to create admin user:', adminErr.message);
  } else if (adminData?.user) {
    const adminUser = adminData.user;
    // Set is_admin = true on the profile
    const { error: profileErr } = await supabase
      .from('profiles')
      .update({ is_admin: true, name: 'Admin Test' })
      .eq('id', adminUser.id);
    
    if (profileErr) {
      console.error('Failed to update admin profile:', profileErr.message);
    } else {
      console.log('Admin user recreated successfully with is_admin: true.');
    }
  }

  // 4. Recreate Patrick's developer account
  console.log("\nRecreating Developer user: patrickabraham.abraham@gmail.com...");
  const { data: patData, error: patErr } = await supabase.auth.admin.createUser({
    email: 'patrickabraham.abraham@gmail.com',
    password: 'test1234',
    email_confirm: true,
  });

  if (patErr) {
    console.error("Failed to create Patrick's developer user:", patErr.message);
  } else if (patData?.user) {
    console.log("Patrick's developer user recreated successfully.");
  }

  console.log('\nDatabase reset completed successfully.');
}

main().catch((err) => {
  console.error('Fatal error during reset:', err);
  process.exit(1);
});
