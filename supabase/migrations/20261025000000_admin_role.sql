-- Admin role: RBAC, reports, audit logging

BEGIN;

-- 1.1 Admin/banned columns on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_reason TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;

-- 1.2 Reports table for user-generated reports
CREATE TABLE IF NOT EXISTS reports (
  id BIGSERIAL PRIMARY KEY,
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reported_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','reviewed','actioned','dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id)
);

-- 1.3 Admin audit log
CREATE TABLE IF NOT EXISTS admin_actions (
  id BIGSERIAL PRIMARY KEY,
  admin_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  target_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.4 RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_full_access_reports" ON reports
FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "users_can_insert_reports" ON reports
FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "admins_full_access_audit" ON admin_actions
FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- 1.5 Admin ban function
CREATE OR REPLACE FUNCTION admin_ban_user(p_user_id UUID, p_reason TEXT)
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
  SET is_banned = true, banned_reason = p_reason, banned_at = NOW()
  WHERE id = p_user_id;

  INSERT INTO admin_actions (admin_id, action, target_id, metadata)
  VALUES (auth.uid(), 'ban_user', p_user_id, jsonb_build_object('reason', p_reason));
END;
$$;

-- 1.6 Admin unban function
CREATE OR REPLACE FUNCTION admin_unban_user(p_user_id UUID)
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
  SET is_banned = false, banned_reason = NULL, banned_at = NULL
  WHERE id = p_user_id;

  INSERT INTO admin_actions (admin_id, action, target_id, metadata)
  VALUES (auth.uid(), 'unban_user', p_user_id, '{}'::jsonb);
END;
$$;

-- 1.7 Admin set-admin function
CREATE OR REPLACE FUNCTION admin_set_admin(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE profiles SET is_admin = true WHERE id = p_user_id;

  INSERT INTO admin_actions (admin_id, action, target_id, metadata)
  VALUES (auth.uid(), 'set_admin', p_user_id, '{}'::jsonb);
END;
$$;

COMMIT;

NOTIFY pgrst, 'reload schema';
