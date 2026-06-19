CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('guest', 'host')),
  name TEXT NOT NULL DEFAULT '',
  age INT CHECK (age >= 18 AND age <= 60),
  city TEXT,
  city_auto TEXT,
  lat FLOAT,
  lng FLOAT,
  bio TEXT,
  photos TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  looking_for_interests TEXT[] DEFAULT '{}',
  instagram_handle TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_profiles_interests ON profiles USING GIN (interests);
CREATE INDEX idx_profiles_looking_for ON profiles USING GIN (looking_for_interests);

-- WALLETS + TRANSACTIONS
CREATE TABLE public.wallets (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INT NOT NULL DEFAULT 0 CHECK (balance >= 0),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('purchase', 'spend', 'refund', 'admin_grant')),
  amount INT NOT NULL,
  balance_after INT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_transactions_user_time ON transactions(user_id, created_at DESC);

-- STANDARDS = TESTS
CREATE TABLE public.tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  day INT CHECK (day >= 1 AND day <= 8),
  description TEXT NOT NULL,
  type TEXT CHECK (type IN ('photo', 'voice', 'text', 'location')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONNECTIONS
CREATE TABLE public.connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  host_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'frozen')),
  tasks_completed INT DEFAULT 0,
  frozen_count INT DEFAULT 0,
  expires_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(test_id, guest_id)
);

-- SUBMISSIONS
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID REFERENCES connections(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  proof_url TEXT,
  proof_text TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected')),
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- MESSAGES
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID REFERENCES connections(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MOD QUEUE
CREATE TABLE public.mod_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (is_active = true);
CREATE POLICY "profiles_self_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "wallets_self_read" ON wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "transactions_self_read" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "connections_participant" ON connections FOR ALL USING (auth.uid() = guest_id OR auth.uid() = host_id);
CREATE POLICY "submissions_participant" ON submissions FOR ALL USING (
  EXISTS (SELECT 1 FROM connections WHERE id = connection_id AND (guest_id = auth.uid() OR host_id = auth.uid()))
);
CREATE POLICY "messages_participant" ON messages FOR ALL USING (
  EXISTS (SELECT 1 FROM connections WHERE id = connection_id AND (guest_id = auth.uid() OR host_id = auth.uid()))
);

-- AUTO WALLET
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (user_id, balance) VALUES (NEW.id, 0);
  INSERT INTO profiles (id, role) VALUES (NEW.id, 'guest');
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RPC: deduct_coins
CREATE OR REPLACE FUNCTION deduct_coins(p_user_id UUID, p_amount INT, p_description TEXT, p_metadata JSONB DEFAULT '{}')
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_balance INT; v_new_balance INT;
BEGIN
  SELECT balance INTO v_balance FROM wallets WHERE user_id = p_user_id FOR UPDATE;
  IF v_balance IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'wallet_not_found'); END IF;
  IF v_balance < p_amount THEN RETURN jsonb_build_object('success', false, 'error', 'insufficient_funds', 'balance', v_balance); END IF;
  v_new_balance := v_balance - p_amount;
  UPDATE wallets SET balance = v_new_balance, updated_at = NOW() WHERE user_id = p_user_id;
  INSERT INTO transactions (user_id, type, amount, balance_after, description, metadata)
  VALUES (p_user_id, 'spend', -p_amount, v_new_balance, p_description, p_metadata);
  RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
END; $$;
GRANT EXECUTE ON FUNCTION deduct_coins TO authenticated;

-- RPC: add_coins
CREATE OR REPLACE FUNCTION add_coins(p_user_id UUID, p_amount INT, p_description TEXT, p_metadata JSONB DEFAULT '{}')
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_new_balance INT;
BEGIN
  UPDATE wallets SET balance = balance + p_amount, updated_at = NOW() WHERE user_id = p_user_id RETURNING balance INTO v_new_balance;
  INSERT INTO transactions (user_id, type, amount, balance_after, description, metadata)
  VALUES (p_user_id, 'purchase', p_amount, v_new_balance, p_description, p_metadata);
  RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
END; $$;
REVOKE EXECUTE ON FUNCTION add_coins FROM authenticated, anon;
