-- man_quality_multiplier / woman_responsiveness_multiplier: new ranking
-- feedback-loop inputs. woman_responsiveness deliberately does NOT reuse
-- man_quality's "unsuccessful = rejected+expired_no_submission+refunded"
-- bucket wholesale -- a woman's `rejected` decision is a legitimate choice,
-- not a fault, so only `refunded` (an actual lateness problem) plus her
-- late_review_count counts against her.

CREATE OR REPLACE FUNCTION public.man_quality_multiplier(p_man_id UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT CASE WHEN (completed + unsuccessful) = 0 THEN 1.0
    ELSE GREATEST(0.7, LEAST(1.3, 0.7 + 0.6 * (completed::numeric / (completed + unsuccessful))))
  END
  FROM (
    SELECT
      COUNT(*) FILTER (WHERE status = 'completed') AS completed,
      COUNT(*) FILTER (WHERE status IN ('rejected','expired_no_submission','refunded')) AS unsuccessful
    FROM matches
    WHERE user1_id = p_man_id
  ) s;
$$;
GRANT EXECUTE ON FUNCTION public.man_quality_multiplier(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.woman_responsiveness_multiplier(p_woman_id UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT GREATEST(0.7, LEAST(1.2,
    1.0
    - 0.05 * COALESCE((SELECT late_review_count FROM profiles WHERE id = p_woman_id), 0)
    - 0.1  * (SELECT COUNT(*) FROM matches WHERE user2_id = p_woman_id AND status = 'refunded')
  ));
$$;
GRANT EXECUTE ON FUNCTION public.woman_responsiveness_multiplier(UUID) TO authenticated;

-- compute_match_score(): reproduces get_ranked_women()'s existing inline
-- scoring (man branch) and app/api/discover/route.ts's TS scoring (woman
-- branch) byte-for-byte on the fallback semantics, then applies the
-- TARGET's multiplier -- a viewer-based multiplier would be constant across
-- one viewer's whole feed and couldn't change ranking order at all.
CREATE OR REPLACE FUNCTION public.compute_match_score(
  p_viewer_id UUID,
  p_target_id UUID,
  p_viewer_is_man BOOLEAN
)
RETURNS INT
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  v_overlap INT;
  v_multiplier NUMERIC;
  v_viewer_interests TEXT[];
  v_viewer_interests_have TEXT[];
  v_target_a TEXT[];
  v_target_b TEXT[];
BEGIN
  IF p_viewer_is_man THEN
    SELECT interests INTO v_viewer_interests FROM profiles WHERE id = p_viewer_id;
    SELECT looking_for_interests INTO v_target_a FROM profiles WHERE id = p_target_id;

    v_overlap := CARDINALITY(ARRAY(
      SELECT UNNEST(COALESCE(v_target_a, '{}'))
      INTERSECT
      SELECT UNNEST(COALESCE(v_viewer_interests, '{}'))
    ));

    v_multiplier := public.woman_responsiveness_multiplier(p_target_id);
  ELSE
    SELECT interests_have, interests INTO v_viewer_interests_have, v_viewer_interests
    FROM profiles WHERE id = p_viewer_id;
    SELECT interests_looking_for, looking_for_interests INTO v_target_a, v_target_b
    FROM profiles WHERE id = p_target_id;

    v_overlap := CARDINALITY(ARRAY(
      SELECT UNNEST(
        CASE WHEN COALESCE(array_length(v_viewer_interests_have, 1), 0) > 0
          THEN v_viewer_interests_have ELSE COALESCE(v_viewer_interests, '{}') END
      )
      INTERSECT
      SELECT UNNEST(
        CASE WHEN COALESCE(array_length(v_target_a, 1), 0) > 0
          THEN v_target_a ELSE COALESCE(v_target_b, '{}') END
      )
    ));

    v_multiplier := public.man_quality_multiplier(p_target_id);
  END IF;

  RETURN LEAST(100, ROUND(v_overlap * 20 * v_multiplier));
END;
$$;
GRANT EXECUTE ON FUNCTION public.compute_match_score(UUID, UUID, BOOLEAN) TO authenticated;

-- get_ranked_women(): same candidate filter as
-- 20261208000000_add_approval_status.sql, scoring delegated to compute_match_score.
CREATE OR REPLACE FUNCTION get_ranked_women(
  man_interests TEXT[],
  man_values TEXT[],
  man_dealbreakers TEXT[],
  man_elo INT,
  man_id UUID
)
RETURNS TABLE (id UUID, match_percentage INT, match_reasons TEXT[])
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    public.compute_match_score(man_id, p.id, true) AS match_percentage,
    ARRAY(
      SELECT UNNEST(p.looking_for_interests)
      INTERSECT
      SELECT UNNEST(man_interests)
    ) AS match_reasons
  FROM profiles p
  WHERE p.persona = 'woman'
    AND p.onboarding_completed = true
    AND p.is_banned = false
    AND p.is_active = true
    AND p.approval_status = 'approved'
    AND p.id != man_id
    AND p.id NOT IN (
      SELECT to_user_id FROM likes WHERE from_user_id = man_id
      UNION
      SELECT user1_id FROM matches WHERE user2_id = man_id
      UNION
      SELECT user2_id FROM matches WHERE user1_id = man_id
      UNION
      SELECT host_id FROM blocked_pairs WHERE guest_id = man_id
      UNION
      SELECT guest_id FROM blocked_pairs WHERE host_id = man_id
    )
  ORDER BY match_percentage DESC, p.last_active DESC NULLS LAST;
END;
$$;
GRANT EXECUTE ON FUNCTION get_ranked_women(TEXT[], TEXT[], TEXT[], INT, UUID) TO authenticated;

-- New: get_ranked_men() fully replaces get_matching_profiles() for the
-- women's feed, mirroring get_ranked_women()'s shape and
-- get_matching_profiles()'s candidate filter (opposite persona, not
-- liked/matched, blocked_pairs both directions, 50km radius, LIMIT 20).
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
  FROM profiles WHERE id = woman_id;

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
