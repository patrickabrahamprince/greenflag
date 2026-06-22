-- Rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  action TEXT NOT NULL,
  count INT NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(identifier, action, window_start)
);

CREATE INDEX idx_rate_limits_lookup ON rate_limits(identifier, action, window_start);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can access
CREATE POLICY "service_only_rate_limits" ON rate_limits
  FOR ALL USING (auth.role() = 'service_role');

GRANT ALL ON rate_limits TO service_role;

-- RPC: Check and increment rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier TEXT,
  p_action TEXT,
  p_max_requests INT,
  p_window_seconds INT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_count INT;
BEGIN
  v_window_start := date_trunc('minute', NOW()) - (EXTRACT(minute FROM NOW())::INT % p_window_seconds) * INTERVAL '1 second';

  SELECT count INTO v_count
  FROM rate_limits
  WHERE identifier = p_identifier
    AND action = p_action
    AND window_start >= v_window_start;

  IF v_count IS NULL THEN
    v_count := 0;
  END IF;

  IF v_count >= p_max_requests THEN
    RETURN json_build_object(
      'allowed', false,
      'retry_after', p_window_seconds - EXTRACT(epoch FROM (NOW() - v_window_start))::INT
    );
  END IF;

  INSERT INTO rate_limits (identifier, action, count, window_start)
  VALUES (p_identifier, p_action, 1, v_window_start)
  ON CONFLICT (identifier, action, window_start)
  DO UPDATE SET count = rate_limits.count + 1;

  RETURN json_build_object('allowed', true, 'remaining', p_max_requests - v_count - 1);
END;
$$;

GRANT EXECUTE ON FUNCTION check_rate_limit TO service_role;
