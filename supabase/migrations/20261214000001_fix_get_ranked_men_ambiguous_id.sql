-- Isolated fix: get_ranked_men() threw "column reference \"id\" is
-- ambiguous" (42702) on every call, breaking the women's Discover feed
-- entirely. Root cause: `RETURNS TABLE (id UUID, ...)` implicitly declares
-- a PL/pgSQL variable named `id` scoped to the whole function; the
-- unqualified `WHERE id = woman_id` on the preliminary profile lookup
-- collided with it. Every other reference in this function already used
-- the `p.` alias correctly -- this was the one unqualified spot.
--
-- 20261213000002_ranking_functions.sql (where this function was first
-- defined) already has this same fix applied in the repo for future fresh
-- replays; this is the separate patch for the copy already live on
-- production, which won't re-read that file.
CREATE OR REPLACE FUNCTION public.get_ranked_men(woman_id UUID)
RETURNS TABLE (id UUID, match_percentage INT, match_reasons TEXT[])
LANGUAGE plpgsql
STABLE
SET search_path = public, extensions
AS $$
DECLARE
  v_woman_lat DOUBLE PRECISION;
  v_woman_lng DOUBLE PRECISION;
  v_woman_interests_have TEXT[];
  v_woman_interests TEXT[];
BEGIN
  SELECT lat, lng, interests_have, interests
    INTO v_woman_lat, v_woman_lng, v_woman_interests_have, v_woman_interests
  FROM profiles WHERE profiles.id = woman_id;

  RETURN QUERY
  SELECT
    p.id,
    public.compute_match_score(woman_id, p.id, false) AS match_percentage,
    ARRAY(
      SELECT UNNEST(
        CASE WHEN COALESCE(array_length(v_woman_interests_have, 1), 0) > 0
          THEN v_woman_interests_have ELSE COALESCE(v_woman_interests, '{}') END
      )
      INTERSECT
      SELECT UNNEST(
        CASE WHEN COALESCE(array_length(p.interests_looking_for, 1), 0) > 0
          THEN p.interests_looking_for ELSE COALESCE(p.looking_for_interests, '{}') END
      )
    ) AS match_reasons
  FROM profiles p
  WHERE p.persona = 'man'
    AND p.onboarding_completed = true
    AND p.is_banned = false
    AND p.is_active = true
    AND p.approval_status = 'approved'
    AND p.id != woman_id
    AND NOT EXISTS (
      SELECT 1 FROM likes l WHERE l.from_user_id = p.id AND l.to_user_id = woman_id
    )
    AND NOT EXISTS (
      SELECT 1 FROM matches m
      WHERE (m.user1_id = woman_id AND m.user2_id = p.id)
         OR (m.user2_id = woman_id AND m.user1_id = p.id)
    )
    AND NOT EXISTS (
      SELECT 1 FROM blocked_pairs b
      WHERE (b.host_id = woman_id AND b.guest_id = p.id)
         OR (b.guest_id = woman_id AND b.host_id = p.id)
    )
    AND (
      v_woman_lat IS NULL OR p.lat IS NULL
      OR ST_DWithin(
        ST_MakePoint(v_woman_lng, v_woman_lat)::geography,
        ST_MakePoint(p.lng, p.lat)::geography,
        50000
      )
    )
  ORDER BY match_percentage DESC, p.last_active DESC NULLS LAST
  LIMIT 20;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_ranked_men(UUID) TO authenticated;

NOTIFY pgrst, 'reload schema';
