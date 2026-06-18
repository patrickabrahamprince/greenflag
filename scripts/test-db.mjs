import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE env vars");
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  try {
    const { data, error } = await supabase.from('task_templates').select('*').limit(5);
    fs.writeFileSync('db-output.json', JSON.stringify({ data, error }, null, 2));
    console.log('Success!');
  } catch (e) {
    fs.writeFileSync('db-output.json', JSON.stringify({ error: e.message }, null, 2));
  }
  process.exit(0);
}

main();
