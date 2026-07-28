import { NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { requireAdmin, logAuditAction } from '@/lib/admin/auth';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const CONFIRM_PHRASE = 'DELETE ALL USERS';
const STORAGE_BUCKETS = ['avatars', 'profile-photos', 'submissions'];
const MAX_STORAGE_RECURSION_DEPTH = 4;

function getAdmin() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}

// Storage `list()` only returns one level -- avatars/profile-photos are
// flat (`{userId}/file.jpg`) but submissions nests a day folder
// (`{userId}/day{N}/file`), so this has to recurse. A "folder" entry from
// the Supabase JS client always comes back with `id: null`.
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

export async function POST(req: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;
    const { supabase, adminEmail, adminId } = auth.data;

    const body = await req.json().catch(() => ({}));
    if (body?.confirm !== CONFIRM_PHRASE) {
      return NextResponse.json(
        { error: `Type "${CONFIRM_PHRASE}" exactly to confirm this action.` },
        { status: 400 }
      );
    }

    const admin = getAdmin();

    const { data: nonAdminProfiles, error: profilesErr } = await admin
      .from('profiles')
      .select('id')
      .or('is_admin.is.null,is_admin.eq.false');

    if (profilesErr) {
      return NextResponse.json({ error: profilesErr.message }, { status: 500 });
    }

    const ids = (nonAdminProfiles || [])
      .map((p: { id: string }) => p.id)
      .filter((id: string) => id !== adminId);

    if (ids.length === 0) {
      return NextResponse.json({ success: true, deletedUsers: 0 });
    }

    const idList = ids.join(',');
    const pairFilter = (col1: string, col2: string) => `${col1}.in.(${idList}),${col2}.in.(${idList})`;

    const { data: matchRows } = await admin
      .from('matches' as any)
      .select('id')
      .or(pairFilter('user1_id', 'user2_id'));
    const matchIds = (matchRows || []).map((m: { id: string }) => m.id);

    const { data: standardRows } = await admin
      .from('standards')
      .select('id')
      .in('woman_id', ids);
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
    await admin.from('standards').delete().in('woman_id', ids);

    await admin.from('likes' as any).delete().or(pairFilter('from_user_id', 'to_user_id'));
    await admin.from('nudges').delete().or(pairFilter('from_user_id', 'to_user_id'));
    await admin.from('notifications').delete().in('user_id', ids);
    await admin.from('reports').delete().or(pairFilter('reporter_id', 'reported_id'));
    await admin.from('blocked_pairs').delete().or(pairFilter('host_id', 'guest_id'));
    await admin.from('push_subscriptions').delete().in('user_id', ids);
    await admin.from('profile_edit_requests').delete().in('user_id', ids);
    await admin.from('photo_unlocks').delete().or(pairFilter('viewer_id', 'target_id'));
    await admin.from('coin_transactions').delete().in('user_id', ids);
    await admin.from('wallets').delete().in('user_id', ids);

    for (const bucket of STORAGE_BUCKETS) {
      for (const id of ids) {
        await deleteUserFolder(admin, bucket, id);
      }
    }

    await admin.from('profiles').delete().in('id', ids);

    let authDeleted = 0;
    for (const id of ids) {
      const { error } = await admin.auth.admin.deleteUser(id);
      if (!error) authDeleted += 1;
    }

    await logAuditAction(supabase, adminEmail, 'nuke_all_users', adminId, {
      deletedUserCount: ids.length,
      authDeleted,
    });

    return NextResponse.json({ success: true, deletedUsers: ids.length, authDeleted });
  } catch (err) {
    return NextResponse.json({ error: 'Nuke failed', detail: String(err) }, { status: 500 });
  }
}
