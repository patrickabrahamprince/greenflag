-- =====================================================
-- SHIP PHASE 3: Day-3 final decision (Green Flag / Pass)
-- advance_day_if_complete now stops at 'awaiting_decision' on day 3
-- instead of auto-completing; woman explicitly decides.
-- =====================================================

ALTER TABLE connections ADD COLUMN IF NOT EXISTS host_decision TEXT
  CHECK (host_decision IN ('green_flag', 'pass'));
ALTER TABLE connections ADD COLUMN IF NOT EXISTS decided_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION advance_day_if_complete(p_connection_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_day INT;
  v_standard_id UUID;
  v_total_tasks INT;
  v_approved_tasks INT;
  v_advanced BOOLEAN := false;
BEGIN
  SELECT current_day INTO v_current_day
  FROM connections WHERE id = p_connection_id;
  IF NOT FOUND THEN RETURN false; END IF;

  SELECT s.id INTO v_standard_id
  FROM standards s
  JOIN connections c ON c.host_id = s.woman_id
  WHERE c.id = p_connection_id AND s.is_active = true
  LIMIT 1;
  IF v_standard_id IS NULL THEN RETURN false; END IF;

  SELECT COUNT(*) INTO v_total_tasks
  FROM intentions WHERE standard_id = v_standard_id AND day_number = v_current_day;

  SELECT COUNT(*) INTO v_approved_tasks
  FROM submissions
  WHERE connection_id = p_connection_id AND day_number = v_current_day AND approved = true;

  IF v_approved_tasks >= v_total_tasks AND v_total_tasks > 0 THEN
    IF v_current_day < 3 THEN
      UPDATE connections SET current_day = current_day + 1, updated_at = NOW()
      WHERE id = p_connection_id;

      INSERT INTO submissions (connection_id, day_number, task_number, prompt, approved)
      SELECT p_connection_id, i.day_number, i.task_number, i.prompt, false
      FROM intentions i
      WHERE i.standard_id = v_standard_id AND i.day_number = v_current_day + 1
      ON CONFLICT DO NOTHING;

      v_advanced := true;
    ELSE
      -- Day 3 complete: wait for woman's explicit Green Flag / Pass decision
      UPDATE connections
      SET status = 'awaiting_decision', updated_at = NOW()
      WHERE id = p_connection_id;

      v_advanced := true;
    END IF;
  END IF;

  RETURN v_advanced;
END;
$$;

-- decide_connection: woman's final call after day 3 completes
DROP FUNCTION IF EXISTS decide_connection(UUID, BOOLEAN);
CREATE OR REPLACE FUNCTION decide_connection(p_connection_id UUID, p_green_flag BOOLEAN)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_woman_id UUID := auth.uid();
  v_connection RECORD;
BEGIN
  SELECT * INTO v_connection FROM connections WHERE id = p_connection_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'connection_not_found');
  END IF;

  IF v_connection.host_id != v_woman_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'forbidden');
  END IF;

  IF v_connection.status != 'awaiting_decision' THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_awaiting_decision');
  END IF;

  UPDATE connections
  SET host_decision = CASE WHEN p_green_flag THEN 'green_flag' ELSE 'pass' END,
      connected = p_green_flag,
      status = 'completed',
      decided_at = NOW(),
      updated_at = NOW()
  WHERE id = p_connection_id;

  RETURN jsonb_build_object('success', true, 'host_decision', CASE WHEN p_green_flag THEN 'green_flag' ELSE 'pass' END);
END;
$$;
GRANT EXECUTE ON FUNCTION decide_connection TO authenticated;
