CREATE OR REPLACE FUNCTION public.sweep_expired_matches()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expired_submission_count INT := 0;
  v_refunded_count INT := 0;
  v_row RECORD;
BEGIN
  -- (a) He never submitted in time. No refund -- he controlled the timing.
  WITH expired_submission AS (
    UPDATE matches
    SET status = 'expired_no_submission', next_day_unlocks_at = NULL
    WHERE status = 'pending_submission'
      AND submit_deadline IS NOT NULL
      AND submit_deadline < NOW()
    RETURNING id
  )
  INSERT INTO funnel_events (match_id, event_type)
  SELECT id, 'expired_no_submission' FROM expired_submission;
  GET DIAGNOSTICS v_expired_submission_count = ROW_COUNT;

  -- (b) She never reviewed in time. Refund HIM his 10 coins (he's the one
  -- who spent them on a submission that went un-reviewed), ding her
  -- late_review_count. Uses wallets/add_coins/transactions, not the legacy
  -- coin_transactions table.
  FOR v_row IN
    SELECT id, user1_id, user2_id
    FROM matches
    WHERE status = 'pending_review'
      AND review_deadline IS NOT NULL
      AND review_deadline < NOW()
    FOR UPDATE SKIP LOCKED
  LOOP
    UPDATE matches
    SET status = 'refunded', refund_issued = true, next_day_unlocks_at = NULL
    WHERE id = v_row.id;

    PERFORM public.add_coins(
      v_row.user1_id, 10, 'Auto-refund: review deadline missed',
      jsonb_build_object('match_id', v_row.id)
    );

    UPDATE profiles SET late_review_count = late_review_count + 1 WHERE id = v_row.user2_id;

    INSERT INTO funnel_events (match_id, event_type) VALUES (v_row.id, 'refunded');

    v_refunded_count := v_refunded_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'expired_no_submission', v_expired_submission_count,
    'refunded', v_refunded_count
  );
END;
$$;
REVOKE ALL ON FUNCTION public.sweep_expired_matches() FROM PUBLIC;

-- Supabase-documented pattern for enabling pg_cron.
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

DO $$
BEGIN
  PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'sweep-expired-matches';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule('sweep-expired-matches', '*/15 * * * *', $$SELECT public.sweep_expired_matches();$$);
