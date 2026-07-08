-- =====================================================
-- Fix auth trigger + RLS policies
-- =====================================================

-- 1. Fix handle_new_user trigger: role → persona (renamed in full_spec)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- SET search_path = public added: this SECURITY DEFINER function had none,
-- so it silently depended on whatever search_path the connecting role
-- (auth's own Postgres role, invoking this as an AFTER INSERT trigger on
-- auth.users) happened to default to. That's both a real bug -- this local
-- CLI's auth role's default search_path doesn't include public, so `wallets`/
-- `profiles` don't resolve and every signup 500s -- and a general
-- SECURITY DEFINER anti-pattern regardless of environment (an unqualified
-- search_path on a privileged function is exploitable via search_path
-- manipulation), so this is worth fixing outright, not just for local
-- testing.
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (user_id, balance) VALUES (NEW.id, 0);
  INSERT INTO profiles (id, persona, is_active) VALUES (NEW.id, 'man', true);
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. Fix RLS: add host-side policies for connections, submissions, messages
--    (migration 20261020000000_admin_rls.sql only added guest policies, dropping
--     the original participant policies that allowed both sides)

DROP POLICY IF EXISTS "connections_host" ON connections;
CREATE POLICY "connections_host" ON connections
  FOR SELECT USING (host_id = auth.uid());

DROP POLICY IF EXISTS "submissions_host" ON submissions;
CREATE POLICY "submissions_host" ON submissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM connections WHERE id = connection_id AND host_id = auth.uid())
  );

DROP POLICY IF EXISTS "messages_host" ON messages;
CREATE POLICY "messages_host" ON messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM connections WHERE id = connection_id AND host_id = auth.uid())
  );
