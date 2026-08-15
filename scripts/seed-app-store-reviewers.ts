import 'dotenv/config';
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

export const REVIEWER_ACCOUNTS = [
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

async function main() {
  console.log('\n=============================================');
  console.log('   GREENFLAG APP STORE REVIEW SEED SCRIPT    ');
  console.log('=============================================\n');

  const { data: { users: existingUsers }, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) throw listErr;

  const userMap: Record<string, string> = {};

  for (const account of REVIEWER_ACCOUNTS) {
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

    userMap[account.profile.persona] = authUser.id;

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
  }

  // Setup Standard for Woman account
  const womanId = userMap['woman'];
  if (womanId) {
    const { data: existingStd } = await supabase
      .from('standards')
      .select('id')
      .eq('woman_id', womanId)
      .maybeSingle();

    let standardId = existingStd?.id;

    if (!standardId) {
      const { data: createdStd, error: stdErr } = await supabase
        .from('standards')
        .insert({
          woman_id: womanId,
          intentions: {},
          is_active: true,
        })
        .select('id')
        .single();

      if (stdErr) {
        console.warn('[STANDARDS] Could not insert standard:', stdErr.message);
      } else {
        standardId = createdStd.id;
        console.log('[STANDARDS] Created standard ID:', standardId);
      }
    }

    if (standardId) {
      await supabase.from('intentions').delete().eq('standard_id', standardId);

      const intentionRows = [
        { standard_id: standardId, day_number: 1, type: 'text', prompt: 'Share your favorite weekend ritual and what gives you peace.' },
        { standard_id: standardId, day_number: 2, type: 'photo', prompt: 'Send a photo of a place or memory that feels like home to you.' },
        { standard_id: standardId, day_number: 3, type: 'voice', prompt: 'Share a 15-second voice note of what made you smile today.' },
      ];

      const { error: intErr } = await supabase.from('intentions').insert(intentionRows);
      if (intErr) {
        console.warn('[INTENTIONS] Could not insert intentions:', intErr.message);
      } else {
        console.log('[INTENTIONS] Successfully seeded 3 daily intentions for Sarah');
      }
    }
  }

  console.log('\n=============================================');
  console.log('   APP STORE REVIEWER ACCOUNTS READY!       ');
  console.log('=============================================');
  for (const acc of REVIEWER_ACCOUNTS) {
    console.log(`Email:    ${acc.email}`);
    console.log(`Password: ${acc.password}`);
    console.log(`Phone:    ${acc.phone} (OTP: 123456)`);
    console.log(`Role:     ${acc.profile.persona.toUpperCase()} (${acc.profile.name})`);
    console.log('---------------------------------------------');
  }
}

main().catch((err) => {
  console.error('Fatal error during reviewer seeding:', err);
  process.exit(1);
});
