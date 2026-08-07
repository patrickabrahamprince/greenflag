import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendNotification } from '@/lib/notifications';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function unauthorized(req: Request) {
  const auth = req.headers.get('authorization');
  return auth !== `Bearer ${process.env.CRON_SECRET}`;
}

type Admin = ReturnType<typeof getAdmin>;
type Persona = 'man' | 'woman' | string;

// GreenFlag is IST-only in practice (see the existing IST self-gate in
// app/api/cron/daily/route.ts) -- no per-user timezone data exists, so a
// single shared window is the honest option rather than pretending to
// personalize send time per user. 8am-9pm keeps every nudge out of
// sleeping hours without adding a queue/backlog system.
function isWithinSendWindow(): boolean {
  const istHour = new Date(Date.now() + 5.5 * 60 * 60 * 1000).getUTCHours();
  return istHour >= 8 && istHour < 21;
}

// Deterministic per-(user, nudge type) variant assignment -- same user
// always sees the same phrasing on repeat sends of a given nudge instead
// of flip-flopping, and different users spread across variants roughly
// evenly for later comparison (last_variant is stored precisely so that
// comparison is possible; this route doesn't itself measure conversion).
function pickVariant(userId: string, nudgeType: string, count: number): number {
  const str = `${userId}:${nudgeType}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % count;
}

// Escalating cooldown per nudge type -- index is the number of times
// already sent (sentCount), value is how many hours must pass before the
// next one. Once past the array's end, the last entry repeats
// indefinitely (that's the "keep trying" tail for dormant_winback), or --
// for nudge types with a shorter array -- the extra never fires because
// maxSends below caps it first.
const COOLDOWN_HOURS: Record<string, number[]> = {
  standard_begin_followup: [0],
  dormant_winback: [24, 48, 96, 72, 72, 72],
  idle_coins: [48, 48, 48],
  review_waiting_early: [0],
  profile_incomplete: [24, 72, 168],
};
const MAX_SENDS: Record<string, number> = {
  standard_begin_followup: 1,
  dormant_winback: 999,
  idle_coins: 999,
  review_waiting_early: 1,
  profile_incomplete: 3,
};

async function shouldSend(admin: Admin, userId: string, nudgeType: string): Promise<boolean> {
  const { data } = await admin
    .from('engagement_nudges')
    .select('sent_count, last_sent_at')
    .eq('user_id', userId)
    .eq('nudge_type', nudgeType)
    .maybeSingle();

  if (!data) return true;
  if (data.sent_count >= (MAX_SENDS[nudgeType] ?? 1)) return false;

  const cooldowns = COOLDOWN_HOURS[nudgeType] ?? [24];
  const requiredHours = cooldowns[Math.min(data.sent_count, cooldowns.length - 1)];
  const hoursSinceLastSend = (Date.now() - new Date(data.last_sent_at).getTime()) / 3_600_000;
  return hoursSinceLastSend >= requiredHours;
}

async function recordSend(admin: Admin, userId: string, nudgeType: string, variant: number): Promise<void> {
  const { data } = await admin
    .from('engagement_nudges')
    .select('sent_count')
    .eq('user_id', userId)
    .eq('nudge_type', nudgeType)
    .maybeSingle();

  await admin.from('engagement_nudges').upsert({
    user_id: userId,
    nudge_type: nudgeType,
    sent_count: (data?.sent_count ?? 0) + 1,
    last_sent_at: new Date().toISOString(),
    last_variant: variant,
  });
}

async function nudgeUnseenStandardBegins(admin: Admin): Promise<number> {
  // She hasn't opened it yet -- a curiosity-driven follow-up naming the
  // actual person beats repeating the same generic copy she already
  // ignored once.
  const { data: rows } = await admin
    .from('notifications')
    .select('id, user_id, data')
    .is('read_at', null)
    .lt('created_at', new Date(Date.now() - 20 * 60 * 1000).toISOString())
    .eq('data->>type', 'standard_begin');
  if (!rows?.length) return 0;

  const connectionIds = rows
    .map((r) => (r.data as Record<string, unknown> | null)?.connectionId as string | undefined)
    .filter((id): id is string => !!id);
  const { data: matches } = connectionIds.length
    ? await admin.from('matches').select('id, user1_id').in('id', connectionIds)
    : { data: [] };
  const manIdByConnection = new Map((matches ?? []).map((m) => [m.id, m.user1_id]));
  const manIds = Array.from(new Set(Array.from(manIdByConnection.values())));
  const { data: men } = manIds.length
    ? await admin.from('profiles').select('id, name').in('id', manIds)
    : { data: [] };
  const nameByManId = new Map((men ?? []).map((m) => [m.id, m.name]));

  const variants = (manName: string | undefined) => [
    { title: 'Still there? 👀', body: manName ? `${manName} is still waiting on you.` : "Someone's been waiting on you to set your Standard." },
    { title: "Don't keep him waiting", body: manName ? `${manName} is ready when you are -- come set your Standard.` : "He's ready when you are -- come set your Standard." },
  ];

  let sent = 0;
  for (const row of rows) {
    if (!(await shouldSend(admin, row.user_id, 'standard_begin_followup'))) continue;
    const connectionId = (row.data as Record<string, unknown> | null)?.connectionId as string | undefined;
    const manName = connectionId ? nameByManId.get(manIdByConnection.get(connectionId) ?? '') : undefined;
    const options = variants(manName);
    const variant = pickVariant(row.user_id, 'standard_begin_followup', options.length);
    await sendNotification({
      supabase: admin,
      user_id: row.user_id,
      title: options[variant].title,
      body: options[variant].body,
      data: { type: 'standard_begin', connectionId },
    });
    await recordSend(admin, row.user_id, 'standard_begin_followup', variant);
    sent++;
  }
  return sent;
}

function dormantVariants(persona: Persona, name: string) {
  if (persona === 'man') {
    return [
      { title: 'New people are waiting 👀', body: `${name}, new profiles matching your Standard are up. Come take a look.` },
      { title: "You're missing out", body: `${name}, women are setting new Standards right now -- don't miss your match.` },
    ];
  }
  return [
    { title: 'New people are waiting 👀', body: `${name}, new people want to meet your Standard. Come take a look.` },
    { title: "You're missing out", body: `${name}, guys are trying to meet your Standard right now -- don't miss them.` },
  ];
}

