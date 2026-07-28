import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const STORAGE_BUCKETS = ['avatars', 'profile-photos', 'submissions'];
const MAX_STORAGE_RECURSION_DEPTH = 4;

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Same recursive-list-then-remove pattern as the admin purge/nuke-all-users
// routes -- Storage list() only returns one level, and submissions nests a
// day folder (`{userId}/day{N}/file`) that avatars/profile-photos don't.
async function deleteUserFolder(admin: SupabaseClient, bucket: string, prefix: string, depth = 0): Promise<void> {
  if (depth > MAX_STORAGE_RECURSION_DEPTH) return;
  const { data: entries } = await admin.storage.from(bucket).list(prefix, { limit: 1000 });
  if (!entries || entries.length === 0) return;

  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = `${prefix}/${entry.name}`;
    if (entry.id === null) {
      await deleteUserFolder(admin, bucket, fullPath, depth + 1);
    } else {
      files.push(fullPath);
    }
  }
  if (files.length > 0) {
    await admin.storage.from(bucket).remove(files);
  }
}

// Self-service "Delete Account" from Settings -- Apple guideline 5.1.1(v)
// requires apps that support account creation to also offer in-app
// account deletion, reachable without contacting support. This used to
// only delete the profiles row and the auth.users record, leaving the
// user's matches, submissions, messages, wallet, coin history, photos,
// and everything else behind. Rewritten against the same verified real
// table list as the admin purge/nuke-all-users routes.
export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = user.id;
    const admin = getAdmin();

    const pairFilter = (col1: string, col2: string) => `${col1}.eq.${userId},${col2}.eq.${userId}`;

    const { data: matchRows } = await admin
      .from('matches' as any)
      .select('id')
      .or(pairFilter('user1_id', 'user2_id'));
    const matchIds = (matchRows || []).map((m: { id: string }) => m.id);

    const { data: standardRows } = await admin
      .from('standards')
      .select('id')
      .eq('woman_id', userId);
    const standardIds = (standardRows || []).map((s: { id: string }) => s.id);

    if (matchIds.length > 0) {
      await admin.from('submissions').delete().in('match_id', matchIds);
      await admin.from('special_sends').delete().in('match_id', matchIds);
      await admin.from('funnel_events').delete().in('match_id', matchIds);
      await admin.from('messages').delete().in('match_id', matchIds);
    }
    await admin.from('matches' as any).delete().or(pairFilter('user1_id', 'user2_id'));

    if (standardIds.length > 0) {
      await admin.from('intentions').delete().in('standard_id', standardIds);
    }
    await admin.from('standards').delete().eq('woman_id', userId);

    await admin.from('likes' as any).delete().or(pairFilter('from_user_id', 'to_user_id'));
    await admin.from('nudges').delete().or(pairFilter('from_user_id', 'to_user_id'));
    await admin.from('notifications').delete().eq('user_id', userId);
    await admin.from('reports').delete().or(pairFilter('reporter_id', 'reported_id'));
    await admin.from('blocked_pairs').delete().or(pairFilter('host_id', 'guest_id'));
    await admin.from('push_subscriptions').delete().eq('user_id', userId);
    await admin.from('profile_edit_requests').delete().eq('user_id', userId);
    await admin.from('photo_unlocks').delete().or(pairFilter('viewer_id', 'target_id'));
    await admin.from('coin_transactions').delete().eq('user_id', userId);
    await admin.from('wallets').delete().eq('user_id', userId);

    for (const bucket of STORAGE_BUCKETS) {
      await deleteUserFolder(admin, bucket, userId);
    }

    const { error: profileErr } = await admin.from('profiles').delete().eq('id', userId);
    if (profileErr) {
      return NextResponse.json({ error: profileErr.message }, { status: 500 });
    }

    const { error: authErr } = await admin.auth.admin.deleteUser(userId);
    if (authErr) {
      return NextResponse.json({ error: authErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
