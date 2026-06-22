import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reported_id, reason, details } = await req.json();
    if (!reported_id || !reason) {
      return NextResponse.json({ error: 'reported_id and reason are required' }, { status: 400 });
    }

    if (user.id === reported_id) {
      return NextResponse.json({ error: 'Cannot report yourself' }, { status: 400 });
    }

    const { error } = await supabase.from('reports').insert({
      reporter_id: user.id,
      reported_id,
      reason,
      details: details || null,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
