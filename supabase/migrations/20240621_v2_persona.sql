ALTER TABLE tests ADD COLUMN IF NOT EXISTS intentions TEXT[] DEFAULT '{}';
ALTER TABLE tests ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
ALTER TABLE connections ADD COLUMN IF NOT EXISTS test_snapshot JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'en';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS coins_balance INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS tests_intentions_idx ON tests USING GIN(intentions);
CREATE INDEX IF NOT EXISTS profiles_interests_idx ON profiles USING GIN(interests);

-- Existing coin tables from recharge system
CREATE TABLE IF NOT EXISTS coin_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coins INTEGER NOT NULL,
  price_inr INTEGER NOT NULL,
  app_store_price_inr INTEGER NOT NULL,
  label TEXT,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

INSERT INTO coin_packs (coins, price_inr, app_store_price_inr, label, active, sort_order) VALUES
(100, 7900, 9900, null, true, 1),
(500, 34900, 44900, 'Most Popular', true, 2),
(1200, 79900, 99900, 'Best Value', true, 3)
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  amount_inr INTEGER NOT NULL,
  coins_added INTEGER NOT NULL,
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  source TEXT DEFAULT 'web',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
