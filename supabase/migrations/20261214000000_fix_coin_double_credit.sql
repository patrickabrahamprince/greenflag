-- Isolated hotfix: coin double-credit on Razorpay webhook retry.
-- Separate from the pending match-state-machine migration batch; unrelated
-- root cause, ships independently.
--
-- CORRECTED VERSION: the first version of this migration assumed
-- add_coins() writes to `transactions` (per the tracked
-- 20261019000000_init.sql), and targeted a new constraint there. That
-- failed on production with "column metadata does not exist on
-- transactions" -- direct verification against production (disposable
-- test user, real RPC call, inspected before/after rows) showed:
--   - production's `transactions` table is a different, unrelated,
--     currently-EMPTY (0 rows) table -- not what add_coins() writes to
--     at all, despite matching the tracked migration file.
--   - add_coins() actually writes to wallets + coin_transactions (the
--     table with 35 real historical spend rows).
--   - coin_transactions.razorpay_payment_id already has a real, working
--     UNIQUE INDEX (idx_coin_transactions_razorpay_payment_id, confirmed
--     by directly triggering a duplicate-key error against it) -- but
--     add_coins(), even called exactly as the webhook calls it with
--     razorpay_payment_id in p_metadata, never actually writes that value
--     into the column the index guards. It just stays null forever, so
--     the index never catches anything.
--   - add_coins()'s exact current body could not be read (no SQL/CLI
--     access to production, only REST-API-observable behavior), so
--     rather than guess at a full CREATE OR REPLACE that might drop
--     unknown existing behavior, this fix adds a NEW, narrow function
--     used only by the webhook path -- add_coins() itself is left
--     completely untouched, so nothing else that may currently call it
--     is put at risk.
--
-- credit_coins_idempotent(): inserts the coin_transactions row FIRST, with
-- the real razorpay_payment_id in its own column. If that payment id was
-- already recorded, the existing unique index throws here, before any
-- balance change happens -- a duplicate becomes a safe no-op. Only after
-- a successful insert does the wallet balance get updated.
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

  RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
EXCEPTION WHEN unique_violation THEN
  RETURN jsonb_build_object(
    'success', true,
    'already_processed', true,
    'new_balance', (SELECT balance FROM wallets WHERE user_id = p_user_id)
  );
END;
$$;
REVOKE EXECUTE ON FUNCTION public.credit_coins_idempotent FROM authenticated, anon;

NOTIFY pgrst, 'reload schema';
