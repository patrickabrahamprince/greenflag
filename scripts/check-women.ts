import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(URL, KEY, {
  auth: { persistSession: false },
});

async function main() {
  const { data: women, error } = await supabase
    .from('profiles')
    .select('id, name, persona, elo_score, is_active, is_banned, onboarding_completed, gender')
    .eq('persona', 'woman');

  if (error) {
    console.error('Error fetching women:', error.message);
    return;
  }

  console.log('Women in profiles table:');
  console.table(women);
}

main().catch(console.error);
