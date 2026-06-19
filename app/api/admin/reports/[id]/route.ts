import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { status, admin_notes } = await req.json();

    const { error } = await supabase
      .from('reports')
      .update({
        status,
        admin_notes: admin_notes || null,
        resolved_at: new Date().toISOString(),
        resolved_by: user.id,
      })
      .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (status === 'actioned') {
      await supabase.from('admin_actions').insert({
        admin_id: user.id,
        action: 'actioned_report',
        target_id: id,
        metadata: JSON.parse(admin_notes || '{}'),
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
