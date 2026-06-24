import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function healthCheck() {
  console.log('=== HEALTH CHECK ===\n');

  // 1. Check standards table
  const { data: standards, error: stdErr } = await supabase
    .from('standards')
    .select('id, user_id, woman_id, intentions, is_active, active')
    .limit(5);

  if (stdErr) {
    console.error('ERROR querying standards:', stdErr);
    return;
  }

  console.log('Standards found:', standards?.length || 0);

  if (standards && standards.length > 0) {
    const s = standards[0];
    console.log('Sample standard columns:', Object.keys(s));
    console.log('Has intentions jsonb?', !!s.intentions);
    console.log('Intentions has 9 tasks?', s.intentions?.tasks?.length === 9);
    console.log('is_active:', s.is_active);
  }

  // 2. Check profiles exist
  const { count: profileCount, error: profErr } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });
  if (profErr) console.error('ERROR querying profiles:', profErr);
  console.log('Total profiles:', profileCount);

  // 3. Check wallets exist
  const { count: walletCount, error: walletErr } = await supabase
    .from('wallets')
    .select('*', { count: 'exact', head: true });
  if (walletErr) console.error('ERROR querying wallets:', walletErr);
  console.log('Total wallets:', walletCount);
}

healthCheck();
