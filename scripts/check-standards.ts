import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(URL, KEY, {
  auth: { persistSession: false },
});

async function main() {
  const { data: standards, error } = await supabase
    .from('standards')
    .select('*');

  if (error) {
    console.error('Error fetching standards:', error.message);
    return;
  }

  console.log('Standards in database:');
  console.log(JSON.stringify(standards, null, 2));
}

main().catch(console.error);
