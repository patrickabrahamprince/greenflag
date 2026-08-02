-- Rejection reason + retry system. When she rejects a task submission,
-- the whole match currently just dies silently (status='rejected', no
-- record of why). This adds a reason field he actually gets to see, plus
-- a path back to life for the match:
--   1. She nudges him from my-connections any time after rejecting ->
--      retry unlocks immediately (matches/[id]/nudge-retry).
--   2. She never nudges -> 24h after rejecting, send_retry_decision_prompts
--      below prompts her to explicitly accept or deny a retry
--      (matches/[id]/retry-decision).
--   3. Either way, once unlocked he pays coins to actually retry
--      (matches/[id]/retry), which resets the match back to
--      pending_submission and lets him resubmit the rejected task.
-- If she denies, the match row stays forever (status stays 'rejected'),
-- and get_ranked_men/get_ranked_women already exclude anyone with an
-- existing matches row between the pair regardless of status -- so a
-- denied pair is already permanently hidden from each other's Discover
-- feed with no extra blocked_pairs bookkeeping needed.
ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS retry_unlocked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS retry_decision TEXT CHECK (retry_decision IN ('pending', 'accepted', 'denied')),
  ADD COLUMN IF NOT EXISTS retry_prompt_sent_at TIMESTAMPTZ;

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Mirrors send_review_reminders() (20261213000004_review_reminder_cron.sql)
-- in shape: read GUCs for the push relay, insert the notifications row
-- regardless of whether the GUCs are set, no-op the push if they aren't.
CREATE OR REPLACE FUNCTION public.send_retry_decision_prompts()
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
  v_body TEXT;
  v_man_name TEXT;
BEGIN
  FOR v_row IN
    SELECT m.id, m.user1_id, m.user2_id
    FROM matches m
    WHERE m.status = 'rejected'
      AND m.rejected_at IS NOT NULL
      AND m.rejected_at <= NOW() - INTERVAL '24 hours'
      AND m.retry_decision IS NULL
      AND m.retry_prompt_sent_at IS NULL
  LOOP
    SELECT name INTO v_man_name FROM profiles WHERE id = v_row.user1_id;
    v_body := 'It''s been 24 hours since you passed on ' || COALESCE(v_man_name, 'him') || '. Want to give him another chance?';

    UPDATE matches SET retry_decision = 'pending', retry_prompt_sent_at = NOW() WHERE id = v_row.id;

    INSERT INTO notifications (user_id, title, body, data)
    VALUES (v_row.user2_id, 'Give him another chance?', v_body,
            jsonb_build_object('connectionId', v_row.id, 'type', 'retry_decision'));

    IF v_supabase_url IS NOT NULL AND v_service_role_key IS NOT NULL THEN
      PERFORM net.http_post(
        url := v_supabase_url || '/functions/v1/send-push',
        headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_service_role_key),
        body := jsonb_build_object('userId', v_row.user2_id, 'title', 'Give him another chance?', 'body', v_body, 'url', '/my-connections')
      );
    END IF;

    v_sent := v_sent + 1;
  END LOOP;

  RETURN jsonb_build_object('sent', v_sent);
END;
$$;
REVOKE ALL ON FUNCTION public.send_retry_decision_prompts() FROM PUBLIC;

DO $$
BEGIN
  PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'send-retry-decision-prompts';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule('send-retry-decision-prompts', '*/15 * * * *', $$SELECT public.send_retry_decision_prompts();$$);
