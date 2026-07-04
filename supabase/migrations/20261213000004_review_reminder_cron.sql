CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Reads project URL/service-role key from Postgres GUCs set once via
-- `ALTER DATABASE postgres SET app.settings.supabase_url = '...';` and
-- `ALTER DATABASE postgres SET app.settings.service_role_key = '...';`
-- run manually in the Supabase SQL editor (or via Vault). Do NOT hardcode
-- the service role key into a migration file committed to git -- if the
-- GUCs aren't set, the `notifications` row still gets written below, only
-- the push delivery no-ops.
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
    ELSIF v_hours_left <= 6 AND NOT v_row.review_reminder_6h_sent THEN
      v_body := 'About 6 hours left to review before it auto-refunds him.';
      UPDATE matches SET review_reminder_6h_sent = true WHERE id = v_row.id;
    ELSIF v_hours_left <= 24 AND NOT v_row.review_reminder_24h_sent THEN
      v_body := 'You have about 24 hours left to review his submission.';
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

DO $$
BEGIN
  PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'send-review-reminders';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule('send-review-reminders', '*/15 * * * *', $$SELECT public.send_review_reminders();$$);
