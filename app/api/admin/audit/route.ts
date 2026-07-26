import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';

const MAX_LIMIT = 200;
// Both source tables are fetched in a generous recent batch and merged in
// JS (see comment below on why), so this caps how far back each source
// query looks before merging/filtering/paginating.
const SOURCE_FETCH_SIZE = 500;

interface RawEntry {
  id: string | number;
  admin_id: string | null;
  action: string;
  target_id: string | null;
  target_type?: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  admin?: { name: string | null } | { name: string | null }[] | null;
}

function adminName(entry: RawEntry): string {
  const admin = Array.isArray(entry.admin) ? entry.admin[0] : entry.admin;
  return admin?.name || 'system';
}

export async function GET(req: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;
    const { supabase } = auth.data;

    const { searchParams } = new URL(req.url);
    const parsedLimit = parseInt(searchParams.get('limit') || '50', 10);
    const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), MAX_LIMIT) : 50;
    const parsedOffset = parseInt(searchParams.get('offset') || '0', 10);
    const offset = Number.isFinite(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0;
    const action = searchParams.get('action') || '';
    const adminNameFilter = (searchParams.get('admin_email') || '').toLowerCase();

    // audit_logs and admin_actions are two separate, independently-written
    // logs for the same kind of event (see lib/admin/auth.ts's
    // logAuditAction vs the admin_ban_user/admin_set_admin/etc RPCs, which
    // write to admin_actions directly). Neither is a superset of the
    // other, so both need to be read and merged for a complete picture --
    // e.g. set_admin/revoke_admin only ever appear in admin_actions.
    const [auditRes, actionsRes] = await Promise.all([
      supabase
        .from('audit_logs')
        .select('id, admin_id, action, target_id, target_type, metadata, created_at, admin:profiles!admin_id(name)')
        .order('created_at', { ascending: false })
        .limit(SOURCE_FETCH_SIZE),
      supabase
        .from('admin_actions')
        .select('id, admin_id, action, target_id, metadata, created_at, admin:profiles!admin_id(name)')
        .order('created_at', { ascending: false })
        .limit(SOURCE_FETCH_SIZE),
    ]);

    if (auditRes.error) return NextResponse.json({ error: auditRes.error.message }, { status: 500 });
    if (actionsRes.error) return NextResponse.json({ error: actionsRes.error.message }, { status: 500 });

    let merged = [...(auditRes.data || []), ...(actionsRes.data || [])] as RawEntry[];
    merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (action) merged = merged.filter((e) => e.action === action);
    if (adminNameFilter) merged = merged.filter((e) => adminName(e).toLowerCase().includes(adminNameFilter));

    const page = merged.slice(offset, offset + limit).map((e) => ({
      id: e.id,
      admin_id: e.admin_id,
      admin_email: adminName(e),
      action: e.action,
      target_id: e.target_id,
      target_type: e.target_type ?? null,
      metadata: e.metadata,
      created_at: e.created_at,
    }));

    return NextResponse.json({ entries: page });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
