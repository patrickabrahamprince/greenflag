-- Admin RLS: restrict host access, add admin bypass

-- Drop old participant policies
DROP POLICY IF EXISTS "connections_participant" ON connections;
DROP POLICY IF EXISTS "submissions_participant" ON submissions;
DROP POLICY IF EXISTS "messages_participant" ON messages;

-- Connections: guest can SELECT/INSERT their own, admins can do ALL
CREATE POLICY "connections_guest" ON connections
  FOR ALL USING (
    guest_id = auth.uid()
  );
CREATE POLICY "connections_admin" ON connections
  FOR ALL USING (
    auth.email() = ANY(string_to_array(current_setting('app.admin_emails', true), ','))
  );

-- Submissions: guest can SELECT/INSERT their own (via connection), admins can do ALL
CREATE POLICY "submissions_guest" ON submissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM connections WHERE id = connection_id AND guest_id = auth.uid())
  );
CREATE POLICY "submissions_admin" ON submissions
  FOR ALL USING (
    auth.email() = ANY(string_to_array(current_setting('app.admin_emails', true), ','))
  );

-- Messages: guest can SELECT their own (via connection), admins can do ALL
CREATE POLICY "messages_guest" ON messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM connections WHERE id = connection_id AND guest_id = auth.uid())
  );
CREATE POLICY "messages_admin" ON messages
  FOR ALL USING (
    auth.email() = ANY(string_to_array(current_setting('app.admin_emails', true), ','))
  );

-- Set default admin_emails (overridden by environment
