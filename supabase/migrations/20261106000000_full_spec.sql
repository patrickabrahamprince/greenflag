-- =====================================================
-- Full Spec Schema Overhaul
-- =====================================================

-- 1a — Rename persona values
ALTER TABLE profiles RENAME COLUMN role TO persona;
UPDATE profiles SET persona = 'woman' WHERE persona = 'host';
UPDATE profiles SET persona = 'man' WHERE persona = 'guest';
ALTER TABLE profiles ADD CONSTRAINT persona_check CHECK (persona IN ('man', 'woman'));

-- 1b — Profile additions
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS blur_key text DEFAULT gen_random_uuid()::text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS why_me_prompts text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests_have text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests_looking_for text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS connected_count integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ban_reason text;

-- 1c — Update connections table
ALTER TABLE connections ADD COLUMN IF NOT EXISTS current_day integer DEFAULT 1;
ALTER TABLE connections ADD COLUMN IF NOT EXISTS freezes_used integer DEFAULT 0;
ALTER TABLE connections ADD COLUMN IF NOT EXISTS frozen_until timestamptz;
ALTER TABLE connections ADD COLUMN IF NOT EXISTS chat_unlocked boolean DEFAULT false;
ALTER TABLE connections ADD COLUMN IF NOT EXISTS connected boolean DEFAULT false;
ALTER TABLE connections ADD COLUMN IF NOT EXISTS connected_at timestamptz;
ALTER TABLE connections ADD COLUMN IF NOT EXISTS expires_at timestamptz;
ALTER TABLE connections ADD COLUMN IF NOT EXISTS ended_reason text;

-- 1d — Update submissions table
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS day_number integer NOT NULL DEFAULT 1;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS deadline timestamptz;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS auto_approved boolean DEFAULT false;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS media_url text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS media_type text CHECK (media_type IN ('voice', 'photo', 'text'));
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS moderation_status text DEFAULT 'approved'
  CHECK (moderation_status IN ('pending', 'approved', 'rejected'));

-- 1e — Standards and intentions tables
CREATE TABLE IF NOT EXISTS standards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  woman_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE standards ADD COLUMN IF NOT EXISTS woman_id uuid;

DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='standards' AND column_name='user_id') THEN
    -- Delete from mod_queue
    DELETE FROM mod_queue WHERE submission_id IN (
      SELECT id FROM submissions WHERE connection_id IN (
        SELECT id FROM connections WHERE standard_id IN (
          SELECT id FROM standards WHERE user_id NOT IN (SELECT id FROM profiles)
        )
      )
    );

    -- Delete from submissions
    DELETE FROM submissions WHERE connection_id IN (
      SELECT id FROM connections WHERE standard_id IN (
        SELECT id FROM standards WHERE user_id NOT IN (SELECT id FROM profiles)
      )
    );

    -- Delete from task_submissions
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='task_submissions') THEN
      DELETE FROM task_submissions WHERE connection_id IN (
        SELECT id FROM connections WHERE standard_id IN (
          SELECT id FROM standards WHERE user_id NOT IN (SELECT id FROM profiles)
        )
      );
    END IF;

    -- Delete from messages
    DELETE FROM messages WHERE connection_id IN (
      SELECT id FROM connections WHERE standard_id IN (
        SELECT id FROM standards WHERE user_id NOT IN (SELECT id FROM profiles)
      )
    );

    -- Delete from coin_transactions
    DELETE FROM coin_transactions WHERE connection_id IN (
      SELECT id FROM connections WHERE standard_id IN (
        SELECT id FROM standards WHERE user_id NOT IN (SELECT id FROM profiles)
      )
    );

    -- Delete from connections
    DELETE FROM connections WHERE standard_id IN (
      SELECT id FROM standards WHERE user_id NOT IN (SELECT id FROM profiles)
    );

    -- Delete from standards
    DELETE FROM standards WHERE user_id NOT IN (SELECT id FROM profiles);
    UPDATE standards SET woman_id = user_id WHERE woman_id IS NULL;
  END IF;
END $$;

ALTER TABLE standards DROP CONSTRAINT IF EXISTS standards_woman_id_fkey;
ALTER TABLE standards ADD CONSTRAINT standards_woman_id_fkey FOREIGN KEY (woman_id) REFERENCES profiles(id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS intentions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  standard_id uuid REFERENCES standards(id) ON DELETE CASCADE,
  day_number integer NOT NULL CHECK (day_number BETWEEN 1 AND 8),
  type text NOT NULL CHECK (type IN ('voice', 'photo', 'text')),
  prompt text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(standard_id, day_number)
);

ALTER TABLE standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE intentions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Women manage own standards" ON standards;
CREATE POLICY "Women manage own standards" ON standards FOR ALL USING (woman_id = auth.uid());
DROP POLICY IF EXISTS "Anyone can read active standards" ON standards;
CREATE POLICY "Anyone can read active standards" ON standards FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Anyone can read intentions" ON intentions;
CREATE POLICY "Anyone can read intentions" ON intentions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Women manage own intentions" ON intentions;
CREATE POLICY "Women manage own intentions" ON intentions FOR ALL USING (
  EXISTS (SELECT 1 FROM standards WHERE id = standard_id AND woman_id = auth.uid())
);

-- 1f — Freeze transactions table
CREATE TABLE IF NOT EXISTS freeze_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid REFERENCES connections(id) ON DELETE CASCADE,
  man_id uuid REFERENCES profiles(id),
  coins_paid integer DEFAULT 300,
  extended_until timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE freeze_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Man can manage own freezes" ON freeze_transactions;
CREATE POLICY "Man can manage own freezes" ON freeze_transactions FOR ALL USING (man_id = auth.uid());

-- 1g — Daily discover views cap table
CREATE TABLE IF NOT EXISTS daily_discover_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  man_id uuid REFERENCES profiles(id),
  woman_id uuid REFERENCES profiles(id),
  viewed_date date DEFAULT CURRENT_DATE,
  UNIQUE(man_id, viewed_date, woman_id)
);
ALTER TABLE daily_discover_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Man manages own views" ON daily_discover_views;
CREATE POLICY "Man manages own views" ON daily_discover_views FOR ALL USING (man_id = auth.uid());

-- 1h — Coin transactions type update
ALTER TABLE coin_transactions ADD COLUMN IF NOT EXISTS type text CHECK (
  type IN ('purchase', 'begin_standard', 'freeze', 'refund', 'bonus')
);

-- 1i — Admin audit log
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  target_type text,
  target_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin only" ON audit_logs;
CREATE POLICY "Admin only" ON audit_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- 1j — Reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES profiles(id),
  reported_id uuid REFERENCES profiles(id),
  reason text NOT NULL,
  details text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create reports" ON reports;
CREATE POLICY "Users can create reports" ON reports FOR INSERT WITH CHECK (reporter_id = auth.uid());
DROP POLICY IF EXISTS "Admin can read all" ON reports;
CREATE POLICY "Admin can read all" ON reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
