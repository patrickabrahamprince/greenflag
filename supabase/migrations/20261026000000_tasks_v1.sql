-- Tasks v1: core monetization loop. 5 coins, 8 tasks, 48h deadline.

BEGIN;

-- 1.1 Connections: overhaul status workflow
ALTER TABLE connections
ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS chat_unlocked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS host_reviewed_at TIMESTAMPTZ;

-- Drop old CHECK if exists, add new
ALTER TABLE connections DROP CONSTRAINT IF EXISTS connections_status_check;
ALTER TABLE connections ADD CONSTRAINT connections_status_check
  CHECK (status IN ('pending','tasks_submitted','approved','rejected','chat_unlocked','expired'));

-- 1.2 Task submissions table
CREATE TABLE IF NOT EXISTS task_submissions (
  id BIGSERIAL PRIMARY KEY,
  connection_id UUID NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
  task_number INT NOT NULL CHECK (task_number BETWEEN 1 AND 8),
  content_type TEXT NOT NULL CHECK (content_type IN ('text','image')),
  text_content TEXT,
  media_url TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(connection_id, task_number)
);

-- 1.3 Host standards (8 tasks per host)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS standards JSONB DEFAULT '[]'::jsonb;

-- 1.4 Coin transactions log
CREATE TABLE IF NOT EXISTS coin_transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('spend','refund','purchase','bonus')),
  description TEXT,
  connection_id UUID REFERENCES connections(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.5 RPC: Start connection + deduct 5 coins + 48h deadline
CREATE OR REPLACE FUNCTION start_connection(p_host_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_guest_id UUID := auth.uid();
  v_connection_id UUID;
  v_coins INT;
  v_host_name TEXT;
BEGIN
  SELECT coins INTO v_coins FROM profiles WHERE id = v_guest_id;
  IF v_coins < 5 THEN
    RAISE EXCEPTION 'Insufficient coins. Need 5, have %', v_coins;
  END IF;

  IF EXISTS (SELECT 1 FROM connections WHERE host_id = p_host_id AND guest_id = v_guest_id AND status NOT IN ('rejected','expired')) THEN
    RAISE EXCEPTION 'Already connected or pending';
  END IF;

  SELECT name INTO v_host_name FROM profiles WHERE id = p_host_id AND gender = 'host';
  IF v_host_name IS NULL THEN RAISE EXCEPTION 'Host not found'; END IF;

  UPDATE profiles SET coins = coins - 5 WHERE id = v_guest_id;

  INSERT INTO connections (host_id, guest_id, status, deadline)
  VALUES (p_host_id, v_guest_id, 'pending', NOW() + INTERVAL '48 hours')
  RETURNING id INTO v_connection_id;

  INSERT INTO coin_transactions (user_id, amount, type, description, connection_id)
  VALUES (v_guest_id, -5, 'spend', 'Applied to ' || v_host_name, v_connection_id);

  RETURN json_build_object(
    'connection_id', v_connection_id,
    'deadline', (NOW() + INTERVAL '48 hours')::TEXT
  );
END;
$$;

-- 1.6 RPC: Submit a single task
CREATE OR REPLACE FUNCTION submit_task(
  p_connection_id UUID,
  p_task_number INT,
  p_text TEXT DEFAULT NULL,
  p_media_url TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deadline TIMESTAMPTZ;
  v_status TEXT;
  v_count INT;
BEGIN
  SELECT deadline, status INTO v_deadline, v_status
  FROM connections WHERE id = p_connection_id AND guest_id = auth.uid();

  IF v_deadline IS NULL THEN RAISE EXCEPTION 'Connection not found'; END IF;
  IF NOW() > v_deadline THEN RAISE EXCEPTION 'Deadline expired'; END IF;
  IF v_status NOT IN ('pending','tasks_submitted') THEN RAISE EXCEPTION 'Cannot submit in status %', v_status; END IF;

  INSERT INTO task_submissions (connection_id, task_number, text_content, media_url, content_type)
  VALUES (
    p_connection_id,
    p_task_number,
    p_text,
    p_media_url,
    CASE WHEN p_media_url IS NOT NULL THEN 'image' ELSE 'text' END
  )
  ON CONFLICT (connection_id, task_number)
  DO UPDATE SET text_content = p_text, media_url = p_media_url, submitted_at = NOW();

  SELECT COUNT(*) INTO v_count FROM task_submissions WHERE connection_id = p_connection_id;
  UPDATE connections SET tasks_completed = v_count WHERE id = p_connection_id;

  IF v_count = 8 THEN
    UPDATE connections SET status = 'tasks_submitted' WHERE id = p_connection_id AND status = 'pending';
  END IF;

  RETURN json_build_object('tasks_completed', v_count);
END;
$$;

-- 1.7 RPC: Host approve or reject
CREATE OR REPLACE FUNCTION review_connection(p_connection_id UUID, p_approve BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_guest_id UUID;
  v_host_id UUID;
BEGIN
  SELECT guest_id, host_id INTO v_guest_id, v_host_id
  FROM connections WHERE id = p_connection_id AND host_id = auth.uid();

  IF v_host_id IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  IF p_approve THEN
    UPDATE connections
    SET status = 'chat_unlocked', chat_unlocked_at = NOW(), host_reviewed_at = NOW()
    WHERE id = p_connection_id;
  ELSE
    UPDATE connections
    SET status = 'rejected', host_reviewed_at = NOW()
    WHERE id = p_connection_id;

    UPDATE profiles SET coins = coins + 5 WHERE id = v_guest_id;

    INSERT INTO coin_transactions (user_id, amount, type, description, connection_id)
    VALUES (v_guest_id, 5, 'refund', 'Application rejected', p_connection_id);
  END IF;
END;
$$;

-- 1.8 RPC: Expire connections past deadline
CREATE OR REPLACE FUNCTION expire_connections()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE connections
  SET status = 'expired'
  WHERE status IN ('pending','tasks_submitted') AND deadline < NOW();
END;
$$;

-- 1.9 RLS
ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "participants_view_tasks" ON task_submissions FOR SELECT
USING (EXISTS (SELECT 1 FROM connections WHERE id = connection_id AND (guest_id = auth.uid() OR host_id = auth.uid())));

CREATE POLICY "guests_submit_own_tasks" ON task_submissions FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM connections WHERE id = connection_id AND guest_id = auth.uid()));

CREATE POLICY "users_view_own_transactions" ON coin_transactions FOR SELECT
USING (user_id = auth.uid());

COMMIT;

NOTIFY pgrst, 'reload schema';
