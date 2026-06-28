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
  console.log('=== RESETTING COINS FOR ALL MAN ACCOUNTS ===\n');

  // Fetch all profiles with persona = 'man'
  const { data: profiles, error: profErr } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('persona', 'man');

  if (profErr) {
    console.error('Error fetching profiles:', profErr.message);
    process.exit(1);
  }

  if (!profiles || profiles.length === 0) {
    console.log('No profiles with persona "man" found.');
    return;
  }

  for (const p of profiles) {
    console.log(`Setting wallet balance for ${p.name || 'Unnamed Man'} (${p.id}) to 1000 coins...`);
    const { data, error } = await supabase
      .from('wallets')
      .upsert({ user_id: p.id, balance: 1000 })
      .select('balance')
      .single();

    if (error) {
      console.error(`Failed to set balance for ${p.id}:`, error.message);
    } else {
      console.log(`  ✓ Success. New balance: ${data.balance} coins.`);
    }
  }

  console.log('\nAll man accounts reset successfully.');
}

main().catch(console.error);
