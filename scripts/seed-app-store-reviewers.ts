import { config as loadEnv } from 'dotenv';

// This project keeps its keys in .env.local; plain `dotenv/config` reads only
// .env, which is absent here. Load both, .env.local first -- dotenv never
// overrides an already-set variable, so a real exported env still wins.
loadEnv({ path: '.env.local' });
loadEnv();
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing or invalid NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

interface SeedProfile {
  name: string;
  persona: 'woman' | 'man';
  age: number;
  city: string;
  city_auto: string | null;
  onboarding_completed: boolean;
  onboarding_complete: boolean;
  approval_status: string;
  is_active: boolean;
  is_banned: boolean;
  is_verified: boolean;
  verification_status: string;
  phone_verified: boolean;
  elo_score: number;
  interests: string[];
  photos: string[];
  bio: string;
  terms_accepted_at: string | null;
  job?: string;
  height?: string;
  smoking?: string;
  drinking?: string;
  pets?: string;
  workout?: string;
  zodiac?: string;
  education_level?: string;
  family_plans?: string;
  communication_style?: string;
  quiz_answers?: Record<string, string>;
  teaser_prompt?: string;
  teaser_answer?: string;
  anthem_title?: string;
  anthem_artist?: string;
}

interface SeedAccount {
  email: string;
  phone: string;
  password: string;
  profile: SeedProfile;
  walletBalance: number;
  // Only women who should land in the app with a Standard already set. Left
  // off new-onboarding@ deliberately: that account exists to demonstrate the
  // un-onboarded first-run state, so seeding it a Standard would defeat it.
  seedStandard?: boolean;
}

export const REVIEWER_ACCOUNTS: SeedAccount[] = [
  {
    email: 'reviewer-woman@greenflag.app',
    phone: '+15550001111',
    password: 'GreenFlag2026!',
    profile: {
      name: 'Sarah (Demo Woman)',
      persona: 'woman',
      age: 27,
      city: 'San Francisco',
      city_auto: 'San Francisco, CA',
      onboarding_completed: true,
      onboarding_complete: true,
      approval_status: 'approved',
      is_active: true,
      is_banned: false,
      is_verified: true,
      verification_status: 'approved',
      phone_verified: true,
      elo_score: 1000,
      interests: ['Hiking', 'Art & Design', 'Coffee & Cafes', 'Travel', 'Mindfulness'],
      photos: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
      ],
      bio: 'Looking for genuine communication, kindness, and shared adventures.',
      terms_accepted_at: new Date().toISOString(),
    },
    walletBalance: 1500,
    seedStandard: true,
  },
  {
    email: 'demo-reviewer@greenflag.com',
    phone: '+15550009999',
    password: 'GreenFlag2026!',
    profile: {
      name: 'Sarah (Demo Woman)',
      persona: 'woman',
      age: 27,
      city: 'San Francisco',
      city_auto: 'San Francisco, CA',
      onboarding_completed: true,
      onboarding_complete: true,
      approval_status: 'approved',
      is_active: true,
      is_banned: false,
      is_verified: true,
      verification_status: 'approved',
      phone_verified: true,
      elo_score: 1000,
      interests: ['Hiking', 'Art & Design', 'Coffee & Cafes', 'Travel', 'Mindfulness'],
      photos: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
      ],
      bio: 'Looking for genuine communication, kindness, and shared adventures.',
      terms_accepted_at: new Date().toISOString(),
    },
    walletBalance: 1500,
    seedStandard: true,
  },
  {
    email: 'reviewer-man@greenflag.app',
    phone: '+15550002222',
    password: 'GreenFlag2026!',
    profile: {
      name: 'Alex (Demo Man)',
      persona: 'man',
      age: 29,
      city: 'San Francisco',
      city_auto: 'San Francisco, CA',
      onboarding_completed: true,
      onboarding_complete: true,
      approval_status: 'approved',
      is_active: true,
      is_banned: false,
      is_verified: true,
      verification_status: 'approved',
      phone_verified: true,
      elo_score: 1000,
      interests: ['Fitness & Gym', 'Photography', 'Technology', 'Travel', 'Music'],
      photos: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
      ],
      bio: 'Passionate about outdoor sports and meaningful conversations.',
      // The rest of these were blank, which meant the reviewer account's
      // own View Profile page -- the same one every real user sees --
      // rendered only name/age/city/bio/interests: every other section
      // (Basics, Lifestyle, Quiz, Anthem) is written to hide itself
      // entirely when its data is empty, so a reviewer clicking into this
      // profile from Discover saw a noticeably sparser page than a
      // filled-out real one. Values here are drawn from the app's own
      // fixed option lists (lib/constants/profileDetails.ts) and its real
      // onboarding quiz questions (app/(auth)/onboard/quiz/page.tsx),
      // not made up, so this exercises the exact same display code path
      // a real profile does.
      job: 'Product Designer',
      height: '5\' 11"',
      smoking: 'Non-smoker',
      drinking: 'Socially',
      pets: 'Dog',
      workout: 'Often',
      zodiac: 'Leo',
      education_level: 'Undergrad Degree',
      family_plans: 'Want children',
      communication_style: 'Big time texter',
      quiz_answers: {
        relationship_goal: 'Open, but intentional',
        love_language: 'Quality time together',
        first_date: 'A class or experience together',
        humor_style: 'Playful & witty',
        ideal_trip: 'Mountains, off-grid',
      },
      teaser_prompt: 'The way to my heart is',
      teaser_answer: 'a home-cooked meal and a long walk after.',
      anthem_title: 'Sunday Morning',
      anthem_artist: 'Maroon 5',
      terms_accepted_at: new Date().toISOString(),
    },
    walletBalance: 1500,
  },
  {
    email: 'new-onboarding@greenflag.app',
    phone: '+15550003333',
    password: 'GreenFlag2026!',
    profile: {
      name: 'New User',
      persona: 'woman',
      age: 25,
      city: 'San Francisco',
      city_auto: null,
      onboarding_completed: false,
      onboarding_complete: false,
      approval_status: 'pending',
      is_active: true,
      is_banned: false,
      is_verified: false,
      verification_status: 'pending',
      phone_verified: false,
      elo_score: 1000,
      interests: [],
      photos: [],
      bio: '',
      terms_accepted_at: null,
    },
    walletBalance: 0,
  },
];

