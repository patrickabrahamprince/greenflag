-- Enable RLS on mod_queue table (was missing from init migration)
ALTER TABLE mod_queue ENABLE ROW LEVEL SECURITY;

-- Admin-only access to mod_queue
CREATE POLICY "admin_only_mod_queue" ON mod_queue FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Ensure coin_transactions has a unique constraint for idempotency
-- (prevents duplicate coin credits from webhook replays)
CREATE UNIQUE INDEX IF NOT EXISTS idx_coin_transactions_razorpay_payment_id 
ON coin_transactions (razorpay_payment_id) 
WHERE razorpay_payment_id IS NOT NULL;
