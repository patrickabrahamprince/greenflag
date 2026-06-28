import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(URL, KEY, {
  auth: { persistSession: false },
});

async function main() {
  const { data: connections, error } = await supabase
    .from('connections')
    .select('*, host:host_id(name), guest:guest_id(name)');

  if (error) {
    console.error('Error fetching connections:', error.message);
    return;
  }

  console.log('Connections in database:');
  console.log(JSON.stringify(connections, null, 2));
}

main().catch(console.error);
