-- =====================================================
-- Finalize 3-day × 3-task game
-- 1. Enforce 3-day constraints
-- 2. Final RPCs with day-3 completion
-- 3. Simplify review_connection
-- =====================================================

-- 1.0 — Ensure constraints exist
ALTER TABLE intentions DROP CONSTRAINT IF EXISTS intentions_day_number_check;
ALTER TABLE intentions ADD CONSTRAINT intentions_day_number_check CHECK (day_number BETWEEN 1 AND 3);

ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_day_number_check;
ALTER TABLE submissions ADD CONSTRAINT submissions_day_number_check CHECK (day_number BETWEEN 1 AND 3);

-- 1.1 — Ensure task_number columns exist
ALTER TABLE intentions ADD COLUMN IF NOT EXISTS task_number INT DEFAULT 1 NOT NULL;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS task_number INT DEFAULT 1 NOT NULL;

-- 1.2 — Ensure unique keys for multi-task
ALTER TABLE intentions DROP CONSTRAINT IF EXISTS intentions_standard_day_task_key;
ALTER TABLE intentions ADD CONSTRAINT intentions_standard_day_task_key UNIQUE(standard_id, day_number, task_number);

DROP INDEX IF EXISTS submissions_conn_day_task_key;
CREATE UNIQUE INDEX submissions_conn_day_task_key ON submissions(connection_id, day_number, task_number);

-- 1.3 — Drop legacy table if exists
DROP TABLE IF EXISTS task_submissions;

-- 1.4 — Final advance_day_if_complete: caps at day 3, marks connected
CREATE OR REPLACE FUNCTION advance_day_if_complete(p_connection_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_day INT;
  v_standard_id UUID;
  v_total_tasks INT;
  v_approved_tasks INT;
BEGIN
  SELECT current_day INTO v_current_day
  FROM connections WHERE id = p_connection_id;
  IF NOT FOUND THEN RETURN; END IF;

  SELECT s.id INTO v_standard_id
  FROM standards s
  JOIN connections c ON c.host_id = s.woman_id
  WHERE c.id = p_connection_id AND s.is_active = true
  LIMIT 1;
  IF v_standard_id IS NULL THEN RETURN; END IF;

  SELECT COUNT(*) INTO v_total_tasks
  FROM intentions WHERE standard_id = v_standard_id AND day_number = v_current_day;

  SELECT COUNT(*) INTO v_approved_tasks
  FROM submissions
  WHERE connection_id = p_connection_id AND day_number = v_current_day AND status = 'approved';

  IF v_approved_tasks >= v_total_tasks AND v_total_tasks > 0 THEN
    IF v_current_day < 3 THEN
      UPDATE connections SET current_day = current_day + 1, updated_at = NOW()
      WHERE id = p_connection_id;

      INSERT INTO submissions (connection_id, day_number, task_number, prompt, status)
      SELECT p_connection_id, i.day_number, i.task_number, i.prompt, 'pending'
      FROM intentions i
      WHERE i.standard_id = v_standard_id AND i.day_number = v_current_day + 1
      ON CONFLICT DO NOTHING;
    ELSE
      UPDATE connections
      SET connected = true, status = 'completed', updated_at = NOW()
      WHERE id = p_connection_id;
    END IF;
  END IF;
END;
$$;

-- 1.5 — Simplified review_connection: unlock chat + create day-1 tasks
CREATE OR REPLACE FUNCTION review_connection(p_connection_id UUID, p_approved BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_approved THEN
    UPDATE connections
    SET status = 'active',
        chat_unlocked = true,
        chat_unlocked_at = NOW(),
        host_reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_connection_id;

    INSERT INTO submissions (connection_id, day_number, task_number, prompt, status)
    SELECT p_connection_id, i.day_number, i.task_number, i.prompt, 'pending'
    FROM intentions i
    JOIN standards s ON s.id = i.standard_id
    JOIN connections c ON c.host_id = s.woman_id
    WHERE c.id = p_connection_id AND i.day_number = 1
    ON CONFLICT DO NOTHING;
  ELSE
    UPDATE connections
    SET status = 'rejected', host_reviewed_at = NOW()
    WHERE id = p_connection_id;
  END IF;
END;
$$;