async function nudgeDormantUsers(admin: Admin): Promise<number> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: rows } = await admin
    .from('profiles')
    .select('id, name, persona')
    .lt('last_active', cutoff)
    .eq('is_banned', false);

  let sent = 0;
  for (const row of rows ?? []) {
    if (!(await shouldSend(admin, row.id, 'dormant_winback'))) continue;
    const { count: unread } = await admin
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', row.id)
      .is('read_at', null);

    const options = dormantVariants(row.persona, row.name);
    const variant = pickVariant(row.id, 'dormant_winback', options.length);
    const base = options[variant];
    const body = unread && unread > 0
      ? `${base.body} You also have ${unread} thing${unread === 1 ? '' : 's'} waiting.`
      : base.body;

    await sendNotification({
      supabase: admin,
      user_id: row.id,
      title: base.title,
      body,
      data: { type: 'dormant_winback' },
    });
    await recordSend(admin, row.id, 'dormant_winback', variant);
    sent++;
  }
  return sent;
}

function idleCoinsVariants(persona: Persona, name: string | undefined, balance: number) {
  const who = name ? `${name}, ` : '';
  if (persona === 'man') {
    return [
      { body: `${who}you have ${balance} coins sitting unused. Go meet someone's Standard today.` },
      { body: `${who}${balance} coins won't spend themselves. Go meet her Standard.` },
    ];
  }
  return [
    { body: `${who}you have ${balance} coins sitting unused. See what you can do with them.` },
    { body: `${who}${balance} coins are just sitting there. Time to use them.` },
  ];
}

async function nudgeIdleCoins(admin: Admin): Promise<number> {
  const { data: wallets } = await admin
    .from('wallets')
    .select('user_id, balance')
    .gte('balance', 100);
  if (!wallets?.length) return 0;

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const userIds = wallets.map((w) => w.user_id);
  const [{ data: recentSpends }, { data: profiles }] = await Promise.all([
    admin.from('coin_transactions').select('user_id').lt('amount', 0).gte('created_at', threeDaysAgo).in('user_id', userIds),
    admin.from('profiles').select('id, name, persona').in('id', userIds),
  ]);
  const recentlySpentIds = new Set((recentSpends ?? []).map((r) => r.user_id));
  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  let sent = 0;
  for (const wallet of wallets) {
    if (recentlySpentIds.has(wallet.user_id)) continue;
    if (!(await shouldSend(admin, wallet.user_id, 'idle_coins'))) continue;
    const profile = profileById.get(wallet.user_id);
    const options = idleCoinsVariants(profile?.persona ?? '', profile?.name, wallet.balance);
    const variant = pickVariant(wallet.user_id, 'idle_coins', options.length);
    await sendNotification({
      supabase: admin,
      user_id: wallet.user_id,
      title: 'Coins doing nothing 💸',
      body: options[variant].body,
      data: { type: 'idle_coins' },
    });
    await recordSend(admin, wallet.user_id, 'idle_coins', variant);
    sent++;
  }
  return sent;
}

