-- Fix: use guest_id/host_id + cast persona enums
CREATE OR REPLACE FUNCTION public.get_matching_profiles(p_viewer_id uuid)
RETURNS SETOF profiles
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.*
  FROM profiles p
  WHERE p.persona = CASE
    WHEN (SELECT persona FROM profiles WHERE id = p_viewer_id) = 'man'::user_role THEN 'woman'::user_role
    WHEN (SELECT persona FROM profiles WHERE id = p_viewer_id) = 'woman'::user_role THEN 'man'::user_role
  END
  AND p.id <> p_viewer_id
  AND NOT EXISTS (
    SELECT 1 FROM connections c
    WHERE (c.guest_id = p_viewer_id AND c.host_id = p.id)
       OR (c.host_id = p_viewer_id AND c.guest_id = p.id)
  )
  -- 50km radius filter: only if both users have lat/lng
  AND (
    (SELECT lat FROM profiles WHERE id = p_viewer_id) IS NULL
    OR p.lat IS NULL
    OR ST_DWithin(
      ST_MakePoint((SELECT lng FROM profiles WHERE id = p_viewer_id), (SELECT lat FROM profiles WHERE id = p_viewer_id))::geography,
      ST_MakePoint(p.lng, p.lat)::geography,
      50000 -- 50km in meters
    )
  )
  ORDER BY p.created_at DESC
  LIMIT 20;
$$;

-- Add spatial index for speed
CREATE INDEX IF NOT EXISTS idx_profiles_geo
ON profiles USING GIST ((ST_MakePoint(lng, lat)::geography))
WHERE lat IS NOT NULL AND lng IS NOT NULL;
