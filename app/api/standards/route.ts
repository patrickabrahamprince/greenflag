import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('profiles')
      .select('standards')
      .eq('id', user.id)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ standards: data?.standards || [] });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { standards } = await req.json();
    if (!Array.isArray(standards) || standards.length !== 8) {
      return NextResponse.json({ error: 'Exactly 8 standards required' }, { status: 400 });
    }

    const valid = standards.every(
      (s: unknown) =>
        typeof s === 'object' &&
        s !== null &&
        typeof (s as Record<string, unknown>).title === 'string' &&
        typeof (s as Record<string, unknown>).prompt === 'string' &&
        ['text', 'image'].includes((s as Record<string, unknown>).type as string)
    );
    if (!valid) {
      return NextResponse.json({ error: 'Each standard needs title, prompt, type (text|image)' }, { status: 400 });
    }

    const { error } = await supabase
      .from('profiles')
      .update({ standards })
      .eq('id', user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
