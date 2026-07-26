-- The admin panel's Users list (and any other RLS-bound admin query
-- against `profiles`) was silently showing almost nothing: the admin's
-- own session only ever got back their own row, count=1, even with 4 real
-- profiles in the table (verified directly: service-role client sees 4,
-- the admin's own authenticated session sees 1).
--
-- Root cause: an "admin_all_profiles" FOR ALL USING (public.is_admin())
-- policy was added back in 20261031000000_admin_page_v2.sql and recreated
-- in 20261107000000_fix_rls_recursion.sql, but it isn't present on the
-- live database (consistent with this project's pattern of tracked
-- migrations that were never actually applied to production, or an
-- untracked hotfix elsewhere dropping it). Without it, admins are subject
-- to the same "opposite persona only" gating as everyone else
-- (view_opposite_gender / opposite_gender_only), so an admin whose own
-- persona is 'man' can't see other 'man' profiles at all -- which is
-- exactly the visibility gap being hit here, since every test account
-- signed up so far is persona='man'.
--
-- is_admin() itself was independently confirmed working (returns true for
-- the admin session) -- this migration only re-asserts the policy that's
-- supposed to consume it.
DROP POLICY IF EXISTS "admin_all_profiles" ON profiles;
CREATE POLICY "admin_all_profiles" ON profiles FOR ALL USING (
  public.is_admin()
);

-- Same gap, different tables: the admin user-detail page
-- (app/api/admin/users/[id]/route.ts) reads wallets/coin_transactions
-- through the same RLS-bound admin session, but neither table has ever
-- had an admin bypass -- only "self" SELECT policies exist on both. That
-- means every admin user-detail view has been silently showing 0 coins
-- and no transaction history for anyone who isn't the admin themselves.
-- `matches` already got this treatment in 20261217000000_admin_rls_gaps.sql
-- (admin_all_matches); these two were missed at the time.
DROP POLICY IF EXISTS "admin_all_wallets" ON wallets;
CREATE POLICY "admin_all_wallets" ON wallets FOR ALL USING (
  public.is_admin()
);

DROP POLICY IF EXISTS "admin_all_coin_transactions" ON coin_transactions;
CREATE POLICY "admin_all_coin_transactions" ON coin_transactions FOR ALL USING (
  public.is_admin()
);

NOTIFY pgrst, 'reload schema';
