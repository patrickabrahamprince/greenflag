-- Discover Men: matching system for women to find men

-- 1. Blocked pairs table
CREATE TABLE IF NOT EXISTS public.blocked_pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_blocked_pairs_blocker ON public.blocked_pairs(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_pairs_blocked ON public.blocked_pairs(blocked_id);

-- 2. Enable RLS on blocked_pairs
ALTER TABLE public.blocked_pairs ENABLE ROW LEVEL SECURITY;

-- Policies: users can insert/select their own blocks
CREATE POLICY "Users can block others" ON public.blocked_pairs
  FOR INSERT TO authenticated
  WITH CHECK (blocker_id = auth.uid());

CREATE POLICY "Users can view their own blocks" ON public.blocked_pairs
  FOR SELECT TO authenticated
  USING (blocker_id = auth.uid() OR blocked_id = auth.uid());

-- 3. Matching function: returns men ranked by looking_for_tags overlap
CREATE OR REPLACE FUNCTION public.get_matching_men(p_woman_id UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  age INT,
  city TEXT,
  city_auto TEXT,
  photos JSONB,
  about_me_tags JSONB,
  match_count INT,
  match_percent NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_looking TEXT[];
BEGIN
  SELECT p.looking_for_tags INTO v_looking
  FROM public.profiles p
  WHERE p.id = p_woman_id;

  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.age,
    p.city,
    p.city_auto,
    COALESCE(to_jsonb(p.photos), '[]'::jsonb),
    COALESCE(to_jsonb(p.about_me_tags), '[]'::jsonb),
    COALESCE(CARDINALITY(
      ARRAY(SELECT UNNEST(p.about_me_tags) INTERSECT SELECT UNNEST(v_looking))
    ), 0)::INT,
    CASE
      WHEN COALESCE(CARDINALITY(v_looking), 0) > 0
      THEN ROUND(
        (COALESCE(CARDINALITY(
          ARRAY(SELECT UNNEST(p.about_me_tags) INTERSECT SELECT UNNEST(v_looking))
        ), 0)::NUMERIC / CARDINALITY(v_looking)::NUMERIC) * 100
      )
      ELSE 0
    END
  FROM public.profiles p
  WHERE
    p.role = 'guest'
    AND p.is_active = true
    AND p.id != p_woman_id
    AND COALESCE(CARDINALITY(
      ARRAY(SELECT UNNEST(p.about_me_tags) INTERSECT SELECT UNNEST(v_looking))
    ), 0) > 0
    AND NOT EXISTS (
      SELECT 1 FROM public.connections c
      WHERE c.guest_id = p_woman_id AND c.host_id = p.id
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.blocked_pairs bp
      WHERE (bp.blocker_id = p_woman_id AND bp.blocked_id = p.id)
         OR (bp.blocker_id = p.id AND bp.blocked_id = p_woman_id)
    )
  ORDER BY match_percent DESC, p.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_matching_men TO authenticated;

NOTIFY pgrst, 'reload schema';
