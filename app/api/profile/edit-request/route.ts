import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Json } from '@/types/supabase';

const EDITABLE_FIELDS = ['name', 'age', 'city', 'bio', 'photos'] as const;
type EditableField = (typeof EDITABLE_FIELDS)[number];

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data } = await supabase
    .from('profile_edit_requests')
    .select('id, requested_changes, status, created_at')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .maybeSingle();

  return NextResponse.json({ pendingRequest: data || null });
}

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const requestedChanges: Partial<Record<EditableField, Json>> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) requestedChanges[field] = body[field];
  }
  if (Object.keys(requestedChanges).length === 0) {
    return NextResponse.json({ error: 'No editable fields provided' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('profile_edit_requests')
    .insert({ user_id: user.id, requested_changes: requestedChanges })
    .select('id')
    .single();

  if (error) {
    // Partial unique index (user_id) WHERE status = 'pending' -- this is
    // the "only 1 pending change at a time" rule enforced at the DB level.
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'You already have a change request awaiting approval' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: data.id });
}
