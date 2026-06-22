CREATE TABLE IF NOT EXISTS mod_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE mod_queue ENABLE ROW LEVEL SECURITY;

-- Admin-only access to mod_queue
CREATE POLICY "admin_only_mod_queue" ON mod_queue FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

ALTER TABLE coin_transactions ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_coin_transactions_razorpay_payment_id 
ON coin_transactions (razorpay_payment_id) 
WHERE razorpay_payment_id IS NOT NULL;
