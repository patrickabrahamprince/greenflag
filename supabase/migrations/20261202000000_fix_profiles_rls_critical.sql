-- Fix blocking security issues from audit
-- 1. Drop data-leak policy that bypasses gender gating
-- 2. Allow onboarding INSERT if handle_new_user trigger fails
-- 3. Fix view_opposite_gender to allow users to read their own profile
--    (without this, middleware and self-profile queries break)

BEGIN;

DROP POLICY IF EXISTS "profiles_public_read" ON profiles;

DROP POLICY IF EXISTS "users_self_insert" ON profiles;
CREATE POLICY "users_self_insert" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "view_opposite_gender" ON profiles;
DROP POLICY IF EXISTS "opposite_gender_only" ON profiles;
CREATE POLICY "opposite_gender_only" ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR (
      onboarding_completed = true
      AND gender != public.get_my_gender()
    )
  );

COMMIT;

NOTIFY pgrst, 'reload schema';
