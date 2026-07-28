import { NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { requireAdmin, logAuditAction } from '@/lib/admin/auth';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
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
    const { supabase, adminEmail } = auth.data;

    const { user_id, confirm_admin_purge } = await req.json();
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    if (user_id === auth.data.adminId) {
      return NextResponse.json({ error: 'Cannot purge yourself' }, { status: 400 });
    }

    const admin = getAdmin();

    const { data: target } = await admin
      .from('profiles')
      .select('is_admin')
      .eq('id', user_id)
      .maybeSingle();

    if (target?.is_admin && !confirm_admin_purge) {
      return NextResponse.json(
        { error: 'ADMIN_TARGET', message: 'This account is an admin. Resend with confirm_admin_purge: true to proceed.' },
        { status: 400 }
      );
    }

    const pairFilter = (col1: string, col2: string) => `${col1}.eq.${user_id},${col2}.eq.${user_id}`;

    const { data: matchRows } = await admin
      .from('matches' as any)
      .select('id')
      .or(pairFilter('user1_id', 'user2_id'));
    const matchIds = (matchRows || []).map((m: { id: string }) => m.id);

    const { data: standardRows } = await admin
      .from('standards')
      .select('id')
      .eq('woman_id', user_id);
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
    await admin.from('standards').delete().eq('woman_id', user_id);

    await admin.from('likes' as any).delete().or(pairFilter('from_user_id', 'to_user_id'));
    await admin.from('nudges').delete().or(pairFilter('from_user_id', 'to_user_id'));
    await admin.from('notifications').delete().eq('user_id', user_id);
    await admin.from('reports').delete().or(pairFilter('reporter_id', 'reported_id'));
    await admin.from('blocked_pairs').delete().or(pairFilter('host_id', 'guest_id'));
    await admin.from('push_subscriptions').delete().eq('user_id', user_id);
    await admin.from('profile_edit_requests').delete().eq('user_id', user_id);
    await admin.from('photo_unlocks').delete().or(pairFilter('viewer_id', 'target_id'));
    await admin.from('coin_transactions').delete().eq('user_id', user_id);
    await admin.from('wallets').delete().eq('user_id', user_id);

    for (const bucket of STORAGE_BUCKETS) {
      await deleteUserFolder(admin, bucket, user_id);
    }

    const { error: profileErr } = await admin.from('profiles').delete().eq('id', user_id);
    const { error: authErr } = await admin.auth.admin.deleteUser(user_id);

    if (profileErr || authErr) {
      return NextResponse.json(
        { error: 'Purge partially failed', detail: profileErr?.message || authErr?.message },
        { status: 500 }
      );
    }

    await logAuditAction(supabase, adminEmail, 'purge_user', user_id);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Purge failed', detail: String(err) }, { status: 500 });
  }
}
