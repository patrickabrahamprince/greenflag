import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(URL, KEY, {
  auth: { persistSession: false },
});

const DAYS = [
  {
    day: 1,
    theme: 'Break the ice',
    tasks: [
      'Task 1: Send a 30-second voice note. What made you smile today?',
      'Task 2: Share a photo of your favorite corner in your home.',
      'Task 3: Write 50 words: What does a perfect Sunday look like to you?',
    ],
  },
  {
    day: 2,
    theme: 'Show depth',
    tasks: [
      'Task 1: Voice note — tell me about a book that changed how you think.',
      'Task 2: Photo — show me something you created with your hands.',
      'Task 3: Write 100 words: What value do you refuse to compromise on?',
    ],
  },
  {
    day: 3,
    theme: 'Get vulnerable',
    tasks: [
      'Task 1: Voice note — share a fear you are working to overcome.',
      'Task 2: Photo — a place that makes you feel at peace.',
      'Task 3: Write 150 words: Describe a moment you felt truly understood by someone.',
    ],
  },
];

async function main() {
  console.log('=== SETTING UP STANDARDS AND INTENTIONS FOR WOMEN ===\n');

  // 1. Fetch all women profiles
  const { data: women, error: womenErr } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('persona', 'woman');

  if (womenErr || !women) {
    console.error('Error fetching women:', womenErr?.message);
    process.exit(1);
  }

  console.log(`Found ${women.length} women profiles in the database.`);

  for (const woman of women) {
    console.log(`Processing woman: ${woman.name} (${woman.id})...`);

    // First ensure the user exists in public.users to satisfy foreign key constraints
    const { error: userTableErr } = await supabase
      .from('users')
      .upsert({
        id: woman.id,
        persona: 'woman',
        name: woman.name,
      });

    if (userTableErr) {
      console.error(`  Failed to sync user ${woman.name} to users table:`, userTableErr.message);
      continue;
    }

    // Fetch existing active standard
    let { data: standard } = await supabase
      .from('standards')
      .select('id')
      .eq('user_id', woman.id)
      .eq('is_active', true)
      .maybeSingle();

    if (!standard) {
      // Create new standard with default intentions JSON to satisfy the check constraint
      const { data: newStd, error: stdErr } = await supabase
        .from('standards')
        .insert({
          user_id: woman.id,
          woman_id: woman.id,
          is_active: true,
          active: true,
          required_interests: [],
          values: [],
          deal_breakers: [],
          intentions: {
            title: 'My Standard Intentions',
            description: 'Three day standard tasks',
            tasks: DAYS.flatMap((d) =>
              d.tasks.map((task, idx) => ({
                day: d.day,
                task: idx + 1,
                prompt: task,
                proof_type: idx === 0 ? 'voice' : idx === 1 ? 'photo' : 'text',
              }))
            ),
          },
        })
        .select('id')
        .single();

      if (stdErr || !newStd) {
        console.error(`  Failed to create standard for ${woman.name}:`, JSON.stringify(stdErr));
        continue;
      }
      standard = newStd;
      console.log(`  ✓ Created active standard: ${standard.id}`);
    } else {
      console.log(`  ✓ Active standard already exists: ${standard.id}`);
      // Update existing standard's intentions JSON
      const { error: updateStdErr } = await supabase
        .from('standards')
        .update({
          intentions: {
            title: 'My Standard Intentions',
            description: 'Three day standard tasks',
            tasks: DAYS.flatMap((d) =>
              d.tasks.map((task, idx) => ({
                day: d.day,
                task: idx + 1,
                prompt: task,
                proof_type: idx === 0 ? 'voice' : idx === 1 ? 'photo' : 'text',
              }))
            ),
          }
        })
        .eq('id', standard.id);

      if (updateStdErr) {
        console.error(`  Failed to update standard JSON for ${woman.name}:`, updateStdErr.message);
      } else {
        console.log(`  ✓ Updated intentions JSON on standard ${standard.id}`);
      }
    }

    // Clear old intentions for this standard
    await supabase.from('intentions').delete().eq('standard_id', standard.id);

    // Insert 9 intentions (3 days x 3 tasks) into intentions table
    for (const day of DAYS) {
      for (let tn = 0; tn < day.tasks.length; tn++) {
        const type = tn === 0 ? 'voice' : tn === 1 ? 'photo' : 'text';
        const { error: insErr } = await supabase.from('intentions').insert({
          standard_id: standard.id,
          day_number: day.day,
          task_number: tn + 1,
          type: type,
          prompt: day.tasks[tn],
        });
        if (insErr) {
          console.error(`    Failed to insert day=${day.day} task=${tn + 1}: ${insErr.message}`);
        }
      }
    }
    console.log(`  ✓ Seeded standard with 9 intentions.`);

    // 2. Link existing connections for this host/woman to this standard
    const { data: updatedConns, error: connErr } = await supabase
      .from('connections')
      .update({ standard_id: standard.id })
      .eq('host_id', woman.id)
      .is('standard_id', null)
      .select('id');

    if (connErr) {
      console.error(`  Failed to link connections to standard:`, connErr.message);
    } else if (updatedConns && updatedConns.length > 0) {
      console.log(`  ✓ Linked ${updatedConns.length} existing connection(s) to this standard.`);
    }
  }

  console.log('\nSetup completed successfully.');
}

main().catch(console.error);
