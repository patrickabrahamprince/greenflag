-- 1. New users start with 1000 coins instead of 0 -- enough to "Meet Her
-- Standard" (unlock/start a connection) with up to 2 women at the new
-- 500-coin cost below.
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (user_id, balance) VALUES (NEW.id, 1000);
  INSERT INTO profiles (id, persona, is_active) VALUES (NEW.id, 'man', true);
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. "Meet Her Standard" cost raised from 100 to 500 coins -- with a 1000
-- starting balance this naturally caps a man at 2 concurrent connections
-- unless he tops up.
CREATE OR REPLACE FUNCTION public.create_like(p_to_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_from_user_id UUID := auth.uid();
  v_deduct JSONB;
  v_like_id UUID;
  v_match_id UUID;
BEGIN
  IF v_from_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'unauthorized');
  END IF;

  v_deduct := deduct_coins(v_from_user_id, 500, 'Meet Her Standard', jsonb_build_object('to_user_id', p_to_user_id));
  IF NOT (v_deduct->>'success')::BOOLEAN THEN
    RETURN v_deduct;
  END IF;

  INSERT INTO likes (from_user_id, to_user_id)
  VALUES (v_from_user_id, p_to_user_id)
  ON CONFLICT (from_user_id, to_user_id) DO NOTHING
  RETURNING id INTO v_like_id;

  INSERT INTO matches (user1_id, user2_id)
  VALUES (v_from_user_id, p_to_user_id)
  ON CONFLICT (user1_id, user2_id) DO NOTHING
  RETURNING id INTO v_match_id;

  IF v_match_id IS NULL THEN
    SELECT id INTO v_match_id FROM matches
    WHERE (user1_id = v_from_user_id AND user2_id = p_to_user_id)
       OR (user1_id = p_to_user_id AND user2_id = v_from_user_id);
  END IF;

  RETURN jsonb_build_object('success', true, 'like_id', v_like_id, 'match_id', v_match_id);
END;
$$;

-- 3. Profile edits now go through an approval queue instead of applying
-- immediately -- a user can have at most one pending request at a time,
-- enforced by the partial unique index below (not just app-level checking).
CREATE TABLE IF NOT EXISTS public.profile_edit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  requested_changes JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id)
);
CREATE INDEX IF NOT EXISTS idx_profile_edit_requests_user ON profile_edit_requests(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_profile_edit_requests_one_pending
  ON profile_edit_requests(user_id) WHERE status = 'pending';

ALTER TABLE profile_edit_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "edit_requests_select_own_or_admin" ON profile_edit_requests;
CREATE POLICY "edit_requests_select_own_or_admin" ON profile_edit_requests
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "edit_requests_insert_own" ON profile_edit_requests;
CREATE POLICY "edit_requests_insert_own" ON profile_edit_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "edit_requests_admin_update" ON profile_edit_requests;
CREATE POLICY "edit_requests_admin_update" ON profile_edit_requests
  FOR UPDATE USING (public.is_admin());

NOTIFY pgrst, 'reload schema';
