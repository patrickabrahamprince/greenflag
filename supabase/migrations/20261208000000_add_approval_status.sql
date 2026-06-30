-- Application/approval gate: new profiles start 'pending' and are hidden
-- from discovery until an admin approves them, mirroring the existing
-- admin_ban_user()/admin_unban_user() pattern in 20261025000000_admin_role.sql.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approval_status TEXT
  NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approval_reason TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Don't lock out anyone who already made it through onboarding.
UPDATE profiles SET approval_status = 'approved', approved_at = NOW()
WHERE onboarding_completed = true AND approval_status = 'pending';

-- Discovery visibility now also requires approval.
DROP POLICY IF EXISTS "view_opposite_gender" ON profiles;
CREATE POLICY "view_opposite_gender" ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR (
      onboarding_completed = true
      AND approval_status = 'approved'
      AND persona != public.get_my_gender()::user_role
    )
  );

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
  AND p.approval_status = 'approved'
  AND NOT EXISTS (
    SELECT 1 FROM likes l
    WHERE l.from_user_id = p_viewer_id AND l.to_user_id = p.id
  )
  AND NOT EXISTS (
    SELECT 1 FROM matches m
    WHERE (m.user1_id = p_viewer_id AND m.user2_id = p.id)
       OR (m.user2_id = p_viewer_id AND m.user1_id = p.id)
  )
  AND (
    (SELECT lat FROM profiles WHERE id = p_viewer_id) IS NULL
    OR p.lat IS NULL
    OR ST_DWithin(
      ST_MakePoint((SELECT lng FROM profiles WHERE id = p_viewer_id), (SELECT lat FROM profiles WHERE id = p_viewer_id))::geography,
      ST_MakePoint(p.lng, p.lat)::geography,
      50000
    )
  )
  ORDER BY p.created_at DESC
  LIMIT 20;
$$;
GRANT EXECUTE ON FUNCTION public.get_matching_profiles(uuid) TO authenticated;

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

-- Admin approve/reject, mirroring admin_ban_user()/admin_unban_user().
CREATE OR REPLACE FUNCTION admin_approve_user(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE profiles
  SET approval_status = 'approved', approval_reason = NULL, approved_at = NOW()
  WHERE id = p_user_id;

  INSERT INTO admin_actions (admin_id, action, target_id, metadata)
  VALUES (auth.uid(), 'approve_user', p_user_id, '{}'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION admin_reject_user(p_user_id UUID, p_reason TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE profiles
  SET approval_status = 'rejected', approval_reason = p_reason, approved_at = NULL
  WHERE id = p_user_id;

  INSERT INTO admin_actions (admin_id, action, target_id, metadata)
  VALUES (auth.uid(), 'reject_user', p_user_id, jsonb_build_object('reason', p_reason));
END;
$$;

NOTIFY pgrst, 'reload schema';
