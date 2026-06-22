-- Matchmaking v3: interest-based scoring with ELO + dealbreakers

-- 1. Add interest fields to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS elo_score int DEFAULT 1000,
ADD COLUMN IF NOT EXISTS last_active timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS profiles_interests_gin ON profiles USING gin(interests);
CREATE INDEX IF NOT EXISTS profiles_elo_idx ON profiles(elo_score DESC);

-- 2. Add requirement fields to standards
ALTER TABLE standards
ADD COLUMN IF NOT EXISTS required_interests text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS values text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS deal_breakers text[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS standards_interests_gin ON standards USING gin(required_interests);

-- 3. Add match metadata to connections
ALTER TABLE connections
ADD COLUMN IF NOT EXISTS match_percentage int,
ADD COLUMN IF NOT EXISTS match_reasons jsonb;

-- 4. Core matching function: returns ranked women for a man
CREATE OR REPLACE FUNCTION get_ranked_women(
  man_interests text[],
  man_values text[],
  man_dealbreakers text[],
  man_elo int,
  man_id uuid
)
RETURNS TABLE(
  id uuid,
  name text,
  bio text,
  avatar_url text,
  interests text[],
  elo_score int,
  match_percentage int,
  match_reasons text[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH scored AS (
    SELECT
      p.id, p.name, p.bio, p.photos[1] as avatar_url, p.interests, p.elo_score, p.last_active,
      (CARDINALITY(ARRAY(
        SELECT UNNEST(p.interests) INTERSECT SELECT UNNEST(man_interests)
      )) * 100 / GREATEST(CARDINALITY(man_interests), 1))::int as match_percentage,
      ARRAY(
        SELECT UNNEST(p.interests) INTERSECT SELECT UNNEST(man_interests)
      ) as match_reasons
    FROM profiles p
    WHERE p.persona = 'woman'
      AND p.is_active = true
      AND p.is_banned = false
      AND NOT EXISTS (
        SELECT 1 FROM connections c
        WHERE c.host_id = p.id
          AND c.guest_id = man_id
          AND c.status IN ('pending','active','tasks_submitted','approved','chat_unlocked','completed','failed','rejected','frozen')
      )
      AND NOT p.interests && man_dealbreakers
      AND p.elo_score BETWEEN man_elo - 200 AND man_elo + 200
  )
  SELECT id, name, bio, avatar_url, interests, elo_score, match_percentage, match_reasons
  FROM scored
  ORDER BY
    match_percentage DESC,
    elo_score DESC,
    last_active DESC
  LIMIT 5;
$$;

GRANT EXECUTE ON FUNCTION get_ranked_women TO authenticated;

NOTIFY pgrst, 'reload schema';
