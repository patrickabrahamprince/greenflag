-- view_opposite_gender is the only SELECT policy on profiles, and its
-- condition (persona != own persona) can never be true for your own row,
-- so a user could never see their own profile via RLS. Plain UPDATE works
-- (gated by profiles_self_update's own USING), but upsert's
-- INSERT ... ON CONFLICT DO UPDATE needs to see the existing conflicting
-- row to apply the update, and was failing with
-- "new row violates row-level security policy for table profiles"
-- (signup's phone-OTP path: supabase.from('profiles').upsert(...)).
--
-- Add a permissive self-select policy; PERMISSIVE policies OR together, so
-- this doesn't loosen the opposite-persona discovery policy at all.
DROP POLICY IF EXISTS "profiles_self_select" ON profiles;
CREATE POLICY "profiles_self_select" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Diagnostic helper from 20261204000003, no longer needed.
DROP FUNCTION IF EXISTS public._debug_list_profile_policies();
