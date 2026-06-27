#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
require('dotenv').config({ path: '.env.local', override: true });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  // 1. Find women profiles
  const { data: women, error: womenErr } = await supabase
    .from('profiles')
    .select('id, name, persona')
    .eq('persona', 'woman')
    .limit(5);

  if (womenErr) { console.error('Error:', JSON.stringify(womenErr, null, 2)); return; }
  console.log('Women found:', women?.length);

  if (!women || women.length === 0) {
    console.log('No women found in DB. Cannot seed standard.');
    return;
  }

  // Seed for all women
  for (const woman of women) {
    console.log(`\n--- Processing ${woman.name} (${woman.id}) ---`);

    // Check if she already has an active standard with intentions
    const { data: existingStd } = await supabase
      .from('standards')
      .select('id')
      .eq('woman_id', woman.id)
      .eq('is_active', true)
      .maybeSingle();

    if (existingStd) {
      // Check if it has intentions
      const { data: existingInt } = await supabase
        .from('intentions')
        .select('id, day_number')
        .eq('standard_id', existingStd.id);
      
      if (existingInt && existingInt.length >= 3) {
        console.log(`  Already has ${existingInt.length} intentions. Skipping.`);
        continue;
      }
      
      // Has standard but not enough intentions — delete old ones and re-seed
      if (existingInt && existingInt.length > 0) {
        await supabase.from('intentions').delete().eq('standard_id', existingStd.id);
        console.log(`  Cleared ${existingInt.length} old intentions.`);
      }
    }

    // Also check for stale standards with user_id but no woman_id
    const { data: staleStd } = await supabase
      .from('standards')
      .select('id')
      .eq('user_id', woman.id)
      .is('woman_id', null)
      .maybeSingle();

    if (staleStd) {
      // Fix the stale standard by setting woman_id
      await supabase
        .from('standards')
        .update({ woman_id: woman.id })
        .eq('id', staleStd.id);
      console.log(`  Fixed stale standard ${staleStd.id} — set woman_id`);
    }

    // Create standard if needed
    let standardId;
    if (existingStd) {
      standardId = existingStd.id;
    } else {
      const { data: created, error: createErr } = await supabase
        .from('standards')
        .insert({ woman_id: woman.id, user_id: woman.id, intentions: {}, is_active: true })
        .select('id')
        .single();
      if (createErr) { console.error('  Create error:', JSON.stringify(createErr, null, 2)); continue; }
      standardId = created.id;
      console.log(`  Created standard: ${standardId}`);
    }

    // Insert 3 intentions (1 per day)
    const intentionRows = [
      { standard_id: standardId, day_number: 1, type: 'voice', prompt: 'Send a 30-second voice note: What made you smile today?' },
      { standard_id: standardId, day_number: 2, type: 'photo', prompt: 'Share a photo of something you created with your hands.' },
      { standard_id: standardId, day_number: 3, type: 'text', prompt: 'Write 150 words: Describe a moment you felt truly understood by someone.' },
    ];

    const { error: insertErr } = await supabase.from('intentions').insert(intentionRows);
    if (insertErr) { console.error('  Insert error:', JSON.stringify(insertErr, null, 2)); continue; }
    console.log(`  ✅ Seeded 3 intentions for ${woman.name}`);
  }

  console.log('\n✅ Done! All women now have active standards with 3 daily intentions.');
}

main().catch(console.error);
