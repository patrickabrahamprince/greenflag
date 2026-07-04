-- =====================================================
-- Fix post-approval game flow
-- 1. Enable 2-3 tasks per day in intentions
-- 2. Fix review_connection: set chat_unlocked + create day-1 tasks
-- 3. Add task_number/prompt to submissions
-- 4. Migrate off legacy task_submissions
-- 5. Add advance_day_if_complete helper
-- =====================================================

-- 1.0 — Switch from 8-day to 3-day game
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_day_number_check;
ALTER TABLE submissions ADD CONSTRAINT submissions_day_number_check CHECK (day_number BETWEEN 1 AND 3);
ALTER TABLE intentions DROP CONSTRAINT IF EXISTS intentions_day_number_check;
ALTER TABLE intentions ADD CONSTRAINT intentions_day_number_check CHECK (day_number BETWEEN 1 AND 3);

-- 1.1 — Enable 2-3 tasks per day in intentions
ALTER TABLE intentions DROP CONSTRAINT IF EXISTS intentions_standard_id_day_number_key;
ALTER TABLE intentions ADD COLUMN IF NOT EXISTS task_number INT DEFAULT 1 NOT NULL;
ALTER TABLE intentions ADD CONSTRAINT intentions_standard_day_task_key UNIQUE(standard_id, day_number, task_number);

-- 1.2 — Fix submissions table
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS task_number INT DEFAULT 1 NOT NULL;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS prompt TEXT;

-- Allow multiple submissions per day (one per task)
DROP INDEX IF EXISTS submissions_conn_day_task_key;
CREATE UNIQUE INDEX IF NOT EXISTS submissions_conn_day_task_key ON submissions(connection_id, day_number, task_number);

-- 1.3 — Migrate legacy data + drop old table. submissions.content isn't
-- added by any tracked migration (production has it via an untracked
-- hotfix, same drift pattern as the earlier fixes in this history) --
-- guard so a fresh replay no-ops instead of erroring; there's no legacy
-- task_submissions data to migrate on a blank database anyway.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'content') THEN
    INSERT INTO submissions (connection_id, day_number, task_number, content, media_url, approved, moderation_status, submitted_at)
    SELECT connection_id, task_number, 1, text_content, media_url,
           true, 'approved', submitted_at
    FROM task_submissions ON CONFLICT DO NOTHING;
  END IF;
END $$;
DROP TABLE IF EXISTS task_submissions;

-- 1.4 — Fix review_connection: set chat_unlocked boolean + create day-1 tasks
DROP FUNCTION IF EXISTS review_connection(UUID, BOOLEAN);
CREATE OR REPLACE FUNCTION review_connection(p_connection_id UUID, p_approved BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_host_id UUID;
  v_standard_id UUID;
BEGIN
  SELECT host_id INTO v_host_id
  FROM connections WHERE id = p_connection_id AND host_id = auth.uid();

  IF v_host_id IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  IF p_approved THEN
    -- Set connection active and unlock chat immediately
    UPDATE connections
    SET status = 'active',
        chat_unlocked = true,
        chat_unlocked_at = NOW(),
        host_reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_connection_id;

    -- Find the woman's active standard
    SELECT s.id INTO v_standard_id
    FROM standards s
    WHERE s.woman_id = v_host_id AND s.is_active = true
    LIMIT 1;

    -- Insert pending submission rows for every day-1 task
    INSERT INTO submissions (connection_id, day_number, task_number, prompt, approved, moderation_status)
    SELECT p_connection_id, i.day_number, i.task_number, i.prompt, false, 'approved'
    FROM intentions i
    WHERE i.standard_id = v_standard_id AND i.day_number = 1
    ON CONFLICT (connection_id, day_number, task_number) DO NOTHING;
  ELSE
    UPDATE connections
    SET status = 'rejected', host_reviewed_at = NOW()
    WHERE id = p_connection_id;
  END IF;
END;
$$;

-- 1.5 — Helper: count tasks for a day, advance current_day if all approved
DROP FUNCTION IF EXISTS advance_day_if_complete(UUID);
CREATE OR REPLACE FUNCTION advance_day_if_complete(p_connection_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_connection RECORD;
  v_standard_id UUID;
  v_total INT;
  v_done INT;
  v_next_day INT;
BEGIN
  SELECT * INTO v_connection FROM connections WHERE id = p_connection_id;
  IF NOT FOUND THEN RETURN false; END IF;

  -- How many tasks exist for the current day?
  SELECT s.id INTO v_standard_id
  FROM standards s WHERE s.woman_id = v_connection.host_id AND s.is_active = true
  LIMIT 1;

  IF v_standard_id IS NULL THEN RETURN false; END IF;

  SELECT COUNT(*) INTO v_total
  FROM intentions i
  WHERE i.standard_id = v_standard_id AND i.day_number = v_connection.current_day;

  -- How many of those are approved?
  SELECT COUNT(*) INTO v_done
  FROM submissions s
  WHERE s.connection_id = p_connection_id
    AND s.day_number = v_connection.current_day
    AND s.approved = true;

  IF v_done >= v_total AND v_total > 0 AND v_connection.current_day < 3 THEN
    v_next_day := v_connection.current_day + 1;

    UPDATE connections
    SET current_day = v_next_day,
        updated_at = NOW()
    WHERE id = p_connection_id;

    -- Insert next day's tasks
    INSERT INTO submissions (connection_id, day_number, task_number, prompt, approved, moderation_status)
    SELECT p_connection_id, i.day_number, i.task_number, i.prompt, false, 'approved'
    FROM intentions i
    WHERE i.standard_id = v_standard_id AND i.day_number = v_next_day
    ON CONFLICT (connection_id, day_number, task_number) DO NOTHING;

    RETURN true;
  END IF;

  RETURN false;
END;
$$;
