import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: standard } = await supabase
      .from('standards')
      .select('id, is_active')
      .eq('woman_id', user.id)
      .order('is_active', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!standard) {
      return NextResponse.json({ standardId: null, isActive: false, intentions: [] });
    }

    const { data: intentions } = await supabase
      .from('intentions')
      .select('day_number, task_number, type, prompt')
      .eq('standard_id', standard.id)
      .order('day_number')
      .order('task_number');

    return NextResponse.json({
      standardId: standard.id,
      isActive: !!standard.is_active,
      intentions: intentions || [],
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