// --- Google Play closed-test accounts -------------------------------------
//
// Deliberately separate from REVIEWER_ACCOUNTS. The Play testers and Apple's
// reviewer used to share reviewer-woman@, which meant re-seeding for Apple
// wiped live testers' state mid-window, and 15 people shared one dating
// account. One account per tester keeps both groups isolated.
//
// Woman persona throughout: women read the ranked-men feed and never spend
// coins to open a chat, so testers cannot drain a balance into the Razorpay
// checkout that has no Play Billing behind it.
const PLAY_TESTER_FIRST_NAMES = [
  'Aisha', 'Priya', 'Meera', 'Nisha', 'Kavya',
  'Riya', 'Tara', 'Anjali', 'Divya', 'Sneha',
  'Isha', 'Neha', 'Pooja', 'Lakshmi', 'Rhea',
];

const PLAY_TESTER_PHOTOS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
];

export const PLAY_TESTER_ACCOUNTS: SeedAccount[] = PLAY_TESTER_FIRST_NAMES.map(
  (firstName, index) => {
    const n = String(index + 1).padStart(2, '0');
    return {
      email: `tester${n}@greenflag.app`,
      // 555-011-NN00: distinct from the 5550001111/2222/3333 reviewer block.
      phone: `+1555011${n}00`,
      password: 'GreenFlag2026!',
      profile: {
        name: `${firstName} (Tester ${n})`,
        persona: 'woman' as const,
        age: 24 + (index % 9),
        city: 'San Francisco',
        city_auto: 'San Francisco, CA',
        onboarding_completed: true,
        onboarding_complete: true,
        approval_status: 'approved',
        is_active: true,
        is_banned: false,
        is_verified: true,
        verification_status: 'approved',
        phone_verified: true,
        elo_score: 1000,
        interests: ['Hiking', 'Art & Design', 'Coffee & Cafes', 'Travel', 'Mindfulness'],
        photos: PLAY_TESTER_PHOTOS,
        // Named as a test account on purpose: these profiles surface in real
        // men's discover feeds, and a real user should be able to tell.
        bio: 'Test account for Google Play closed testing.',
        terms_accepted_at: new Date().toISOString(),
      },
      walletBalance: 1500,
      seedStandard: true,
    };
  }
);

