import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Ad-hoc test data: 20 approved 'man' profiles so a 'woman' test account's
// Discover feed (get_ranked_men(), see supabase/migrations/
// 20261214000001_fix_get_ranked_men_ambiguous_id.sql) has more than the
// single reviewer profile to scroll through -- needed to actually measure
// feed-scroll performance instead of hitting "You're All Caught Up" after
// one card. Not part of the app-store reviewer or CI demo-user sets;
// safe to delete this file once done with it, the accounts aren't
// referenced anywhere else.
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing or invalid NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const FIRST_NAMES = [
  'Jordan', 'Marcus', 'Ethan', 'Diego', 'Noah', 'Liam', 'Kai', 'Omar',
  'Theo', 'Miles', 'Rohan', 'Felix', 'Aaron', 'Julian', 'Xavier', 'Dev',
  'Ryan', 'Adrian', 'Sam', 'Nate',
];

// Unsplash's own portrait collection, one distinct photo per profile --
// same host/format the reviewer profiles already use (hotlink-friendly,
// no auth needed).
const PHOTO_IDS = [
  '1500648767791-00dcc994a43e', '1507003211169-0a1dd7228f2d',
  '1506794778202-cad84cf45f1d', '1519085360753-af0119f7cbe7',
  '1508341591423-4347099e1f19', '1492562080023-ab3db95bfbce',
  '1463453091185-61582044d556', '1490645935967-10de6ba17061',
  '1522075469751-3a6694fb2f61', '1531891437562-4301cf35b7e5',
  '1500917293891-ef795e70e1f6', '1517841905240-472988babdf9',
  '1544005313-94ddf0286df2', '1552058544-f2b08422138a',
  '1560250097-0b93528c311a', '1568602471122-7832951cc4c5',
  '1614283233556-f35b0c801ef1', '1552374196-c4e7ffc6e126',
  '1573497019940-1c28c88b4f3e', '1618077360395-f3068be8e001',
];

const CITIES = [
  ['San Francisco', 'San Francisco, CA'],
  ['Oakland', 'Oakland, CA'],
  ['Berkeley', 'Berkeley, CA'],
  ['San Jose', 'San Jose, CA'],
  ['Palo Alto', 'Palo Alto, CA'],
];

const JOBS = [
  'Software Engineer', 'Product Manager', 'Chef', 'Architect', 'Nurse',
  'Marketing Manager', 'Photographer', 'Teacher', 'Mechanical Engineer',
  'Financial Analyst', 'UX Designer', 'Firefighter', 'Data Scientist',
  'Physical Therapist', 'Founder', 'Sales Manager', 'Journalist',
  'Civil Engineer', 'Pilot', 'Veterinarian',
];

const INTEREST_POOL = [
  'Fitness & Gym', 'Photography', 'Technology', 'Travel', 'Music',
  'Cooking', 'Hiking', 'Reading', 'Movies & TV', 'Art & Design',
  'Coffee & Cafes', 'Yoga', 'Gaming', 'Live Music', 'Wine Tasting',
  'Running', 'Dancing', 'Surfing', 'Camping', 'Board Games',
];

const BIOS = [
  'Looking for someone to explore the city with, one taco truck at a time.',
  'Equal parts spreadsheet nerd and weekend trail runner.',
  'Will always say yes to a spontaneous road trip.',
  'Trying to find someone who also thinks board games are a love language.',
  'Coffee before conversation, always.',
  'Currently training for a half marathon and looking for moral support.',
  'My dog thinks he is a person. I have made peace with it.',
  'Ask me about the time I got lost hiking and found the best view of my life.',
  'Genuinely happiest cooking a big meal for people I care about.',
  'Still looking for the person who will watch the sunrise with me.',
  'Big believer in long walks and longer conversations.',
  'Recovering perfectionist, current plant parent.',
  'I collect vinyl and terrible puns in equal measure.',
  'Ask me anything except my opinion on pineapple pizza -- it is not up for debate.',
  'Trying new restaurants faster than I can finish the ones on my list.',
  'Weekends are for climbing something, whether it is a mountain or a to-do list.',
  'Looking for a partner in crime for late-night diner runs.',
  'Firm believer that the best conversations happen on long drives.',
  'My love language is remembering the small things you mentioned once.',
  'Still figuring it out, mostly one good meal at a time.',
];

function pickInterests(seed: number): string[] {
  // Rotate the pool by a per-profile offset and take a slice -- simple,
  // deterministic variety without needing real randomness.
  const offset = (seed * 5) % INTEREST_POOL.length;
  const rotated = [...INTEREST_POOL.slice(offset), ...INTEREST_POOL.slice(0, offset)];
  return rotated.slice(0, 4);
}

async function main() {
  console.log('--- Seeding 20 fake Discover profiles ---\n');

  const { data: { users: existingUsers } } = await supabase.auth.admin.listUsers({ perPage: 1000 });

  for (let i = 0; i < 20; i++) {
    const name = FIRST_NAMES[i];
    const email = `fake-discover-${i + 1}@greenflag.local`;
    const phone = `+1555900${String(1000 + i).slice(-4)}`;
    const age = 24 + (i % 12);
    const [city, city_auto] = CITIES[i % CITIES.length];

    let user = existingUsers.find((u) => u.email === email);
    if (!user) {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        phone,
        password: 'FakeDiscover2026!',
        email_confirm: true,
      });
      if (error || !data?.user) {
        console.error(`[auth] ${email} create failed:`, error?.message);
        continue;
      }
      user = data.user;
      console.log(`[auth] ${email} created (${user.id})`);
    } else {
      console.log(`[auth] ${email} exists (${user.id})`);
    }

    const { error: profileErr } = await supabase.from('profiles').upsert(
      {
        id: user.id,
        name,
        persona: 'man',
        age,
        city,
        city_auto,
        onboarding_completed: true,
        onboarding_complete: true,
        approval_status: 'approved',
        is_active: true,
        is_banned: false,
        is_verified: true,
        verification_status: 'approved',
        phone_verified: true,
        elo_score: 1000,
        interests: pickInterests(i),
        photos: [`https://images.unsplash.com/photo-${PHOTO_IDS[i]}?w=800&auto=format&fit=crop&q=80`],
        bio: BIOS[i],
        job: JOBS[i],
        terms_accepted_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (profileErr) {
      console.error(`[profile] ${name} upsert failed:`, profileErr.message);
    } else {
      console.log(`[profile] ${name} (${age}, ${city}) upserted`);
    }
  }

  console.log('\n--- Done: 20 fake profiles ready ---');
}

main().catch((err) => {
  console.error('Fatal error seeding fake Discover profiles:', err);
  process.exit(1);
});
