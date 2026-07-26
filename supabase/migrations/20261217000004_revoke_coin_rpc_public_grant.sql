-- Follow-up to 20261217000002: that migration revoked EXECUTE from
-- authenticated/anon explicitly, but re-testing afterward (signed in as
-- an ordinary test user, called add_coins directly) showed it *still*
-- succeeded. Root cause: Postgres grants EXECUTE to the PUBLIC
-- pseudo-role by default when a function is created, and every role
-- (including authenticated/anon) is implicitly a member of PUBLIC --
-- revoking from the named roles alone does nothing if PUBLIC itself
-- still has the grant. This is the same blind spot the original tracked
-- migration for add_coins had (it only revoked authenticated, anon too,
-- never PUBLIC).
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('add_coins', 'deduct_coins')
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, authenticated, anon;', r.sig);
  END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';

-- Run this SELECT after the block above and check the output: for both
-- add_coins and deduct_coins, "grants" should list only postgres/
-- service_role-type roles (or be empty) -- it must NOT contain
-- "authenticated=X" or "anon=X" or a bare "=X" entry (a bare "=" with no
-- role name in front is what a PUBLIC grant looks like in this output).
SELECT
  p.proname,
  p.oid::regprocedure AS signature,
  p.proacl AS grants
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('add_coins', 'deduct_coins');