const GROUPS = {
  reviewers: { label: 'APP STORE REVIEWER', accounts: REVIEWER_ACCOUNTS },
  testers: { label: 'PLAY CLOSED-TEST TESTER', accounts: PLAY_TESTER_ACCOUNTS },
} as const;

type GroupName = keyof typeof GROUPS;

// Defaults to `reviewers` so the documented `npm run seed:reviewers` keeps its
// exact previous behaviour and never touches live testers.
function parseGroups(): GroupName[] {
  const raw = process.argv.find((a) => a.startsWith('--group='))?.split('=')[1] ?? 'reviewers';
  if (raw === 'all') return ['reviewers', 'testers'];
  if (raw === 'reviewers' || raw === 'testers') return [raw];
  console.error(`Unknown --group=${raw}. Expected one of: reviewers, testers, all.`);
  process.exit(1);
}

async function ensureStandardWithIntentions(womanId: string, label: string) {
  const { data: existingStd } = await supabase
    .from('standards')
    .select('id')
    .eq('woman_id', womanId)
    .maybeSingle();

  let standardId = existingStd?.id;

  if (!standardId) {
    const { data: createdStd, error: stdErr } = await supabase
      .from('standards')
      .insert({ woman_id: womanId, intentions: {}, is_active: true })
      .select('id')
      .single();

    if (stdErr) {
      console.warn(`[STANDARDS] Could not insert standard for ${label}:`, stdErr.message);
      return;
    }
    standardId = createdStd.id;
    console.log(`[STANDARDS] Created standard ${standardId} for ${label}`);
  }

  await supabase.from('intentions').delete().eq('standard_id', standardId);

  const intentionRows = [
    { standard_id: standardId, day_number: 1, type: 'text', prompt: 'Share your favorite weekend ritual and what gives you peace.' },
    { standard_id: standardId, day_number: 2, type: 'photo', prompt: 'Send a photo of a place or memory that feels like home to you.' },
    { standard_id: standardId, day_number: 3, type: 'voice', prompt: 'Share a 15-second voice note of what made you smile today.' },
  ];

  const { error: intErr } = await supabase.from('intentions').insert(intentionRows);
  if (intErr) {
    console.warn(`[INTENTIONS] Could not insert intentions for ${label}:`, intErr.message);
  } else {
    console.log(`[INTENTIONS] Seeded 3 daily intentions for ${label}`);
  }
}


