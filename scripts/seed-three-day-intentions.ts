/**
 * Seed 3-day × 3-task intentions for all active standards.
 *
 * Usage:
 *   npx tsx scripts/seed-three-day-intentions.ts
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env.
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
  const { data: standards, error } = await supabase
    .from('standards')
    .select('id, woman_id, is_active')
    .eq('is_active', true);

  if (error) {
    console.error('Failed to fetch standards:', error.message);
    process.exit(1);
  }

  if (!standards?.length) {
    console.log('No active standards found. Nothing to seed.');
    return;
  }

  console.log(`Found ${standards.length} active standard(s).`);

  for (const std of standards) {
    // Clear old intentions for this standard
    await supabase.from('intentions').delete().eq('standard_id', std.id);

    for (const day of DAYS) {
      for (let tn = 0; tn < day.tasks.length; tn++) {
        const { error: insErr } = await supabase.from('intentions').insert({
          standard_id: std.id,
          day_number: day.day,
          task_number: tn + 1,
          type: 'text',
          prompt: day.tasks[tn],
        });
        if (insErr) {
          console.error(`  Failed to insert standard=${std.id} day=${day.day} task=${tn + 1}: ${insErr.message}`);
        }
      }
    }

    console.log(`  Seeded standard ${std.id} (woman ${std.woman_id}) with 9 intentions.`);
  }

  console.log(`Done. ${standards.length} standard(s) seeded with 3 days × 3 tasks each.`);
}

main().catch(console.error);
