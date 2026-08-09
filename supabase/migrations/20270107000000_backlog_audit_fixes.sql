-- Remaining backlog items from the same full-app audit, lower severity
-- than 20270106000000_critical_security_audit_fixes.sql (no live
-- exploit, but real correctness/data-integrity gaps worth closing).

-- 1. credit_coins_idempotent[_apple] reported success even when the
-- wallet UPDATE matched zero rows (no wallets row for that user), since
-- v_new_balance just stayed NULL and nothing checked for that. A real
-- Apple purchase completing for a user with a missing wallet row would
-- charge them, record the coin_transactions purchase row, but never
-- actually credit a balance -- returning {success:true, new_balance:
-- null} that the client would then happily setBalance(null) with, and
-- since the caller only checks creditErr || !result (truthy for this
-- shape), finishTransaction() would still be called, so StoreKit would
-- never retry it either. Checking FOUND after the UPDATE closes this.
CREATE OR REPLACE FUNCTION public.credit_coins_idempotent_apple(
  p_user_id UUID,
  p_amount INT,
  p_description TEXT,
  p_apple_transaction_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance INT;
BEGIN
  INSERT INTO coin_transactions (user_id, amount, type, description, apple_transaction_id)
  VALUES (p_user_id, p_amount, 'purchase', p_description, p_apple_transaction_id);

  UPDATE wallets SET balance = balance + p_amount, updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING balance INTO v_new_balance;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'wallet_not_found');
  END IF;

  RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
EXCEPTION WHEN unique_violation THEN
  RETURN jsonb_build_object(
    'success', true,
    'already_processed', true,
    'new_balance', (SELECT balance FROM wallets WHERE user_id = p_user_id)
  );
END;
$$;

-- credit_coins_idempotent (Razorpay-era) is dead code (edge functions
-- that called it were deleted this session), but patched identically
-- for consistency in case it's ever reused.
CREATE OR REPLACE FUNCTION public.credit_coins_idempotent(
  p_user_id UUID,
  p_amount INT,
  p_description TEXT,
  p_razorpay_payment_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance INT;
BEGIN
  INSERT INTO coin_transactions (user_id, amount, type, description, razorpay_payment_id)
  VALUES (p_user_id, p_amount, 'purchase', p_description, p_razorpay_payment_id);

  UPDATE wallets SET balance = balance + p_amount, updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING balance INTO v_new_balance;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'wallet_not_found');
  END IF;

  RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
EXCEPTION WHEN unique_violation THEN
  RETURN jsonb_build_object(
    'success', true,
    'already_processed', true,
    'new_balance', (SELECT balance FROM wallets WHERE user_id = p_user_id)
  );
END;
$$;

-- 2. blocked_pairs' "users_own_blocks" policy was FOR ALL, letting the
-- BLOCKED party (guest_id) delete the block against them just as easily
-- as the person who created it (host_id) -- silently undoing someone
-- else's safety action. No unblock feature exists anywhere in the app
-- today (grepped: only admin/account-deletion cleanup routes touch this
-- table, all via the service-role client, which bypasses RLS entirely),
-- so removing the client-reachable write path breaks nothing real.
-- SELECT stays as-is: app/api/messages/route.ts's block check runs on
-- the session client and needs either party to be able to read a pair
-- involving themselves.
DROP POLICY IF EXISTS "users_own_blocks" ON public.blocked_pairs;

CREATE POLICY "blocked_pairs_select_own" ON public.blocked_pairs
  FOR SELECT TO authenticated
  USING (auth.uid() = host_id OR auth.uid() = guest_id);

CREATE POLICY "blocked_pairs_insert_own" ON public.blocked_pairs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = host_id);

-- 3. coin_transactions.user_id had no FK to profiles at all -- purely a
-- convention that account-deletion routes remember to clean these rows
-- up manually, not a DB guarantee. Added NOT VALID since 7 pre-existing
-- orphaned user_ids exist from earlier test data (confirmed by query) --
-- this enforces the constraint for all future inserts without requiring
-- either deleting that transaction history or validating it retroactively.
ALTER TABLE public.coin_transactions
  ADD CONSTRAINT coin_transactions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
  NOT VALID;

-- 4. send_review_reminders() had the exact check-then-act race already
-- fixed for send_retry_decision_prompts() (20261231000000) -- the
-- reminder-sent flag UPDATE didn't re-check the flag in its WHERE
-- clause, so two overlapping cron runs could both see it unset and both
-- send the same reminder. Re-checking the flag in the WHERE clause and
-- skipping the notification when a concurrent run already claimed it.
CREATE OR REPLACE FUNCTION public.send_review_reminders()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row RECORD;
  v_sent INT := 0;
  v_claimed INT;
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
      UPDATE matches SET review_reminder_1h_sent = true
      WHERE id = v_row.id AND review_reminder_1h_sent = false;
    ELSIF v_hours_left <= 3 AND NOT v_row.review_reminder_6h_sent THEN
      v_body := 'About 3 hours left to review before it auto-refunds him.';
      UPDATE matches SET review_reminder_6h_sent = true
      WHERE id = v_row.id AND review_reminder_6h_sent = false;
    ELSIF v_hours_left <= 12 AND NOT v_row.review_reminder_24h_sent THEN
      v_body := 'You have about 12 hours left to review his submission.';
      UPDATE matches SET review_reminder_24h_sent = true
      WHERE id = v_row.id AND review_reminder_24h_sent = false;
    ELSE
      CONTINUE;
    END IF;

    GET DIAGNOSTICS v_claimed = ROW_COUNT;
    CONTINUE WHEN v_claimed = 0;

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
