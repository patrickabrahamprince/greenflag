-- Apple In-App Purchase support for coin purchases on iOS, mirroring the
-- existing Razorpay idempotent-credit pattern
-- (20261214000000_fix_coin_double_credit.sql) exactly, but keyed on
-- Apple's transactionId instead of a Razorpay payment id. A separate
-- column + separate function, not a reuse of the razorpay one, so this
-- can't accidentally interact with the working web/Razorpay path.
ALTER TABLE coin_transactions ADD COLUMN IF NOT EXISTS apple_transaction_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_coin_transactions_apple_transaction_id
ON coin_transactions (apple_transaction_id)
WHERE apple_transaction_id IS NOT NULL;

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

  RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
EXCEPTION WHEN unique_violation THEN
  RETURN jsonb_build_object(
    'success', true,
    'already_processed', true,
    'new_balance', (SELECT balance FROM wallets WHERE user_id = p_user_id)
  );
END;
$$;
REVOKE EXECUTE ON FUNCTION public.credit_coins_idempotent_apple FROM authenticated, anon;

NOTIFY pgrst, 'reload schema';
