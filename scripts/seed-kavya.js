#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
require('dotenv').config({ path: '.env.local', override: true });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const kavyaId = 'f6a91565-681b-499f-b6cc-f3734b8d942f';
  
  // Check if Kavya is in public.users
  const { data: kavyaUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', kavyaId)
    .maybeSingle();
  
  console.log('Kavya in public.users:', kavyaUser ? 'YES' : 'NO');
  
  if (!kavyaUser) {
    // Insert Kavya into public.users
    const { data: inserted, error: insertErr } = await supabase
      .from('users')
      .insert({
        id: kavyaId,
        phone: null,
        persona: 'woman',
        name: 'Kavya',
        age: null,
        city: null,
        bio: null,
        interests: null,
        looking_for: null,
        coins: 0,
      })
      .select('*')
      .single();
    
    if (insertErr) {
      console.error('Insert into users error:', JSON.stringify(insertErr, null, 2));
      return;
    }
    console.log('✅ Added Kavya to public.users:', inserted.id);
  }

  // Now create the standard
  const { data: existing } = await supabase
    .from('standards')
    .select('*')
    .eq('woman_id', kavyaId)
    .maybeSingle();
  
  let standardId;
  
  if (existing) {
    standardId = existing.id;
    console.log(`Standard already exists: ${standardId}`);
    
    // Make sure it's active and has correct user_id
    await supabase
      .from('standards')
      .update({ is_active: true, user_id: kavyaId })
      .eq('id', standardId);
  } else {
    const { data: created, error: createErr } = await supabase
      .from('standards')
      .insert({ woman_id: kavyaId, user_id: kavyaId, intentions: {}, is_active: true })
      .select('id')
      .single();
    
    if (createErr) {
      console.error('Create error:', JSON.stringify(createErr, null, 2));
      return;
    }
    standardId = created.id;
    console.log(`✅ Created standard: ${standardId}`);
  }

  // Check existing intentions
  const { data: existingInt } = await supabase
    .from('intentions')
    .select('id')
    .eq('standard_id', standardId);
  
  if (existingInt && existingInt.length >= 3) {
    console.log(`✅ Already has ${existingInt.length} intentions. Done.`);
    return;
  }
  
  if (existingInt && existingInt.length > 0) {
    await supabase.from('intentions').delete().eq('standard_id', standardId);
  }
  
  // Insert 3 intentions
  const rows = [
    { standard_id: standardId, day_number: 1, type: 'voice', prompt: 'Send a 30-second voice note: What made you smile today?' },
    { standard_id: standardId, day_number: 2, type: 'photo', prompt: 'Share a photo of something you created with your hands.' },
    { standard_id: standardId, day_number: 3, type: 'text', prompt: 'Write 150 words: Describe a moment you felt truly understood by someone.' },
  ];
  
  const { error: insErr } = await supabase.from('intentions').insert(rows);
  if (insErr) { console.error('Insert error:', JSON.stringify(insErr, null, 2)); return; }
  console.log(`✅ Seeded 3 intentions for Kavya (standard: ${standardId})`);
}

main().catch(console.error);
