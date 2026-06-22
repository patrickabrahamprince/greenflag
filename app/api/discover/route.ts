import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const DAILY_LIMIT = 5;

function getISTDate(): string {
  const now = new Date();
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  return ist.toISOString().split('T')[0];
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = getAdminClient();

    const { data: manProfile } = await admin
      .from('profiles')
      .select('persona, elo_score')
      .eq('id', user.id)
      .single();

    if (manProfile?.persona !== 'man') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: standard } = await admin
      .from('standards')
      .select('required_interests, values, deal_breakers')
      .or(`user_id.eq.${user.id},woman_id.eq.${user.id}`)
      .maybeSingle();

    const manInterests = standard?.required_interests ?? [];
    const manValues = standard?.values ?? [];
    const manDealbreakers = standard?.deal_breakers ?? [];

    const today = getISTDate();

    const { count: todayViews } = await admin
      .from('daily_discover_views')
      .select('*', { count: 'exact', head: true })
      .eq('man_id', user.id)
      .eq('viewed_date', today);

    const viewedCount = todayViews ?? 0;
    if (viewedCount >= DAILY_LIMIT) {
      return NextResponse.json({ profiles: [], daily_limit_reached: true });
    }

    const { data: viewedToday } = await admin
      .from('daily_discover_views')
      .select('woman_id')
      .eq('man_id', user.id)
      .eq('viewed_date', today);

    const viewedIds = (viewedToday ?? []).map((v) => v.woman_id);

    const { data: matchResults, error: fetchError } = await admin.rpc('get_ranked_women', {
      man_interests: manInterests,
      man_values: manValues,
      man_dealbreakers: manDealbreakers,
      man_elo: manProfile.elo_score || 1000,
      man_id: user.id,
    });

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    type RankedWoman = { id: string; match_percentage: number; match_reasons: string[] };
    const matchResultsTyped = (matchResults ?? []) as RankedWoman[];
    let ranked = matchResultsTyped.filter((w) => !viewedIds.includes(w.id));

    const remaining = DAILY_LIMIT - viewedCount;
    ranked = ranked.slice(0, remaining);

    if (ranked.length === 0) {
      return NextResponse.json({ profiles: [], daily_limit_reached: false });
    }

    const rankedIds = ranked.map((w) => w.id);
    const matchByWomanId = new Map<string, { match_percentage: number; match_reasons: string[] }>(
      ranked.map((w) => [w.id, { match_percentage: w.match_percentage, match_reasons: w.match_reasons }])
    );

    const { data: fullProfiles } = await admin
      .from('profiles')
      .select('id, name, age, city, city_auto, bio, photos, interests, looking_for_interests, interests_have, interests_looking_for, blur_key')
      .in('id', rankedIds);

    const idOrder = new Map<string, number>(rankedIds.map((id, i) => [id, i]));
    type ProfileWithOrder = Record<string, unknown> & { id: string };
    const raw: ProfileWithOrder[] = (fullProfiles ?? []) as ProfileWithOrder[];
    const profiles = raw
      .sort((a, b) => ((idOrder.get(a.id) as number) ?? 0) - ((idOrder.get(b.id) as number) ?? 0))
      .map((p) => {
        const match = matchByWomanId.get(p.id);
        if (!match) return p;
        return { ...p, match_percentage: match.match_percentage, match_reasons: match.match_reasons };
      });

    if (profiles.length > 0) {
      const viewRows = profiles.map((p) => ({
        man_id: user.id,
        woman_id: p.id,
        viewed_date: today,
      }));
      await admin.from('daily_discover_views').insert(viewRows);
    }

    return NextResponse.json({
      profiles,
      daily_limit_reached: viewedCount + profiles.length >= DAILY_LIMIT,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
