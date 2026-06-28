-- =====================================================
-- SHIP PHASE 1: critical schema/RPC fixes
-- 1. submissions.approved column (backfill from moderation_status)
-- 2. get_ranked_women RPC
-- 3. standards.user_id -> woman_id cleanup
-- 4. persona as source of truth, drop gender
-- 5. messages RLS requires chat_unlocked
-- =====================================================

-- 1.1 — submissions.approved
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS approved boolean DEFAULT false;
UPDATE submissions SET approved = true WHERE moderation_status = 'approved' AND approved = false;

-- 1.2 — get_ranked_women: ranks women for a man based on interest/value overlap
DROP FUNCTION IF EXISTS get_ranked_women(TEXT[], TEXT[], TEXT[], INT, UUID);
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
    LEAST(
      (CARDINALITY(ARRAY(
        SELECT UNNEST(p.looking_for_interests)
        INTERSECT
        SELECT UNNEST(man_interests)
      )) * 20),
      100
    )::INT AS match_percentage,
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
    AND p.id != man_id
    AND p.id NOT IN (
      SELECT host_id FROM connections WHERE guest_id = man_id
      UNION
      SELECT host_id FROM blocked_pairs WHERE guest_id = man_id
      UNION
      SELECT guest_id FROM blocked_pairs WHERE host_id = man_id
    )
  ORDER BY match_percentage DESC, p.last_active DESC NULLS LAST;
END;
$$;
GRANT EXECUTE ON FUNCTION get_ranked_women TO authenticated;

-- 1.3 — standards.user_id cleanup (woman_id is already canonical per 20261106 migration)
-- CASCADE: a pre-existing "standards_modify_own" RLS policy (not present in any
-- tracked migration — created out-of-band on the live DB) still references
-- user_id. Its logic is already superseded by the woman_id-based policies
-- "Women manage own standards" / "Anyone can read active standards" added in
-- 20261106000000_full_spec.sql, so dropping it here is safe.
ALTER TABLE standards DROP COLUMN IF EXISTS user_id CASCADE;

-- 1.4 — persona as source of truth; backfill + drop gender
UPDATE profiles SET persona = (CASE WHEN gender IN ('woman','host') THEN 'woman' ELSE 'man' END)::user_role
WHERE persona IS NULL AND gender IS NOT NULL;

CREATE OR REPLACE FUNCTION public.get_my_gender()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT persona::TEXT FROM public.profiles WHERE id = auth.uid();
$$;

DROP POLICY IF EXISTS "view_opposite_gender" ON profiles;
CREATE POLICY "view_opposite_gender" ON profiles
  FOR SELECT USING (
    is_active = true
    AND persona != public.get_my_gender()::user_role
  );

CREATE OR REPLACE FUNCTION public.get_matching_profiles(
  p_user_id UUID,
  p_viewing_gender TEXT,
  p_user_interests TEXT[],
  p_user_standards TEXT[],
  p_user_lat DOUBLE PRECISION,
  p_user_lng DOUBLE PRECISION,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID, name TEXT, age INT, photos TEXT[], bio TEXT, job TEXT, height TEXT,
  city_auto TEXT, interests TEXT[], looking_for_interests TEXT[],
  match_percent INT, distance_km INT, last_active TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  v_compare_field TEXT;
  v_compare_values TEXT[];
BEGIN
  IF p_viewing_gender = 'woman' THEN
    v_compare_field := 'looking_for_interests';
    v_compare_values := p_user_interests;
  ELSE
    v_compare_field := 'interests';
    v_compare_values := p_user_standards;
  END IF;

  RETURN QUERY EXECUTE format('
    SELECT
      p.id, p.name, p.age, p.photos, p.bio, p.job, p.height,
      p.city_auto, p.interests, p.looking_for_interests,
      LEAST(
        (CARDINALITY(ARRAY(
          SELECT UNNEST(p.%I)
          INTERSECT
          SELECT UNNEST($2::TEXT[])
        )) * 20),
        100
      )::INT AS match_percent,
      COALESCE(
        ROUND(ST_Distance(
          ST_MakePoint(p.lng, p.lat)::geography,
          ST_MakePoint($4, $3)::geography
        ) / 1000)::INT,
        0
      ) AS distance_km,
      p.last_active
    FROM profiles p
    WHERE p.persona = $1::user_role
      AND p.onboarding_completed = true
      AND p.is_banned = false
      AND p.id != $5
      AND p.id NOT IN (
        SELECT CASE WHEN $6 = ''woman'' THEN guest_id ELSE host_id END
        FROM connections WHERE host_id = $5 OR guest_id = $5
        UNION
        SELECT CASE WHEN $6 = ''woman'' THEN guest_id ELSE host_id END
        FROM blocked_pairs WHERE host_id = $5 OR guest_id = $5
      )
      AND CARDINALITY(ARRAY(
        SELECT UNNEST(p.%I)
        INTERSECT
        SELECT UNNEST($2::TEXT[])
      )) > 0
    ORDER BY match_percent DESC, p.last_active DESC
    LIMIT $7 OFFSET $8
  ', v_compare_field, v_compare_field)
  USING
    p_viewing_gender,
    v_compare_values,
    p_user_lat, p_user_lng, p_user_id,
    CASE WHEN p_viewing_gender = 'woman' THEN 'man' ELSE 'woman' END,
    p_limit, p_offset;
END;
$$;

-- CASCADE: same drift pattern as standards.user_id above — untracked policies
-- or indexes on the live DB may still reference gender. Functions/dynamic SQL
-- bodies are not tracked as catalog dependencies, so CASCADE here only drops
-- direct dependents (policies/indexes/check constraints), not other functions.
ALTER TABLE profiles DROP COLUMN IF EXISTS gender CASCADE;

-- 1.5 — messages RLS requires chat_unlocked
DROP POLICY IF EXISTS "messages_participant" ON messages;
DROP POLICY IF EXISTS "messages_guest" ON messages;
DROP POLICY IF EXISTS "messages_host" ON messages;

CREATE POLICY "messages_participant" ON messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM connections c
      WHERE c.id = connection_id
        AND (c.guest_id = auth.uid() OR c.host_id = auth.uid())
        AND c.chat_unlocked = true
    )
  );
