import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const DEFAULT_PREFS = {
  messages: true,
  matches: true,
  nudges: true,
  dailyRecap: true,
  other: true,
};

type PrefKey = keyof typeof DEFAULT_PREFS;
const PREF_KEYS = Object.keys(DEFAULT_PREFS) as PrefKey[];

function asPartialPrefs(value: unknown): Partial<Record<PrefKey, boolean>> {
  return typeof value === 'object' && value !== null ? (value as Partial<Record<PrefKey, boolean>>) : {};
}

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('push_prefs')
    .eq('id', user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ prefs: { ...DEFAULT_PREFS, ...asPartialPrefs(data?.push_prefs) } });
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const updates: Partial<Record<PrefKey, boolean>> = {};
  for (const key of PREF_KEYS) {
    if (typeof body[key] === 'boolean') updates[key] = body[key];
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid preference fields provided' }, { status: 400 });
  }

  const { data: current, error: fetchError } = await supabase
    .from('profiles')
    .select('push_prefs')
    .eq('id', user.id)
    .single();
  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  const nextPrefs = { ...DEFAULT_PREFS, ...asPartialPrefs(current?.push_prefs), ...updates };

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ push_prefs: nextPrefs })
    .eq('id', user.id);
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ prefs: nextPrefs });
}
