-- Critical security patch following a full-codebase audit (security,
-- database/RLS, code quality, silent-failure passes) run right after the
-- app went live on real-money Apple IAP purchases. Several of these are
-- genuinely live, exploitable issues, not defense-in-depth.

-- 1. CRITICAL: credit_coins_idempotent[_apple] were REVOKEd from
-- authenticated/anon but never from PUBLIC -- the exact same blind spot
-- already found and fixed for add_coins/deduct_coins in
-- 20261217000004_revoke_coin_rpc_public_grant.sql (Postgres grants
-- EXECUTE to PUBLIC by default on function creation; every role,
-- including authenticated/anon, implicitly inherits it, so revoking from
-- named roles alone does nothing). Left unpatched here, any signed-in
-- (or anonymous) client could call credit_coins_idempotent_apple
-- directly via supabase.rpc() with a fresh fake apple_transaction_id and
-- mint unlimited coins into any wallet.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('credit_coins_idempotent', 'credit_coins_idempotent_apple')
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, authenticated, anon;', r.sig);
  END LOOP;
END $$;

-- 2. HIGH: notifications INSERT policy was `WITH CHECK (true)` -- any
-- authenticated user could insert a notification row for ANY other
-- user_id with arbitrary title/body/data (phishing/spoofing risk, since
-- `data` drives in-app deep-link routing). Every legitimate notification
-- send already goes through a service-role admin client (which bypasses
-- RLS entirely) -- app/api/messages/route.ts was the one exception,
-- fixed alongside this migration to also use the admin client. Denying
-- all direct client inserts here doesn't affect real notification
-- delivery.
DROP POLICY IF EXISTS "system_insert_notifications" ON notifications;

-- Users could never actually delete a notification (no DELETE policy
-- existed), so app/notifications/page.tsx's dismiss button was silently
-- a no-op server-side despite removing the row from local UI state --
-- same "optimistic update masking a denied write" class already fixed
-- elsewhere for admin queries. Adding the policy that was missing.
DROP POLICY IF EXISTS "users_delete_own_notifications" ON notifications;
CREATE POLICY "users_delete_own_notifications" ON notifications
  FOR DELETE USING (user_id = auth.uid());

-- 3. HIGH: messages had a single FOR ALL policy with no WITH CHECK,
-- which only verified the caller is A participant in match_id -- never
-- that sender_id = auth.uid(), and Postgres falls back to the USING
-- clause for writes when no WITH CHECK is given. Any match participant
-- could forge a message as if from their partner, or edit/delete either
-- party's messages -- undermining the report/moderation flow this app
-- depends on. Split into SELECT (unchanged -- either participant can
-- read) and a properly-scoped INSERT; no UPDATE/DELETE policy at all,
-- since nothing in the app edits or deletes a sent message.
DROP POLICY IF EXISTS "messages_participant" ON messages;

CREATE POLICY "messages_select_participant" ON messages FOR SELECT USING (
  match_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM matches WHERE id = match_id AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);

CREATE POLICY "messages_insert_own" ON messages FOR INSERT WITH CHECK (
  sender_id = auth.uid()
  AND match_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM matches
    WHERE id = match_id
      AND chat_unlocked = true
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);

-- 4. MEDIUM: gifts/nudges INSERT policies only checked from_user_id =
-- auth.uid(), with no requirement that deduct_coins() actually ran --
-- a client could insert a `gifts` row directly with an arbitrary
-- cost/gift_type (e.g. a free "diamond"), or a `nudges` row with
-- charged: true, without ever paying. Both tables are only meant to be
-- written via their server routes (app/api/gifts, app/api/nudge/[id]),
-- which already use the admin client -- removing the client-reachable
-- INSERT policy matches the pattern already used for submissions and
-- special_sends.
DROP POLICY IF EXISTS "gifts_insert_own" ON gifts;
DROP POLICY IF EXISTS "nudges_insert_own" ON nudges;

-- 5. MEDIUM: intentions had `USING (true)` with no scoping to the
-- parent standard's is_active flag (and no TO authenticated
-- restriction), unlike standards itself which correctly scopes to
-- is_active = true. Any caller -- including an anonymous one via the
-- public anon key -- could read every woman's day-by-day task prompts,
-- including drafts never made active (app/api/standards/save-draft
-- inserts is_active: false rows).
DROP POLICY IF EXISTS "Anyone can read intentions" ON intentions;
CREATE POLICY "Anyone can read intentions of active standards" ON intentions FOR SELECT USING (
  EXISTS (SELECT 1 FROM standards WHERE id = intentions.standard_id AND is_active = true)
);

-- 6. MEDIUM: is_admin()/get_my_gender() are embedded unwrapped in
-- dozens of RLS policies across nearly every table but were never
-- marked STABLE, so Postgres treats them as VOLATILE and re-evaluates
-- per row instead of once per statement -- the "RLS calling a function
-- per row" anti-pattern, at schema-wide scale.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION public.get_my_gender()
RETURNS text
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT gender FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql;

