-- Migration: Drop Connections Table and Clean Up Stale Functions/Views
-- Date: 2026-06-28

-- 1. Drop old tables that are no longer used
DROP TABLE IF EXISTS public.freeze_transactions CASCADE;
DROP TABLE IF EXISTS public.connections CASCADE;

-- 2. Drop connection-related functions
DROP FUNCTION IF EXISTS public.advance_day_if_complete(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.freeze_connection(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.decide_connection(UUID, BOOLEAN) CASCADE;
DROP FUNCTION IF EXISTS public.expire_connections() CASCADE;
DROP FUNCTION IF EXISTS public.expire_old_connections() CASCADE;

-- 3. Re-define get_matching_profiles to filter using likes/matches instead of connections
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
    SELECT 1 FROM likes l
    WHERE l.from_user_id = p_viewer_id AND l.to_user_id = p.id
  )
  AND NOT EXISTS (
    SELECT 1 FROM matches m
    WHERE (m.user1_id = p_viewer_id AND m.user2_id = p.id)
       OR (m.user2_id = p_viewer_id AND m.user1_id = p.id)
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
GRANT EXECUTE ON FUNCTION public.get_matching_profiles(uuid) TO authenticated;

-- 4. Re-define get_ranked_women to filter using likes/matches instead of connections
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

-- 5. Re-define mark_messages_read and get_unread_messages_count to use conversation_id instead of connection_id
DROP FUNCTION IF EXISTS public.mark_messages_read(UUID) CASCADE;
CREATE OR REPLACE FUNCTION public.mark_messages_read(p_conversation_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE messages
  SET read_at = NOW()
  WHERE conversation_id = p_conversation_id
    AND sender_id != auth.uid()
    AND read_at IS NULL;
END;
$$;
GRANT EXECUTE ON FUNCTION public.mark_messages_read TO authenticated;

DROP FUNCTION IF EXISTS public.get_unread_messages_count(UUID) CASCADE;
CREATE OR REPLACE FUNCTION public.get_unread_messages_count(p_conversation_id UUID)
RETURNS INT LANGUAGE sql SECURITY DEFINER AS $$
  SELECT COUNT(*)::INT FROM messages
  WHERE conversation_id = p_conversation_id
    AND sender_id != auth.uid()
    AND read_at IS NULL;
$$;
GRANT EXECUTE ON FUNCTION public.get_unread_messages_count TO authenticated;