async function nudgeEarlyReviews(admin: Admin): Promise<number> {
  // Fires once, ~2h after her review window opens -- well before the
  // existing 24h/6h/1h hard-deadline reminders (see
  // send_review_reminders in 20261213000004_review_reminder_cron.sql).
  // review_deadline is set 24h out when a match enters pending_review, so
  // "deadline is <= 22h away" means at least 2h have already elapsed.
  const { data: rows } = await admin
    .from('matches')
    .select('id, user1_id, user2_id, current_day, review_deadline')
    .eq('status', 'pending_review')
    .eq('review_reminder_24h_sent', false)
    .lte('review_deadline', new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString())
    .gt('review_deadline', new Date().toISOString());
  if (!rows?.length) return 0;

  const manIds = Array.from(new Set(rows.map((r) => r.user1_id)));
  const { data: men } = await admin.from('profiles').select('id, name').in('id', manIds);
  const nameByManId = new Map((men ?? []).map((m) => [m.id, m.name]));

  const variants = (manName: string | undefined, day: number) => [
    { body: manName ? `${manName} is waiting on your Day ${day} review. Don't keep him hanging.` : "Don't keep him hanging -- review his submission now." },
    { body: manName ? `Day ${day} is ready -- ${manName} is counting on you to review it.` : `Day ${day} is ready for your review.` },
  ];

  let sent = 0;
  for (const row of rows) {
    if (!(await shouldSend(admin, row.user2_id, 'review_waiting_early'))) continue;
    const manName = nameByManId.get(row.user1_id);
    const options = variants(manName, row.current_day);
    const variant = pickVariant(row.user2_id, 'review_waiting_early', options.length);
    await sendNotification({
      supabase: admin,
      user_id: row.user2_id,
      title: "He's waiting on you 👀",
      body: options[variant].body,
      data: { type: 'review_reminder', connectionId: row.id },
    });
    await recordSend(admin, row.user2_id, 'review_waiting_early', variant);
    sent++;
  }
  return sent;
}

function profileIncompleteVariants(persona: Persona, name: string, whatToAdd: string) {
  if (persona === 'man') {
    return [
      { body: `${name}, add ${whatToAdd} to get noticed way more. Takes under a minute.` },
      { body: `${name}, profiles with ${whatToAdd} get chosen way more often. Add yours now.` },
    ];
  }
  return [
    { body: `${name}, add ${whatToAdd} to get noticed way more. Takes under a minute.` },
    { body: `${name}, add ${whatToAdd} so your Standard gets taken seriously. Takes under a minute.` },
  ];
}

async function nudgeIncompleteProfiles(admin: Admin): Promise<number> {
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: rows } = await admin
    .from('profiles')
    .select('id, name, bio, photos, persona')
    .lt('created_at', dayAgo)
    .eq('is_banned', false);

  let sent = 0;
  for (const row of rows ?? []) {
    const missingBio = !row.bio;
    const missingPhotos = !row.photos || row.photos.length < 2;
    if (!missingBio && !missingPhotos) continue;
    if (!(await shouldSend(admin, row.id, 'profile_incomplete'))) continue;

    const whatToAdd = missingBio && missingPhotos ? 'a bio and more photos' : missingBio ? 'a bio' : 'more photos';
    const options = profileIncompleteVariants(row.persona, row.name, whatToAdd);
    const variant = pickVariant(row.id, 'profile_incomplete', options.length);
    await sendNotification({
      supabase: admin,
      user_id: row.id,
      title: 'Get 3x more attention',
      body: options[variant].body,
      data: { type: 'profile_incomplete' },
    });
    await recordSend(admin, row.id, 'profile_incomplete', variant);
    sent++;
  }
  return sent;
}

export async function POST(req: Request) {
  if (unauthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isWithinSendWindow()) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'outside_send_window' });
  }

  const admin = getAdmin();
  const [standardBegin, dormant, idleCoins, earlyReview, incompleteProfile] = await Promise.all([
    nudgeUnseenStandardBegins(admin),
    nudgeDormantUsers(admin),
    nudgeIdleCoins(admin),
    nudgeEarlyReviews(admin),
    nudgeIncompleteProfiles(admin),
  ]);

  return NextResponse.json({
    ok: true,
    sent: {
      standardBeginFollowup: standardBegin,
      dormantWinback: dormant,
      idleCoins,
      reviewWaitingEarly: earlyReview,
      profileIncomplete: incompleteProfile,
    },
  });
}
