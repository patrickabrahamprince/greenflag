-- New match_status enum replacing matches.status's ad hoc TEXT+CHECK
-- ('active','completed' -- 20261209000001_match_task_flow.sql). The USING
-- clause backfills 'active' -> 'pending_submission' in the same statement:
-- safe because every historical row was either 'active' or synchronously
-- auto-approved to 'completed' -- nothing can retroactively need
-- 'pending_review'/'rejected'/'expired_no_submission'/'refunded'.
CREATE TYPE match_status AS ENUM (
  'pending_submission',
  'pending_review',
  'rejected',
  'expired_no_submission',
  'refunded',
  'completed'
);

ALTER TABLE matches ALTER COLUMN status DROP DEFAULT;
ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_status_check;

ALTER TABLE matches
  ALTER COLUMN status TYPE match_status
  USING (CASE status WHEN 'active' THEN 'pending_submission' ELSE status END)::match_status;

ALTER TABLE matches ALTER COLUMN status SET DEFAULT 'pending_submission';

-- Deadline/bookkeeping columns for the review flow.
ALTER TABLE matches ADD COLUMN IF NOT EXISTS submit_deadline TIMESTAMPTZ;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS review_deadline TIMESTAMPTZ;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS refund_issued BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS review_reminder_24h_sent BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS review_reminder_6h_sent BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS review_reminder_1h_sent BOOLEAN NOT NULL DEFAULT false;

-- Ranking feedback-loop input (see 20261213000002_ranking_functions.sql).
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS late_review_count INT NOT NULL DEFAULT 0;

-- Close the review-gate bypass: "submissions_match_participant"
-- (20261209000001_match_task_flow.sql) is currently FOR ALL with no
-- WITH CHECK, so either participant can UPDATE approved=true on their own
-- submission directly via the browser's Supabase client, bypassing
-- submit-task/review-task entirely. All real writes already go through the
-- service-role admin client in those routes -- no legitimate client code
-- writes to `submissions` directly. Replace with SELECT-only.
DROP POLICY IF EXISTS "submissions_match_participant" ON submissions;
CREATE POLICY "submissions_select_participant" ON submissions
  FOR SELECT USING (
    match_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM matches m WHERE m.id = match_id AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );

NOTIFY pgrst, 'reload schema';
