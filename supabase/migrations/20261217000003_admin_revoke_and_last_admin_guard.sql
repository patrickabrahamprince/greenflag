-- admin_set_admin() was grant-only -- no way to revoke admin access
-- through the app at all, short of editing the database directly or
-- deleting the account entirely via the purge endpoint. Replacing the
-- single-arg version with a two-arg version (p_grant, defaulting to true
-- so any existing 1-arg call site keeps working unchanged) that can also
-- revoke, and refusing to revoke the last remaining admin so the panel
-- can never lock everyone out of itself.
DROP FUNCTION IF EXISTS admin_set_admin(UUID);

CREATE OR REPLACE FUNCTION admin_set_admin(p_user_id UUID, p_grant BOOLEAN DEFAULT true)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_count INT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF NOT p_grant THEN
    SELECT COUNT(*) INTO v_admin_count FROM profiles WHERE is_admin = true;
    IF v_admin_count <= 1 THEN
      RAISE EXCEPTION 'Cannot revoke the last remaining admin';
    END IF;
  END IF;

  UPDATE profiles SET is_admin = p_grant WHERE id = p_user_id;

  INSERT INTO admin_actions (admin_id, action, target_id, metadata)
  VALUES (auth.uid(), CASE WHEN p_grant THEN 'set_admin' ELSE 'revoke_admin' END, p_user_id, '{}'::jsonb);
END;
$$;
GRANT EXECUTE ON FUNCTION admin_set_admin(UUID, BOOLEAN) TO authenticated;

NOTIFY pgrst, 'reload schema';