-- 7. HIGH: mark_notifications_read(p_user_id)/get_unread_count(p_user_id)
-- and mark_messages_read(p_match_id)/get_unread_messages_count(p_match_id)
-- are SECURITY DEFINER but never verified the passed-in id actually
-- belongs to/includes auth.uid() -- any authenticated user could pass
-- another user's id or an arbitrary match_id to mark someone else's
-- notifications/messages read, or read their unread counts. Adding the
-- ownership guard each was missing; existing callers already only ever
-- pass their own id, so this changes no legitimate behavior.
CREATE OR REPLACE FUNCTION public.mark_notifications_read(p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_user_id != auth.uid() THEN RETURN; END IF;
  UPDATE notifications SET read_at = NOW()
  WHERE user_id = p_user_id AND read_at IS NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_unread_count(p_user_id UUID)
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_user_id != auth.uid() THEN RETURN 0; END IF;
  RETURN (SELECT COUNT(*)::INT FROM notifications WHERE user_id = p_user_id AND read_at IS NULL);
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_messages_read(p_match_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM matches WHERE id = p_match_id AND (user1_id = auth.uid() OR user2_id = auth.uid())
  ) THEN RETURN; END IF;
  UPDATE messages
  SET read_at = NOW()
  WHERE match_id = p_match_id
    AND sender_id != auth.uid()
    AND read_at IS NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_unread_messages_count(p_match_id UUID)
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM matches WHERE id = p_match_id AND (user1_id = auth.uid() OR user2_id = auth.uid())
  ) THEN RETURN 0; END IF;
  RETURN (
    SELECT COUNT(*)::INT FROM messages
    WHERE match_id = p_match_id AND sender_id != auth.uid() AND read_at IS NULL
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.mark_notifications_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_unread_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_messages_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_unread_messages_count(UUID) TO authenticated;

-- 8. MEDIUM: admin_set_admin()'s "last admin" guard was a check-then-act
-- race (SELECT COUNT(*) then UPDATE, no lock) -- two concurrent revoke
-- calls against the last two admins could both read count=2, both pass,
-- and leave zero admins. "How many admins exist" is a global invariant,
-- not a per-row one, so a fixed advisory lock key serializes concurrent
-- calls cheaply without touching row locking elsewhere.
CREATE OR REPLACE FUNCTION admin_set_admin(p_user_id UUID, p_grant BOOLEAN DEFAULT true)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_count INT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('admin_set_admin_last_admin_guard'));

  IF NOT p_grant THEN
    SELECT COUNT(*) INTO v_admin_count FROM profiles WHERE is_admin = true;
    IF v_admin_count <= 1 THEN
      RAISE EXCEPTION 'Cannot revoke the last remaining admin';
    END IF;
  END IF;

  UPDATE profiles SET is_admin = p_grant WHERE id = p_user_id;

  INSERT INTO admin_actions (admin_id, action, target_id, metadata)
  VALUES (auth.uid(), CASE WHEN p_grant THEN 'set_admin' ELSE 'revoke_admin' END, p_user_id, '{}'::jsonb);
END;
$$;

-- 9. CRITICAL: create_like() regressed two fixes that were already made
-- and shipped (20261213000006_create_like_dedup_lock.sql) when a later
-- migration (20261218000000, raising the cost from 100 to 500) appears
-- to have been authored against an older copy of the function: the
-- pg_advisory_xact_lock guarding against a concurrent-tap coin
-- double-spend is gone, and the matches INSERT no longer sets
-- submit_deadline (no column default exists for it either -- see
-- 20261213000000_match_status_enum.sql), so every match created since
-- 20261218000000 has submit_deadline permanently NULL. sweep_expired_
-- matches() explicitly requires submit_deadline IS NOT NULL to ever
-- expire/refund a match, so a man who never submits Day 1 on a match
-- created since then sits in pending_submission forever. Restoring the
-- lock + submit_deadline + funnel_events insert from the known-good
-- version, keeping the current (deliberately raised) 500 coin cost.
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

  v_deduct := deduct_coins(v_from_user_id, 500, 'Meet Her Standard', jsonb_build_object('to_user_id', p_to_user_id));
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
  ELSE
    INSERT INTO funnel_events (match_id, event_type) VALUES (v_match_id, 'entered_queue');
  END IF;

  RETURN jsonb_build_object('success', true, 'like_id', v_like_id, 'match_id', v_match_id);
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_like(UUID) TO authenticated;

-- 10. HIGH: add_coins/deduct_coins were never retrofitted with SET
-- search_path (every other SECURITY DEFINER function touched since
-- 20261109000000_fix_auth_rls.sql was). Currently mitigated only by the
-- EXECUTE revoke from authenticated/anon/PUBLIC (20261217000002,
-- 20261217000004) -- but that grant state is documented as having
-- drifted on production once already, so this closes the underlying gap
-- instead of relying solely on the grant staying correct forever.
-- ALTER FUNCTION ... SET is a metadata-only change -- it does not touch
-- either function's actual body, so there's no risk of reverting
-- whatever the real, currently-live definition of either function is
-- (the database audit found evidence the tracked migration file for
-- these two is stale relative to production).
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('add_coins', 'deduct_coins')
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public;', r.sig);
  END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';
