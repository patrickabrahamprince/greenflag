-- Use existing profiles table from Greenflag app
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS coins_balance INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS profiles_phone_idx ON profiles(phone);

-- Coin packs shown on web
CREATE TABLE coin_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coins INTEGER NOT NULL,
  price_inr INTEGER NOT NULL, -- paise: 7900 = ₹79.00
  app_store_price_inr INTEGER NOT NULL, -- for "Save X%" badge
  label TEXT, -- "Most Popular", "Best Value"
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO coin_packs (coins, price_inr, app_store_price_inr, label, active, sort_order) VALUES
(100, 7900, 9900, null, true, 1),
(500, 34900, 44900, 'Most Popular', true, 2),
(1200, 79900, 99900, 'Best Value', true, 3),
(3000, 199900, 249900, null, true, 4);

-- Transaction log
CREATE TABLE coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  amount_inr INTEGER NOT NULL,
  coins_added INTEGER NOT NULL,
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, success, failed
  source TEXT DEFAULT 'web', -- web, ios_iap, android
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX coin_tx_user_idx ON coin_transactions(user_id, created_at DESC);
CREATE INDEX coin_tx_rzp_order_idx ON coin_transactions(razorpay_order_id);
CREATE INDEX coin_tx_status_idx ON coin_transactions(status, created_at) WHERE status='pending';

-- RLS
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tx_self_read" ON coin_transactions FOR SELECT USING (user_id = auth.uid());

ALTER TABLE coin_packs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "packs_public_read" ON coin_packs FOR SELECT TO anon, authenticated USING (active = true);

-- Idempotent credit function - prevents double credit on webhook retry
CREATE OR REPLACE FUNCTION credit_coins_on_payment(
  p_rzp_payment_id TEXT,
  p_rzp_order_id TEXT
) RETURNS JSONB AS $$
DECLARE
  v_tx RECORD;
  v_result JSONB;
BEGIN
  -- Lock transaction row
  SELECT * INTO v_tx FROM coin_transactions 
  WHERE razorpay_order_id = p_rzp_order_id FOR UPDATE;
  
  IF NOT FOUND THEN 
    RETURN jsonb_build_object('error', 'Order not found');
  END IF;
  
  IF v_tx.status = 'success' THEN 
    RETURN jsonb_build_object('status', 'already_processed'); -- Idempotent
  END IF;
  
  -- Credit coins
  UPDATE profiles 
  SET coins_balance = coins_balance + v_tx.coins_added,
      updated_at = NOW()
  WHERE id = v_tx.user_id;
  
  -- Mark success
  UPDATE coin_transactions 
  SET status = 'success', 
      razorpay_payment_id = p_rzp_payment_id,
      updated_at = NOW()
  WHERE id = v_tx.id;
  
  RETURN jsonb_build_object('status', 'success', 'coins_added', v_tx.coins_added);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
