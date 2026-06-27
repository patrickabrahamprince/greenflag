import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { day_number, content, type } = await req.json();
    if (!day_number || !content) {
      return NextResponse.json({ error: 'day_number and content are required' }, { status: 400 });
    }

    const mediaType = type || 'text';

    const { error } = await supabase.from('submissions').insert({
      connection_id: id,
      day_number,
      status: 'submitted',
      media_type: mediaType,
      ...(mediaType === 'text' ? { proof_text: content } : { proof_url: content }),
      submitted_at: new Date().toISOString(),
    } as any);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
