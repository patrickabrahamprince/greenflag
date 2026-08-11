import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { TypedSupabaseClient } from '@/lib/supabase/server';
import type { Json } from '@/types/supabase';

export interface AdminAuthResult {
  supabase: TypedSupabaseClient;
  adminId: string;
  adminEmail: string;
}

export async function requireAdmin(): Promise<
  { ok: true; data: AdminAuthResult } | { ok: false; response: NextResponse }
> {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session')?.value;

  // Check for admin_session cookie (separate admin auth system)
  if (adminSession) {
    const supabase = await createServerSupabaseClient();
    return {
      ok: true,
      data: {
        supabase,
        adminId: 'admin',
        adminEmail: process.env.ADMIN_EMAIL || 'admin@greenflag',
      },
    };
  }

  // Fallback to Supabase auth for backwards compatibility
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
  targetId: string,
  metadata?: Record<string, Json>
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from('audit_logs').insert({
    admin_id: user?.id,
    action,
    target_id: targetId,
    metadata: (metadata ?? {}) as Json,
  });
}
