-- CRITICAL: Fix infinite recursion in is_admin() function
--
-- The admin_all_profiles policy on profiles table calls is_admin(),
-- which queries profiles table, triggering the policy again = infinite recursion.
--
-- Quick fix: Simply DROP the problematic admin policy.
-- Admin access is already enforced at the API layer via requireAdmin() middleware.
-- The profiles table doesn't need a separate RLS bypass policy - regular users
-- see only opposite gender, admin can query via service-role client in API routes.

DROP POLICY IF EXISTS "admin_all_profiles" ON profiles;

-- Admin operations on profiles already use service-role client in:
-- - app/api/admin/users
-- - app/api/admin/reset-connection
-- - app/api/admin/nuke-all-users
-- These routes have requireAdmin() check, so they never use authenticated context anyway.

NOTIFY pgrst, 'reload schema';
