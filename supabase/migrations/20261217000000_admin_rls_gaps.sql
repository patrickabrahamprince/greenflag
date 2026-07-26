-- Fixes three RLS gaps discovered in a full admin-panel audit. All three
-- routes/pages already correctly check profiles.is_admin at the app layer
-- (via requireAdmin() or an inline equivalent) before running these
-- queries -- but the queries themselves run through the admin's own
-- RLS-bound session (anon key + cookie), not a service-role client, so
-- a missing admin-bypass policy silently empties the result (SELECT) or
-- silently no-ops the write (UPDATE/DELETE), with no error surfaced.
--
-- 1. submissions: only policy is submissions_select_participant (match
--    participants only). The admin panel's moderation queue
--    (app/admin/queue/page.tsx) queries pending submissions directly and
--    has been returning an empty list for any admin who isn't personally
--    a match participant -- i.e. always, in practice. A dead GUC-based
--    "submissions_admin" policy exists from 20261020000000_admin_rls.sql
--    but checks app.admin_emails, a setting nothing ever sets (the same
--    dead pattern already fixed for `messages` in
--    20261212000000_fix_messaging_split_brain.sql -- submissions was
--    missed at the time).
DROP POLICY IF EXISTS "submissions_admin" ON submissions;
DROP POLICY IF EXISTS "admin_all_submissions" ON submissions;
CREATE POLICY "admin_all_submissions" ON submissions FOR ALL USING (
  public.is_admin()
);

-- 2. matches: only policy is matches_select_participant. The admin
--    user-detail page (app/api/admin/users/[id]/route.ts) queries a
--    user's match history directly and always got back an empty list.
DROP POLICY IF EXISTS "admin_all_matches" ON matches;
CREATE POLICY "admin_all_matches" ON matches FOR ALL USING (
  public.is_admin()
);

-- 3. reports: had a working admin FOR ALL policy once
--    (admins_full_access_reports, 20261025000000_admin_role.sql), but it
--    was dropped in 20261107000000_fix_rls_recursion.sql, which only
--    recreated the SELECT half ("Admin can read all"). Every
--    resolve/dismiss/delete action in app/api/admin/reports/[id]/route.ts
--    has been a silent no-op since -- the API returns {success:true} and
--    logs an audit entry, but the underlying report row never changes.
DROP POLICY IF EXISTS "admin_write_reports" ON reports;
CREATE POLICY "admin_write_reports" ON reports FOR UPDATE USING (
  public.is_admin()
);
DROP POLICY IF EXISTS "admin_delete_reports" ON reports;
CREATE POLICY "admin_delete_reports" ON reports FOR DELETE USING (
  public.is_admin()
);

NOTIFY pgrst, 'reload schema';