async function main() {
  const groups = parseGroups();

  console.log('\n=============================================');
  console.log('   GREENFLAG ACCOUNT SEED SCRIPT             ');
  console.log(`   Groups: ${groups.join(', ')}`);
  console.log('=============================================\n');

  // perPage defaults to 50, which this project outgrew once it had real
  // users -- a missed match here makes createUser fail as "already registered"
  // instead of updating the existing account.
  const { data: { users: existingUsers }, error: listErr } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listErr) throw listErr;

  const seeded: SeedAccount[] = [];

  for (const group of groups) {
    const { label, accounts } = GROUPS[group];
    console.log(`\n--- ${label} ACCOUNTS (${accounts.length}) ---\n`);

    for (const account of accounts) {
      let authUser = existingUsers?.find((u) => u.email === account.email);

      if (authUser) {
        console.log(`[AUTH] Existing user found for ${account.email} (${authUser.id})`);
        const { error: updateErr } = await supabase.auth.admin.updateUserById(authUser.id, {
          password: account.password,
          phone: account.phone,
          email_confirm: true,
          user_metadata: {
            name: account.profile.name,
            persona: account.profile.persona,
          },
        });
        if (updateErr) console.warn(`Could not update auth user ${account.email}:`, updateErr.message);
      } else {
        console.log(`[AUTH] Creating fresh auth account for ${account.email}...`);
        const { data, error } = await supabase.auth.admin.createUser({
          email: account.email,
          phone: account.phone,
          password: account.password,
          email_confirm: true,
          user_metadata: {
            name: account.profile.name,
            persona: account.profile.persona,
          },
        });
        if (error) throw new Error(`Failed to create ${account.email}: ${error.message}`);
        authUser = data.user!;
        console.log(`[AUTH] Successfully created ${account.email} (${authUser.id})`);
      }

      // Upsert public.users (if table exists)
      try {
        await supabase.from('users').upsert(
          {
            id: authUser.id,
            persona: account.profile.persona,
            name: account.profile.name,
            phone: account.phone,
          },
          { onConflict: 'id' }
        );
      } catch {
        // optional
      }

      // Upsert profile with full onboarding flags
      const { error: profileErr } = await supabase.from('profiles').upsert(
        {
          id: authUser.id,
          name: account.profile.name,
          persona: account.profile.persona,
          age: account.profile.age,
          city: account.profile.city,
          city_auto: account.profile.city_auto,
          onboarding_completed: account.profile.onboarding_completed,
          onboarding_complete: account.profile.onboarding_complete,
          approval_status: account.profile.approval_status,
          is_active: account.profile.is_active,
          is_banned: account.profile.is_banned,
          is_verified: account.profile.is_verified,
          verification_status: account.profile.verification_status,
          phone_verified: account.profile.phone_verified,
          elo_score: account.profile.elo_score,
          interests: account.profile.interests,
          photos: account.profile.photos,
          bio: account.profile.bio,
          job: account.profile.job,
          height: account.profile.height,
          smoking: account.profile.smoking,
          drinking: account.profile.drinking,
          pets: account.profile.pets,
          workout: account.profile.workout,
          zodiac: account.profile.zodiac,
          education_level: account.profile.education_level,
          family_plans: account.profile.family_plans,
          communication_style: account.profile.communication_style,
          quiz_answers: account.profile.quiz_answers,
          teaser_prompt: account.profile.teaser_prompt,
          teaser_answer: account.profile.teaser_answer,
          anthem_title: account.profile.anthem_title,
          anthem_artist: account.profile.anthem_artist,
          terms_accepted_at: account.profile.terms_accepted_at,
        },
        { onConflict: 'id' }
      );

      if (profileErr) {
        console.error(`[PROFILE] Error updating profile for ${account.email}:`, profileErr.message);
      } else {
        console.log(`[PROFILE] Upserted fully completed profile for ${account.profile.name}`);
      }

      // Upsert wallet
      const { error: walletErr } = await supabase.from('wallets').upsert(
        {
          user_id: authUser.id,
          balance: account.walletBalance,
        },
        { onConflict: 'user_id' }
      );

      if (walletErr) {
        console.error(`[WALLET] Error updating wallet for ${account.email}:`, walletErr.message);
      } else {
        console.log(`[WALLET] Credited ${account.walletBalance} coins to ${account.email}`);
      }

      // Clean any daily discovery views
      await supabase.from('daily_discover_views').delete().eq('man_id', authUser.id);

      if (account.seedStandard) {
        await ensureStandardWithIntentions(authUser.id, account.profile.name);
      }

      seeded.push(account);
    }
  }

  console.log('\n=============================================');
  console.log(`   ${seeded.length} ACCOUNTS READY!`);
  console.log('=============================================');
  for (const acc of seeded) {
    console.log(`Email:    ${acc.email}`);
    console.log(`Password: ${acc.password}`);
    // Deliberately not printing an OTP here. Nothing in this script seeds a
    // verification code, and [auth.sms.test_otp] is commented out in
    // supabase/config.toml -- the old "(OTP: 123456)" hint was unbacked and
    // would strand anyone who tried phone sign-in. Sign in with email +
    // password: accounts are created with email_confirm: true, so no mailbox
    // and no code are needed.
    console.log(`Phone:    ${acc.phone} (sign in with email + password, not SMS)`);
    console.log(`Role:     ${acc.profile.persona.toUpperCase()} (${acc.profile.name})`);
    console.log('---------------------------------------------');
  }
}

main().catch((err) => {
  console.error('Fatal error during reviewer seeding:', err);
  process.exit(1);
});
