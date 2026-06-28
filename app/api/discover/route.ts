import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = getAdminClient();

    const { data: profile } = await admin
      .from('profiles')
      .select('persona, elo_score, looking_for_interests, lat, lng')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (profile.persona === 'woman') {
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get('page') || '0');

      const { data: profiles, error } = await admin
        .rpc('get_matching_profiles', { p_viewer_id: user.id });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ profiles: profiles || [] });
    }

    const { data: standard } = await admin
      .from('standards')
      .select('required_interests, values, deal_breakers')
      .eq('woman_id', user.id)
      .maybeSingle();

    const manInterests = standard?.required_interests ?? [];
    const manValues = standard?.values ?? [];
    const manDealbreakers = standard?.deal_breakers ?? [];

    const { data: matchResults, error: fetchError } = await admin.rpc('get_ranked_women', {
      man_interests: manInterests,
      man_values: manValues,
      man_dealbreakers: manDealbreakers,
      man_elo: profile.elo_score || 1000,
      man_id: user.id,
    });

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    type RankedWoman = { id: string; match_percentage: number; match_reasons: string[] };
    const matchResultsTyped = (matchResults ?? []) as RankedWoman[];
    const ranked = matchResultsTyped;

    if (ranked.length === 0) {
      return NextResponse.json({ profiles: [] });
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

    return NextResponse.json({ profiles });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
