-- 1. Add admin columns if missing
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_reason text;

-- 2. Set you as admin
UPDATE profiles SET is_admin = true WHERE id = (SELECT id FROM auth.users WHERE email = 'musigoevents@gmail.com');

-- 3. Analytics views
DROP VIEW IF EXISTS admin_user_stats CASCADE;
CREATE VIEW admin_user_stats AS
SELECT date_trunc('day', created_at) as date, count(*) as signups
FROM profiles GROUP BY 1 ORDER BY 1 DESC;
GRANT SELECT ON admin_user_stats TO authenticated;

-- 4. RLS: Admins can manage everything
DROP POLICY IF EXISTS "admin_all_profiles" ON profiles;
CREATE POLICY "admin_all_profiles" ON profiles FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

DROP POLICY IF EXISTS "admin_all_messages" ON messages;
CREATE POLICY "admin_all_messages" ON messages FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
) WITH CHECK (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);
