-- create_like(): set the 48h submit_deadline on match creation. status
-- defaults to 'pending_submission' via the previous migration's column
-- default; set it explicitly anyway for readability.
CREATE OR REPLACE FUNCTION public.create_like(p_to_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_from_user_id UUID := auth.uid();
  v_deduct JSONB;
  v_like_id UUID;
  v_match_id UUID;
BEGIN
  IF v_from_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'unauthorized');
  END IF;

  v_deduct := deduct_coins(v_from_user_id, 100, 'Meet Her Standard', jsonb_build_object('to_user_id', p_to_user_id));
  IF NOT (v_deduct->>'success')::BOOLEAN THEN
    RETURN v_deduct;
  END IF;

  INSERT INTO likes (from_user_id, to_user_id)
  VALUES (v_from_user_id, p_to_user_id)
  ON CONFLICT (from_user_id, to_user_id) DO NOTHING
  RETURNING id INTO v_like_id;

  INSERT INTO matches (user1_id, user2_id, status, submit_deadline)
  VALUES (v_from_user_id, p_to_user_id, 'pending_submission', NOW() + INTERVAL '48 hours')
  ON CONFLICT (user1_id, user2_id) DO NOTHING
  RETURNING id INTO v_match_id;

  IF v_match_id IS NULL THEN
    SELECT id INTO v_match_id FROM matches
    WHERE (user1_id = v_from_user_id AND user2_id = p_to_user_id)
       OR (user1_id = p_to_user_id AND user2_id = v_from_user_id);
  END IF;

  RETURN jsonb_build_object('success', true, 'like_id', v_like_id, 'match_id', v_match_id);
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_like(UUID) TO authenticated;

-- advance_match_day_if_complete(): unchanged trigger condition (all of the
-- day's intentions have an approved submission). Now only ever fires from
-- recompute_match_gate() below, after the woman approves -- never directly
-- from submit-task, since nothing auto-approves anymore.
--
-- Deadline relationship: next_day_unlocks_at is the 24h "come back
-- tomorrow" gate; submit_deadline is the 48h "you must submit once you're
-- back" window. submit_deadline is anchored to next_day_unlocks_at (not to
-- "now"/approval time) so the man isn't burning submission time during the
-- 24h he structurally cannot act -- he gets the full 48h starting from when
-- day N+1 actually unlocks.
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
      UPDATE matches
      SET current_day = current_day + 1,
          next_day_unlocks_at = v_next_unlock,
          submit_deadline = v_next_unlock + INTERVAL '48 hours',
          status = 'pending_submission'
      WHERE id = p_match_id;
      v_day_advanced := true;
    ELSE
      UPDATE matches
      SET status = 'completed', chat_unlocked = true, completed_at = NOW(),
          next_day_unlocks_at = NULL, submit_deadline = NULL, review_deadline = NULL
      WHERE id = p_match_id;
      INSERT INTO funnel_events (match_id, event_type) VALUES (p_match_id, 'chat_unlocked');
      v_day_advanced := true;
      v_chat_unlocked := true;
    END IF;
  END IF;

  RETURN jsonb_build_object('day_advanced', v_day_advanced, 'chat_unlocked', v_chat_unlocked, 'next_day_unlocks_at', v_next_unlock);
END;
$$;

-- New: single source of truth for matches.status/review_deadline given the
-- current state of `submissions` for the match's current_day. Called from
-- submit-task (after inserting a pending submission) and review-task (after
-- an approve decision). A day can have 1-3 tasks (intentions.day_number/
-- task_number), so "the man submitted something" and "everything for the
-- day is approved" are different conditions that both need to be re-derived
-- after every mutation -- doing that inline in two separate TS routes would
-- duplicate and drift.
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

  -- "Pending" here = submitted but not yet approved. MIN(submitted_at)
  -- anchors review_deadline to the OLDEST outstanding item, so a second
  -- task submitted while the first is still awaiting review doesn't push
  -- her clock out further.
  SELECT COUNT(*), MIN(submitted_at) INTO v_pending_count, v_oldest_pending
  FROM submissions
  WHERE match_id = p_match_id
    AND day_number = v_current_day
    AND submitted_at IS NOT NULL
    AND approved IS NOT TRUE;

  IF v_pending_count > 0 THEN
    UPDATE matches
    SET status = 'pending_review', review_deadline = v_oldest_pending + INTERVAL '72 hours'
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

NOTIFY pgrst, 'reload schema';
