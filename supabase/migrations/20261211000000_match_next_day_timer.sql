-- Adds a real 24h gate before the next day's tasks unlock, instead of
-- letting a man do all 3 days back-to-back the moment he finishes one.
ALTER TABLE matches ADD COLUMN IF NOT EXISTS next_day_unlocks_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.advance_match_day_if_complete(p_match_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_day INT;
  v_woman_id UUID;
  v_standard_id UUID;
  v_total_tasks INT;
  v_approved_tasks INT;
  v_day_advanced BOOLEAN := false;
  v_chat_unlocked BOOLEAN := false;
  v_next_unlock TIMESTAMPTZ;
BEGIN
  SELECT current_day, user2_id INTO v_current_day, v_woman_id
  FROM matches WHERE id = p_match_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('day_advanced', false, 'chat_unlocked', false); END IF;

  SELECT id INTO v_standard_id
  FROM standards WHERE woman_id = v_woman_id AND is_active = true
  LIMIT 1;
  IF v_standard_id IS NULL THEN RETURN jsonb_build_object('day_advanced', false, 'chat_unlocked', false); END IF;

  SELECT COUNT(*) INTO v_total_tasks
  FROM intentions WHERE standard_id = v_standard_id AND day_number = v_current_day;

  SELECT COUNT(*) INTO v_approved_tasks
  FROM submissions
  WHERE match_id = p_match_id AND day_number = v_current_day AND approved = true;

  IF v_approved_tasks >= v_total_tasks AND v_total_tasks > 0 THEN
    IF v_current_day < 3 THEN
      v_next_unlock := NOW() + INTERVAL '24 hours';
      UPDATE matches SET current_day = current_day + 1, next_day_unlocks_at = v_next_unlock WHERE id = p_match_id;
      v_day_advanced := true;
    ELSE
      UPDATE matches
      SET status = 'completed', chat_unlocked = true, completed_at = NOW(), next_day_unlocks_at = NULL
      WHERE id = p_match_id;
      v_day_advanced := true;
      v_chat_unlocked := true;
    END IF;
  END IF;

  RETURN jsonb_build_object('day_advanced', v_day_advanced, 'chat_unlocked', v_chat_unlocked, 'next_day_unlocks_at', v_next_unlock);
END;
$$;

NOTIFY pgrst, 'reload schema';
