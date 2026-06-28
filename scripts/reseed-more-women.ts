import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(URL, KEY, {
  auth: { persistSession: false },
});

const MORE_WOMEN = [
  {
    email: 'clara@quest.local',
    name: 'Clara Jenkins',
    age: 26,
    bio: 'Avid climber, board game enthusiast, and coffee lover.',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop',
    interests: ['Climbing', 'Board Games', 'Coffee', 'Music'],
  },
  {
    email: 'sarah@quest.local',
    name: 'Sarah Chen',
    age: 28,
    bio: 'Photographer and weekend baker. Let’s talk architecture or baking secrets.',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop',
    interests: ['Photography', 'Baking', 'Design', 'Travel'],
  },
  {
    email: 'elena@quest.local',
    name: 'Elena Rostova',
    age: 25,
    bio: 'Classical violinist who loves indie rock and hiking on trails.',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop',
    interests: ['Music', 'Violin', 'Hiking', 'Nature'],
  },
  {
    email: 'maya@quest.local',
    name: 'Maya Lin',
    age: 27,
    bio: 'Yoga teacher who loves writing short stories and gardening.',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop',
    interests: ['Yoga', 'Writing', 'Gardening', 'Fitness'],
  },
];

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
  console.log('=== CLEARING CONNECTIONS AND SEEDING NEW MATCHES ===\n');

  // 1. Clear connection and submission history
  console.log('Clearing connection history...');
  const { error: delSubsErr } = await supabase.from('submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delSubsErr) console.error('  Failed to clear submissions:', delSubsErr.message);

  const { error: delConnsErr } = await supabase.from('connections').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delConnsErr) console.error('  Failed to clear connections:', delConnsErr.message);

  console.log('  ✓ Connections and submissions tables cleared.');

  // 2. Seeding more women
  for (const woman of MORE_WOMEN) {
    console.log(`\nCreating account for ${woman.name} (${woman.email})...`);

    // Check if auth user already exists
    const { data: usersData } = await supabase.auth.admin.listUsers();
    let authUser = usersData?.users.find((u) => u.email === woman.email);

    if (!authUser) {
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: woman.email,
        password: 'DemoPass123!',
        email_confirm: true,
      });
      if (createErr || !created?.user) {
        console.error(`  Failed to create auth user for ${woman.name}:`, createErr?.message);
        continue;
      }
      authUser = created.user;
      console.log(`  ✓ Auth user created: ${authUser.id}`);
    } else {
      console.log(`  ✓ Auth user already exists: ${authUser.id}`);
    }

    // Upsert user into public.users
    const { error: userTableErr } = await supabase
      .from('users')
      .upsert({
        id: authUser.id,
        persona: 'woman',
        name: woman.name,
      });

    if (userTableErr) {
      console.error(`  Failed to sync user to public.users:`, userTableErr.message);
      continue;
    }

    // Upsert profile
    const { error: profileErr } = await supabase
      .from('profiles')
      .upsert({
        id: authUser.id,
        name: woman.name,
        persona: 'woman',
        gender: 'woman',
        age: woman.age,
        bio: woman.bio,
        photos: [woman.photo],
        interests: woman.interests,
        elo_score: 1000,
        is_active: true,
        is_banned: false,
        onboarding_completed: true,
        city_auto: 'Bangalore',
      });

    if (profileErr) {
      console.error(`  Failed to upsert profile for ${woman.name}:`, profileErr.message);
      continue;
    }
    console.log(`  ✓ Profile upserted.`);

    // Upsert Standard
    let { data: standard } = await supabase
      .from('standards')
      .select('id')
      .eq('user_id', authUser.id)
      .eq('is_active', true)
      .maybeSingle();

    if (!standard) {
      const { data: newStd, error: stdErr } = await supabase
        .from('standards')
        .insert({
          user_id: authUser.id,
          woman_id: authUser.id,
          is_active: true,
          active: true,
          required_interests: [],
          values: [],
          deal_breakers: [],
          intentions: {
            title: `${woman.name}'s Standard`,
            description: 'Three day criteria',
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
        console.error(`  Failed to create standard:`, stdErr?.message);
        continue;
      }
      standard = newStd;
      console.log(`  ✓ Active standard created: ${standard.id}`);
    } else {
      console.log(`  ✓ Active standard already exists.`);
    }

    // Insert 9 intentions into intentions table
    await supabase.from('intentions').delete().eq('standard_id', standard.id);
    for (const day of DAYS) {
      for (let tn = 0; tn < day.tasks.length; tn++) {
        const type = tn === 0 ? 'voice' : tn === 1 ? 'photo' : 'text';
        await supabase.from('intentions').insert({
          standard_id: standard.id,
          day_number: day.day,
          task_number: tn + 1,
          type,
          prompt: day.tasks[tn],
        });
      }
    }
    console.log(`  ✓ Seeded 9 intentions in database.`);
  }

  // Ensure default woman test standard is also set up
  console.log('\nVerifying default women standards are linked and active...');
  const { data: allWomen } = await supabase.from('profiles').select('id, name').eq('persona', 'woman');
  for (const w of allWomen || []) {
    // Upsert standard just in case
    let { data: std } = await supabase.from('standards').select('id').eq('user_id', w.id).eq('is_active', true).maybeSingle();
    if (std) {
      // Re-seed intentions just to be completely fresh
      await supabase.from('intentions').delete().eq('standard_id', std.id);
      for (const day of DAYS) {
        for (let tn = 0; tn < day.tasks.length; tn++) {
          const type = tn === 0 ? 'voice' : tn === 1 ? 'photo' : 'text';
          await supabase.from('intentions').insert({
            standard_id: std.id,
            day_number: day.day,
            task_number: tn + 1,
            type,
            prompt: day.tasks[tn],
          });
        }
      }
    }
  }

  console.log('\nReseed completed successfully.');
}

main().catch(console.error);
