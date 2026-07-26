-- CONFIRMED LIVE against production (not theoretical): signed in as an
-- ordinary test user with no admin privileges and called both RPCs
-- directly from the browser-equivalent anon-key client.
--
--   add_coins(p_user_id: self, ...)   -> {"success": true, "new_balance": 11}
--   deduct_coins(p_user_id: OTHER_USER, ...) -> ran (only failed because
--     that specific victim's balance happened to be 0 -- no ownership
--     check exists at all, so a victim with a positive balance would
--     have actually been drained)
--
-- add_coins() was tracked as REVOKE EXECUTE ... FROM authenticated, anon
-- in 20261019000000_init.sql, but that grant state has drifted on
-- production (already flagged as drifted in other ways by
-- 20261214000000_fix_coin_double_credit.sql's own comments) -- it is
-- currently callable by any logged-in user. deduct_coins was tracked as
-- GRANTed to authenticated at all, which was never actually needed: every
-- real caller in the app (submit-task route, credit-coins admin route)
-- already uses the service-role client, which bypasses grants entirely.
--
-- Not touching either function's BODY here -- its live implementation is
-- already known to differ from what's tracked (writes to different
-- tables), so a blind CREATE OR REPLACE risks dropping unknown behavior.
-- Revoking execute is independent of the body and closes the hole
-- regardless of what the function's current internals actually are.
--
-- Written as a DO block scanning pg_proc rather than naming exact
-- parameter signatures, so this works even if the live signature has
-- also drifted from what's tracked.
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
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM authenticated, anon;', r.sig);
  END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';
