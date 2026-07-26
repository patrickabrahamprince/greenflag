import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin, logAuditAction } from '@/lib/admin/auth';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// QA utility: wipes any match (+ its submissions/funnel_events) and any
// `likes` row between two arbitrary profiles, so testers can redo the full
// 3-day Standard flow between the same two accounts without creating new
// ones each time. Deliberately does not touch coin balances -- admins can
// top a tester back up via the existing per-user Credit Coins action.
export async function POST(req: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;
    const { supabase, adminEmail } = auth.data;

    const { userIdA, userIdB } = await req.json();
    if (!userIdA || !userIdB || typeof userIdA !== 'string' || typeof userIdB !== 'string') {
      return NextResponse.json({ error: 'userIdA and userIdB are required' }, { status: 400 });
    }
    if (!UUID_RE.test(userIdA) || !UUID_RE.test(userIdB)) {
      return NextResponse.json({ error: 'Invalid profile id' }, { status: 400 });
    }
    if (userIdA === userIdB) {
      return NextResponse.json({ error: 'Pick two different profiles' }, { status: 400 });
    }

    const admin = getAdmin();

    const { data: matches, error: matchErr } = await admin
      .from('matches')
      .select('id')
      .or(`and(user1_id.eq.${userIdA},user2_id.eq.${userIdB}),and(user1_id.eq.${userIdB},user2_id.eq.${userIdA})`);

    if (matchErr) return NextResponse.json({ error: matchErr.message }, { status: 500 });

    const matchIds = (matches || []).map((m) => m.id);
    let submissionsDeleted = 0;

    if (matchIds.length > 0) {
      const { count } = await admin
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .in('match_id', matchIds);
      submissionsDeleted = count || 0;

      await admin.from('submissions').delete().in('match_id', matchIds);
      await admin.from('funnel_events').delete().in('match_id', matchIds);
      await admin.from('matches').delete().in('id', matchIds);
    }

    await admin
      .from('likes')
      .delete()
      .or(`and(from_user_id.eq.${userIdA},to_user_id.eq.${userIdB}),and(from_user_id.eq.${userIdB},to_user_id.eq.${userIdA})`);

    await logAuditAction(supabase, adminEmail, 'reset_connection', userIdA, {
      other_user_id: userIdB,
      matches_deleted: matchIds.length,
      submissions_deleted: submissionsDeleted,
    });

    return NextResponse.json({
      success: true,
      matchesDeleted: matchIds.length,
      submissionsDeleted,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
