import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: sub, error: updateError } = await supabase
      .from('submissions')
      .update({ approved: true })
      .eq('id', id)
      .select('connection_id')
      .single();

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    if (sub) {
      await (supabase.rpc as any)('advance_day_if_complete', { p_connection_id: sub.connection_id });
    }

    return NextResponse.json({ success: true, submission_id: id, status: 'approved' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
