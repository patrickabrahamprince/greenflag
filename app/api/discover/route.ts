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
      .select('persona, elo_score, interests, interests_have, looking_for_interests, lat, lng')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (profile.persona === 'woman') {
      const { data: profiles, error } = await admin
        .rpc('get_matching_profiles', { p_viewer_id: user.id });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // get_matching_profiles() returns plain profile rows with no match
      // score, unlike get_ranked_women() on the men's side. Compute the
      // same style of overlap score here so the Standard Match badge and
      // interest-overlap highlighting show on the women's feed too: her
      // own interests vs what each man says he's looking for.
      const herInterests = (profile.interests_have?.length ? profile.interests_have : profile.interests) ?? [];
      const scored = (profiles || []).map((p: any) => {
        const hisLookingFor = (p.interests_looking_for?.length ? p.interests_looking_for : p.looking_for_interests) ?? [];
        const overlap = herInterests.filter((i: string) => hisLookingFor.includes(i));
        return {
          ...p,
          match_percentage: Math.min(100, overlap.length * 20),
          match_reasons: overlap,
        };
      });

      return NextResponse.json({ profiles: scored });
    }

    // get_ranked_women() intersects man_interests against each woman's
    // looking_for_interests, so this must be the man's own interests — not a
    // `standards` row, which belongs to a woman (standards.woman_id), never
    // to the man viewing the feed. The old `standards.woman_id = user.id`
    // lookup always returned nothing, so every match scored 0%.
    const manInterests = profile.interests ?? [];
    const manValues: string[] = [];
    const manDealbreakers: string[] = [];

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
      .select('id, name, age, city, city_auto, bio, photos, interests, looking_for_interests, interests_have, interests_looking_for, blur_key, instagram_url')
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
