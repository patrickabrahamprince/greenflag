-- send_retry_decision_prompts() selected rows WHERE retry_decision IS
-- NULL, then unconditionally ran `UPDATE matches SET retry_decision =
-- 'pending' ... WHERE id = v_row.id` per row with no re-check at update
-- time. If her manual nudge/accept (nudge-retry or retry-decision, which
-- set retry_decision = 'accepted') committed in the window between this
-- function's SELECT and its per-row UPDATE, the cron would silently
-- clobber her acceptance back to 'pending' while retry_unlocked_at stayed
-- set -- a contradictory combination the client's canRetry check
-- (task/[matchId]/page.tsx) doesn't expect. Re-checking retry_decision IS
-- NULL in the UPDATE's WHERE clause closes that: the loser of the race
-- (whichever commits second) just updates 0 rows instead of overwriting
-- the winner.
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
  v_claimed INT;
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
    UPDATE matches SET retry_decision = 'pending', retry_prompt_sent_at = NOW()
    WHERE id = v_row.id AND retry_decision IS NULL;
    GET DIAGNOSTICS v_claimed = ROW_COUNT;

    -- Someone else (a manual nudge/accept) already resolved this row
    -- between the SELECT above and this UPDATE -- nothing to prompt her
    -- about anymore.
    CONTINUE WHEN v_claimed = 0;

    SELECT name INTO v_man_name FROM profiles WHERE id = v_row.user1_id;
    v_body := 'It''s been 24 hours since you passed on ' || COALESCE(v_man_name, 'him') || '. Want to give him another chance?';

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

-- standards had no uniqueness guarantee on woman_id, and save-draft's
-- check-then-insert (SELECT existing -> if none, INSERT) has no debounce
-- on the client's Continue button while the request is in flight. A
-- double-fired first draft-save could create two rows for the same
-- woman; both save-draft's and standard-builder's GET use .limit(1) with
-- no ORDER BY, so a later load could nondeterministically pick either
-- one, looking like lost progress. De-dupe existing rows first (keep the
-- active one if there is one, else the most recent), then add the
-- constraint so it can't happen again.
DELETE FROM standards s
WHERE s.id NOT IN (
  SELECT DISTINCT ON (woman_id) id
  FROM standards
  ORDER BY woman_id, is_active DESC NULLS LAST, created_at DESC
);

ALTER TABLE standards ADD CONSTRAINT standards_woman_id_unique UNIQUE (woman_id);

NOTIFY pgrst, 'reload schema';
