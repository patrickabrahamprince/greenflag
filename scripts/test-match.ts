import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(URL, KEY, {
  auth: { persistSession: false },
});

async function main() {
  // Get the test-man user id
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, persona')
    .eq('persona', 'man');

  if (!profiles || profiles.length === 0) {
    console.log('No men found.');
    return;
  }

  for (const man of profiles) {
    console.log(`\nTesting for Man: ${man.name} (${man.id})`);
    
    const { data: matchResults, error } = await supabase.rpc('get_ranked_women', {
      man_interests: [],
      man_values: [],
      man_dealbreakers: [],
      man_elo: 1000,
      man_id: man.id,
    });

    if (error) {
      console.error('RPC Error:', error.message);
    } else {
      console.log('RPC Results:');
      console.table(matchResults);
    }
  }
}

main().catch(console.error);
