-- Create is_admin function to bypass RLS using SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$ LANGUAGE sql;

-- Create get_my_gender function to bypass RLS using SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_my_gender()
RETURNS text
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT gender FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql;

-- Update profiles table policies
DROP POLICY IF EXISTS "admin_all_profiles" ON profiles;
CREATE POLICY "admin_all_profiles" ON profiles FOR ALL USING (
  public.is_admin()
);

DROP POLICY IF EXISTS "view_opposite_gender" ON profiles;
CREATE POLICY "view_opposite_gender" ON profiles
FOR SELECT USING (
  onboarding_completed = true
  AND gender != public.get_my_gender()
);

-- Update messages table policies
DROP POLICY IF EXISTS "admin_all_messages" ON messages;
CREATE POLICY "admin_all_messages" ON messages FOR ALL USING (
  public.is_admin()
) WITH CHECK (
  public.is_admin()
);

-- Update mod_queue table policies
DROP POLICY IF EXISTS "admin_only_mod_queue" ON mod_queue;
CREATE POLICY "admin_only_mod_queue" ON mod_queue FOR ALL USING (
  public.is_admin()
);

-- Update audit_logs table policies
DROP POLICY IF EXISTS "Admin only" ON audit_logs;
CREATE POLICY "Admin only" ON audit_logs FOR ALL USING (
  public.is_admin()
);

-- Update reports table policies
DROP POLICY IF EXISTS "Admin can read all" ON reports;
CREATE POLICY "Admin can read all" ON reports FOR SELECT USING (
  public.is_admin()
);

-- Drop old deprecated policies if they exist to avoid confusion
DROP POLICY IF EXISTS "admins_full_access_reports" ON reports;
DROP POLICY IF EXISTS "admins_full_access_audit" ON admin_actions;
