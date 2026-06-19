import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { host_id } = await req.json();
    if (!host_id) {
      return NextResponse.json({ error: 'host_id is required' }, { status: 400 });
    }

    if (user.id === host_id) {
      return NextResponse.json({ error: 'Cannot apply to yourself' }, { status: 400 });
    }

    const { data, error } = await supabase.rpc('start_connection', { p_host_id: host_id });
    if (error) {
      if (error.message.includes('Insufficient coins')) {
        return NextResponse.json({ error: 'insufficient_funds' }, { status: 402 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
