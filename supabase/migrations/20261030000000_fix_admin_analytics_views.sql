-- Drop old view if it exists
DROP VIEW IF EXISTS admin_match_stats;

-- Create correct view for match/connection statistics
-- connections has started_at, not created_at (same drift as 20261029000000).
CREATE OR REPLACE VIEW admin_match_stats AS
SELECT
  date_trunc('day', started_at) as date,
  count(*) as matches_created,
  count(*) FILTER (WHERE status IN ('active', 'chat_unlocked', 'completed')) as accepted,
  count(*) FILTER (WHERE status = 'rejected') as rejected
FROM connections
GROUP BY 1 ORDER BY 1 DESC;

-- Grant select permission to authenticated users
GRANT SELECT ON admin_match_stats TO authenticated;
