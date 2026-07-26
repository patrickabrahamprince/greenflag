-- Shrinks the review window from 72 hours to 24 hours: a woman now has a
-- full day (not three) to review a submission before it counts against
-- the match. Only the interval changes -- the rest of recompute_match_gate
-- is copied verbatim from 20261213000001_review_task_flow.sql.
CREATE OR REPLACE FUNCTION public.recompute_match_gate(p_match_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_day INT;
  v_status match_status;
  v_pending_count INT;
  v_oldest_pending TIMESTAMPTZ;
  v_advance_result JSONB;
BEGIN
  SELECT current_day, status INTO v_current_day, v_status
  FROM matches WHERE id = p_match_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'match_not_found');
  END IF;

  IF v_status IN ('rejected', 'expired_no_submission', 'refunded', 'completed') THEN
    RETURN jsonb_build_object('status', v_status, 'day_advanced', false, 'chat_unlocked', false);
  END IF;

  SELECT COUNT(*), MIN(submitted_at) INTO v_pending_count, v_oldest_pending
  FROM submissions
  WHERE match_id = p_match_id
    AND day_number = v_current_day
    AND submitted_at IS NOT NULL
    AND approved IS NOT TRUE;

  IF v_pending_count > 0 THEN
    UPDATE matches
    SET status = 'pending_review', review_deadline = v_oldest_pending + INTERVAL '24 hours'
    WHERE id = p_match_id;
    RETURN jsonb_build_object('status', 'pending_review', 'day_advanced', false, 'chat_unlocked', false);
  END IF;

  UPDATE matches SET status = 'pending_submission', review_deadline = NULL WHERE id = p_match_id;
  v_advance_result := public.advance_match_day_if_complete(p_match_id);

  SELECT status INTO v_status FROM matches WHERE id = p_match_id;
  RETURN v_advance_result || jsonb_build_object('status', v_status);
END;
$$;
GRANT EXECUTE ON FUNCTION public.recompute_match_gate(UUID) TO authenticated;

-- The 24h/6h/1h reminder cadence from 20261213000004_review_reminder_cron.sql
-- assumed a 72h window -- with only 24h total, the "24h left" tier fired
-- almost immediately (redundant with the "submission ready" notification
-- already sent at submit time). Rescaled to 12h/3h/1h for the shorter
-- window; reuses the existing review_reminder_24h_sent/_6h_sent/_1h_sent
-- columns as-is (just checked against different hour thresholds) rather
-- than renaming them, to avoid an unnecessary column migration.
CREATE OR REPLACE FUNCTION public.send_review_reminders()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row RECORD;
  v_sent INT := 0;
  v_supabase_url TEXT := current_setting('app.settings.supabase_url', true);
  v_service_role_key TEXT := current_setting('app.settings.service_role_key', true);
  v_hours_left NUMERIC;
  v_body TEXT;
BEGIN
  FOR v_row IN
    SELECT m.id, m.user2_id, m.review_deadline,
           m.review_reminder_24h_sent, m.review_reminder_6h_sent, m.review_reminder_1h_sent
    FROM matches m
    WHERE m.status = 'pending_review' AND m.review_deadline IS NOT NULL
      AND (NOT m.review_reminder_24h_sent OR NOT m.review_reminder_6h_sent OR NOT m.review_reminder_1h_sent)
  LOOP
    v_hours_left := EXTRACT(EPOCH FROM (v_row.review_deadline - NOW())) / 3600.0;

    IF v_hours_left <= 1 AND NOT v_row.review_reminder_1h_sent THEN
      v_body := 'Last hour to review -- after this it auto-refunds him.';
      UPDATE matches SET review_reminder_1h_sent = true WHERE id = v_row.id;
    ELSIF v_hours_left <= 3 AND NOT v_row.review_reminder_6h_sent THEN
      v_body := 'About 3 hours left to review before it auto-refunds him.';
      UPDATE matches SET review_reminder_6h_sent = true WHERE id = v_row.id;
    ELSIF v_hours_left <= 12 AND NOT v_row.review_reminder_24h_sent THEN
      v_body := 'You have about 12 hours left to review his submission.';
      UPDATE matches SET review_reminder_24h_sent = true WHERE id = v_row.id;
    ELSE
      CONTINUE;
    END IF;

    INSERT INTO notifications (user_id, title, body, data)
    VALUES (v_row.user2_id, 'Review reminder', v_body,
            jsonb_build_object('connectionId', v_row.id, 'type', 'review_reminder'));

    IF v_supabase_url IS NOT NULL AND v_service_role_key IS NOT NULL THEN
      PERFORM net.http_post(
        url := v_supabase_url || '/functions/v1/send-push',
        headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_service_role_key),
        body := jsonb_build_object('userId', v_row.user2_id, 'title', 'Review reminder', 'body', v_body, 'url', '/task/' || v_row.id)
      );
    END IF;

    v_sent := v_sent + 1;
  END LOOP;

  RETURN jsonb_build_object('sent', v_sent);
END;
$$;
REVOKE ALL ON FUNCTION public.send_review_reminders() FROM PUBLIC;

NOTIFY pgrst, 'reload schema';
