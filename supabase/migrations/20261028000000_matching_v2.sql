-- Matching v2: unified RPC, PostGIS, trigger fix

BEGIN;

-- ========================================
-- 1. PostGIS extension (required for distance calc)
-- ========================================
CREATE EXTENSION IF NOT EXISTS postgis;

-- ========================================
-- 2. Add profiles columns for matching
-- ========================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS job TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS height TEXT;

UPDATE profiles SET onboarding_completed = true WHERE onboarding_complete = true;

-- ========================================
-- 3. Blocked pairs table
-- ========================================
CREATE TABLE IF NOT EXISTS blocked_pairs (
  id BIGSERIAL PRIMARY KEY,
  host_id UUID NOT NULL,
  guest_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(host_id, guest_id)
);
ALTER TABLE blocked_pairs ENABLE ROW LEVEL SECURITY;
GRANT ALL ON blocked_pairs TO anon, authenticated;

-- ========================================
-- 4. Last active trigger (SECURITY DEFINER to work from auth schema)
-- ========================================
CREATE OR REPLACE FUNCTION public.update_last_active()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles SET last_active = NOW() WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_sign_in ON auth.users;
CREATE TRIGGER on_auth_sign_in
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.update_last_active();

-- ========================================
-- 5. Unified matching RPC for both genders
-- ========================================
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

GRANT EXECUTE ON FUNCTION public.get_matching_profiles TO authenticated;

-- ========================================
-- 6. Update discover-men to use unified RPC
-- ========================================
DROP FUNCTION IF EXISTS public.get_matching_men;

COMMIT;

NOTIFY pgrst, 'reload schema';
