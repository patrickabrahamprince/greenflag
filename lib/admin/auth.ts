import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { TypedSupabaseClient } from '@/lib/supabase/server';

export interface AdminAuthResult {
  supabase: TypedSupabaseClient;
  adminId: string;
  adminEmail: string;
}

export async function requireAdmin(): Promise<
  { ok: true; data: AdminAuthResult } | { ok: false; response: NextResponse }
> {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return {
    ok: true,
    data: { supabase, adminId: user.id, adminEmail: user.email || '' },
  };
}

export async function logAuditAction(
  supabase: TypedSupabaseClient,
  _adminEmail: string,
  action: string,
  targetId: string
): Promise<void> {
  await supabase.from('audit_logs').insert({
    action,
    target_id: targetId,
  });
}
