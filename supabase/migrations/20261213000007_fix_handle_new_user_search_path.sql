-- handle_new_user() (the AFTER INSERT ON auth.users trigger that provisions
-- wallets/profiles on signup) is SECURITY DEFINER with no SET search_path --
-- a general SECURITY DEFINER anti-pattern (relies on whatever search_path
-- the invoking role happens to default to) regardless of environment.
-- Confirmed real signups on production aren't currently hitting this (the
-- connecting role there already defaults to include public), but it's cheap
-- insurance to pin it explicitly rather than depend on that continuing to
-- be true. This is a standalone CREATE OR REPLACE, not a re-run of
-- 20261109000000_fix_auth_rls.sql as a whole -- that file also references
-- the `connections` table, which no longer exists after
-- 20261206000012_drop_connections.sql, so re-applying it wholesale would
-- fail on current production.
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (user_id, balance) VALUES (NEW.id, 0);
  INSERT INTO profiles (id, persona, is_active) VALUES (NEW.id, 'man', true);
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

NOTIFY pgrst, 'reload schema';
