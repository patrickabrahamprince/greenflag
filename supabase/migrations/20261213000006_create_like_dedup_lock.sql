-- Audit finding: create_like() (20261207000000_create_likes_matches.sql)
-- already does the balance-check+deduct atomically inside deduct_coins()
-- (SELECT ... FOR UPDATE on the wallets row, same function, same implicit
-- transaction) and already has a UNIQUE(user1_id, user2_id) constraint on
-- matches with ON CONFLICT DO NOTHING to avoid a second match row. But the
-- existing-match check only happens via that ON CONFLICT on INSERT, which
-- runs AFTER deduct_coins() has already charged the coins. Two concurrent
-- calls for the same man+woman pair (double-tap, retried request, two
-- tabs) can each pass deduct_coins() before either has inserted into
-- matches, so both get charged 100 coins while only one match row is ever
-- created -- a real double-spend, not a documentation gap.
--
-- Fix: take a transaction-scoped advisory lock keyed on the sorted pair
-- before doing anything else, and check for an existing match BEFORE
-- charging. The lock serializes concurrent calls for the same pair so the
-- existing-match check is race-free; pg_advisory_xact_lock auto-releases
-- at transaction end, no explicit unlock needed.
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
  v_lock_key BIGINT;
BEGIN
  IF v_from_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'unauthorized');
  END IF;

  -- Sort the pair before hashing so the lock key is identical regardless
  -- of which user_id is "from" vs "to".
  v_lock_key := hashtextextended(
    (SELECT string_agg(id::text, ',' ORDER BY id) FROM unnest(ARRAY[v_from_user_id, p_to_user_id]) AS id),
    0
  );
  PERFORM pg_advisory_xact_lock(v_lock_key);

  SELECT id INTO v_match_id FROM matches
  WHERE (user1_id = v_from_user_id AND user2_id = p_to_user_id)
     OR (user1_id = p_to_user_id AND user2_id = v_from_user_id);

  IF v_match_id IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'like_id', NULL, 'match_id', v_match_id);
  END IF;

  v_deduct := deduct_coins(v_from_user_id, 100, 'Meet Her Standard', jsonb_build_object('to_user_id', p_to_user_id));
  IF NOT (v_deduct->>'success')::BOOLEAN THEN
    RETURN v_deduct;
  END IF;

  INSERT INTO likes (from_user_id, to_user_id)
  VALUES (v_from_user_id, p_to_user_id)
  ON CONFLICT (from_user_id, to_user_id) DO NOTHING
  RETURNING id INTO v_like_id;

  -- ON CONFLICT kept as defense-in-depth (e.g. a hash collision serializing
  -- the wrong pairs together should never happen with a 64-bit key, but a
  -- graceful fallback beats an unhandled unique_violation if it ever does).
  INSERT INTO matches (user1_id, user2_id, status, submit_deadline)
  VALUES (v_from_user_id, p_to_user_id, 'pending_submission', NOW() + INTERVAL '48 hours')
  ON CONFLICT (user1_id, user2_id) DO NOTHING
  RETURNING id INTO v_match_id;

  IF v_match_id IS NULL THEN
    SELECT id INTO v_match_id FROM matches
    WHERE (user1_id = v_from_user_id AND user2_id = p_to_user_id)
       OR (user1_id = p_to_user_id AND user2_id = v_from_user_id);
  ELSE
    INSERT INTO funnel_events (match_id, event_type) VALUES (v_match_id, 'entered_queue');
  END IF;

  RETURN jsonb_build_object('success', true, 'like_id', v_like_id, 'match_id', v_match_id);
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_like(UUID) TO authenticated;

NOTIFY pgrst, 'reload schema';
