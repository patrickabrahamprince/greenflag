-- 1. Ensure admin exists
WITH admin_user AS (SELECT id FROM auth.users WHERE email = 'musigoevents@gmail.com')
INSERT INTO profiles (id, name, is_admin, onboarded, coins, created_at)
SELECT id, 'Admin', true, true, 9999, now() FROM admin_user
ON CONFLICT (id) DO UPDATE SET is_admin = true, name = 'Admin';

-- 2. Analytics view: User growth
CREATE OR REPLACE VIEW admin_user_stats AS
SELECT
  date_trunc('day', created_at) as date,
  count(*) as signups,
  sum(count(*)) OVER (ORDER BY date_trunc('day', created_at)) as total_users
FROM profiles
GROUP BY 1 ORDER BY 1 DESC;

-- 3. Analytics view: Match activity
CREATE OR REPLACE VIEW admin_match_stats AS
SELECT
  date_trunc('day', created_at) as date,
  count(*) as matches_created,
  count(*) FILTER (WHERE status = 'accepted') as accepted,
  count(*) FILTER (WHERE status = 'rejected') as rejected
FROM matches
GROUP BY 1 ORDER BY 1 DESC;

-- 4. Analytics view: Message volume
CREATE OR REPLACE VIEW admin_message_stats AS
SELECT
  date_trunc('day', created_at) as date,
  count(*) as messages_sent,
  count(DISTINCT sender_id) as active_senders
FROM messages
GROUP BY 1 ORDER BY 1 DESC;

-- 5. Grant admin access
GRANT SELECT ON admin_user_stats TO authenticated;
GRANT SELECT ON admin_match_stats TO authenticated;
GRANT SELECT ON admin_message_stats TO authenticated;
