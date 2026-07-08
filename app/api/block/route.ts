import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { blocked_id } = await req.json();
    if (!blocked_id) {
      return NextResponse.json({ error: 'blocked_id is required' }, { status: 400 });
    }

    if (user.id === blocked_id) {
      return NextResponse.json({ error: 'Cannot block yourself' }, { status: 400 });
    }

    const { error } = await supabase
      .from('blocked_pairs')
      .upsert({ host_id: user.id, guest_id: blocked_id }, { onConflict: 'host_id,guest_id' });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
