import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GRANT_AMOUNT = 1500;

if (!URL || !KEY) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env variables must be set.');
  process.exit(1);
}

const supabase = createClient(URL, KEY, {
  auth: { persistSession: false },
});

async function main() {
  console.log(`=== GRANTING ${GRANT_AMOUNT} COINS TO ALL MAN ACCOUNTS ===\n`);

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

  let succeeded = 0;
  let failed = 0;

  for (const p of profiles) {
    const { data, error } = await supabase.rpc('add_coins', {
      p_user_id: p.id,
      p_amount: GRANT_AMOUNT,
      p_description: 'Coin grant',
      p_metadata: { type: 'admin_bulk_grant' },
    });

    if (error) {
      console.error(`  ✗ Failed for ${p.name || 'Unnamed Man'} (${p.id}):`, error.message);
      failed++;
    } else {
      console.log(`  ✓ ${p.name || 'Unnamed Man'} (${p.id}) -> new balance: ${data?.new_balance ?? 'unknown'}`);
      succeeded++;
    }
  }

  console.log(`\nDone. ${succeeded} credited, ${failed} failed, out of ${profiles.length} men total.`);
}

main().catch(console.error);
