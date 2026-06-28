-- =====================================================
-- SHIP PHASE 2: backend RPC fixes
-- 1. advance_day_if_complete returns boolean
-- 2. freeze_connection(id) RPC: 10 coins, +24h
-- =====================================================

DROP FUNCTION IF EXISTS advance_day_if_complete(UUID);
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
      UPDATE connections
      SET connected = true, status = 'completed', updated_at = NOW()
      WHERE id = p_connection_id;

      v_advanced := true;
    END IF;
  END IF;

  RETURN v_advanced;
END;
$$;
GRANT EXECUTE ON FUNCTION advance_day_if_complete TO authenticated;

-- freeze_connection: 10 coins, +24h, single freeze per connection
DROP FUNCTION IF EXISTS freeze_connection(UUID);
CREATE OR REPLACE FUNCTION freeze_connection(p_connection_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_man_id UUID := auth.uid();
  v_connection RECORD;
  v_deduct JSONB;
  v_frozen_until TIMESTAMPTZ;
BEGIN
  SELECT * INTO v_connection FROM connections WHERE id = p_connection_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'connection_not_found');
  END IF;

  IF v_connection.guest_id != v_man_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'forbidden');
  END IF;

  IF v_connection.status IN ('ended', 'expired', 'rejected') THEN
    RETURN jsonb_build_object('success', false, 'error', 'connection_inactive');
  END IF;

  IF COALESCE(v_connection.freezes_used, 0) >= 1 THEN
    RETURN jsonb_build_object('success', false, 'error', 'freeze_already_used');
  END IF;

  v_deduct := deduct_coins(v_man_id, 10, 'Freeze for 24h extension', jsonb_build_object('connection_id', p_connection_id));
  IF NOT (v_deduct->>'success')::boolean THEN
    RETURN jsonb_build_object('success', false, 'error', v_deduct->>'error', 'coins_needed', 10);
  END IF;

  v_frozen_until := NOW() + INTERVAL '24 hours';

  UPDATE connections
  SET frozen_until = v_frozen_until, freezes_used = 1, updated_at = NOW()
  WHERE id = p_connection_id;

  UPDATE submissions
  SET deadline = v_frozen_until
  WHERE connection_id = p_connection_id
    AND day_number = v_connection.current_day
    AND approved != true;

  INSERT INTO freeze_transactions (connection_id, man_id, coins_paid, extended_until)
  VALUES (p_connection_id, v_man_id, 10, v_frozen_until);

  RETURN jsonb_build_object('success', true, 'frozen_until', v_frozen_until);
END;
$$;
GRANT EXECUTE ON FUNCTION freeze_connection TO authenticated;
