import { NextResponse } from 'next/server';
import { requireAdmin, getAdminClient } from '@/lib/admin';

export const dynamic = 'force-dynamic'; // always run on request

// POST /api/admin/kill-switch
export async function POST(req: Request) {
  try {
    const { flag, value } = (await req.json()) as { flag: string; value: boolean };

    // 1. Verify admin authentication & role checks
    const adminRes = await requireAdmin();
    if (adminRes instanceof Response) {
      return adminRes;
    }
    const adminId = adminRes.adminId;

    // 2. Validate flag
    const allowed = [
      'signups_enabled',
      'submissions_enabled',
      'new_matches_enabled',
      'maintenance_mode',
    ];
    if (!allowed.includes(flag)) {
      return NextResponse.json({ error: 'Invalid flag' }, { status: 400 });
    }

    // 3. Update flag in database using admin client
    const adminClient = getAdminClient();
    const { error: updateError } = await adminClient
      .from('feature_flags')
      .update({ value, updated_by: adminId })
      .eq('key', flag);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 4. Log to audit_logs
    await adminClient.from('audit_logs').insert([
      {
        admin_id: adminId,
        action: 'kill_switch_update',
        target_id: null,
        details: { flag, value },
      },
    ]);

    return NextResponse.json({ success: true, flag, value });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
