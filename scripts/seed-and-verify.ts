import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

process.on('unhandledRejection', (err) => {
  console.error('FATAL UNHANDLED:', err);
  process.exit(1);
});

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY?.startsWith('eyJ')) {
  throw new Error('Missing or invalid SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

async function seed() {
  console.log('\n=== STARTING SEED ===');
  
  // 1. Get or create auth users
  const { data: { users: existingUsers } } = await supabase.auth.admin.listUsers();
  
  let woman = existingUsers.find(u => u.email === 'woman@test.com');
  if (!woman) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'woman@test.com',
      password: 'password123',
      email_confirm: true
    });
    if (error) throw new Error(`Woman auth creation failed: ${error.message}`);
    woman = data.user;
  }
  console.log('Woman auth ID:', woman.id);
  
  let man = existingUsers.find(u => u.email === 'man@test.com');
  if (!man) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'man@test.com',
      password: 'password123', 
      email_confirm: true
    });
    if (error) throw new Error(`Man auth creation failed: ${error.message}`);
    man = data.user;
  }
  console.log('Man auth ID:', man.id);
  
  // 2. Upsert public.users - NO email column, only id, persona, name, phone
  console.log('Upserting public.users...');
  const { error: usersErr } = await supabase.from('users').upsert([
    { 
      id: woman.id, 
      persona: 'woman', 
      name: 'Test Woman',
      phone: null 
    },
    { 
      id: man.id, 
      persona: 'man', 
      name: 'Test Man',
      phone: null 
    }
  ]);
  if (usersErr) throw new Error(`public.users upsert failed: ${usersErr.message}`);
  console.log('public.users done');
  
  // 3. Upsert profiles - NO email/username columns. Only id, persona, name, gender
  console.log('Upserting profiles...');
  const { error: profErr } = await supabase.from('profiles').upsert([
    { 
      id: woman.id, 
      persona: 'woman', 
      name: 'Test Woman',
      gender: 'woman'
    },
    { 
      id: man.id, 
      persona: 'man', 
      name: 'Test Man',
      gender: 'man'
    }
  ]);
  if (profErr) throw new Error(`profiles upsert failed: ${profErr.message}`);
  console.log('profiles done');
  
  // 4. Upsert wallets
  console.log('Upserting wallets...');
  const { error: walletErr } = await supabase.from('wallets').upsert([
    { user_id: woman.id, balance: 1000 },
    { user_id: man.id, balance: 1000 }
  ]);
  if (walletErr) throw new Error(`wallets failed: ${walletErr.message}`);
  console.log('wallets done');
  
  // 5. Delete old standards for clean slate
  await supabase.from('standards').delete().eq('user_id', woman.id);
  
  // 6. Insert standard with 9 tasks in jsonb
  console.log('Inserting standard...');
  const { data: standard, error: stdErr } = await supabase.from('standards')
    .insert({
      user_id: woman.id,
      woman_id: woman.id,
      intentions: {
        title: 'Test Standard',
        description: 'E2E test',
        tasks: Array.from({length: 9}, (_, i) => ({
          day: Math.floor(i/3) + 1,
          task: (i % 3) + 1,
          prompt: `Day ${Math.floor(i/3) + 1} Task ${(i % 3) + 1}: Complete this test`,
          proof_type: 'text'
        }))
      },
      is_active: true,
      active: true,
      required_interests: [],
      values: [],
      deal_breakers: []
    })
    .select()
    .single();
    
  if (stdErr) throw new Error(`Standard insert failed: ${JSON.stringify(stdErr)}`);
  console.log('Standard ID:', standard.id);
  
  // 7. Verify
  const { data: verify, error: verifyErr } = await supabase
    .from('standards')
    .select('intentions')
    .eq('user_id', woman.id)
    .single();
    
  if (verifyErr) throw new Error(`VERIFICATION FAILED: ${verifyErr.message}`);
  if (verify.intentions?.tasks?.length !== 9) {
    throw new Error(`VERIFICATION FAILED: Expected 9 tasks, got ${verify.intentions?.tasks?.length}`);
  }
  
  console.log('✅ SUCCESS: Standard exists with 9 tasks');
}

seed().catch(err => {
  console.error('\n❌ SEED FAILED:', err.message);
  console.error(err);
  process.exit(1);
});