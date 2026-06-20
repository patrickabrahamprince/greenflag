-- Fix matching RPC to filter out banned users
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
  IF p_viewing_gender = 'host' THEN
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
    WHERE p.gender = $1
      AND p.onboarding_completed = true
      AND p.is_banned = false
      AND p.id != $5
      AND p.id NOT IN (
        SELECT CASE WHEN $6 = ''host'' THEN guest_id ELSE host_id END
        FROM connections WHERE host_id = $5 OR guest_id = $5
        UNION
        SELECT CASE WHEN $6 = ''host'' THEN guest_id ELSE host_id END
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
    CASE WHEN p_viewing_gender = 'host' THEN 'guest' ELSE 'host' END,
    p_limit, p_offset;
END;
$$;
